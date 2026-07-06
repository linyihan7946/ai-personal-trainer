import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone, timedelta

from ..core.database import get_db
from ..core.config import get_settings, Settings
from ..core.security import create_access_token, get_current_user
from ..models.user import User
from ..models.exam import Exam
from ..models.wrong_question import WrongQuestion
from ..models.knowledge import KnowledgePoint
from ..schemas.auth import (
    SendCodeRequest,
    LoginRequest,
    LoginResponse,
    UserResponse,
)
from ..services.sms_service import send_verification_code

router = APIRouter(prefix="/auth", tags=["auth"])

# Admin phone numbers
ADMIN_PHONES = {"15915907946"}

# In-memory code store (use Redis in production)
_code_store: dict[str, str] = {}


def _generate_code() -> str:
    """Generate a random 6-digit verification code."""
    return secrets.choice("123456789") + "".join(secrets.choice("0123456789") for _ in range(5))


@router.post("/send-code")
async def send_code(req: SendCodeRequest):
    """Send verification code to phone number via UniSMS.

    Generates a random 6-digit code and sends it via SMS.
    Returns the code in debug_code for development convenience.
    """
    code = _generate_code()
    _code_store[req.phone] = code

    # Send via UniSMS
    success = await send_verification_code(req.phone, code)

    if not success:
        # Log but still return success to user (code is stored for login)
        pass

    return {"message": "验证码已发送", "debug_code": code}


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db), settings: Settings = Depends(get_settings)):
    """Login with phone number and verification code."""
    # Verify code
    stored_code = _code_store.get(req.phone)
    if not stored_code or stored_code != req.code:
        raise HTTPException(status_code=400, detail="验证码错误")

    # Clear used code
    _code_store.pop(req.phone, None)

    # Find or create user
    result = await db.execute(select(User).where(User.phone == req.phone))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            phone=req.phone,
            nickname=f"同学{req.phone[-4:]}",
            is_admin=req.phone in ADMIN_PHONES,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    elif req.phone in ADMIN_PHONES and not user.is_admin:
        user.is_admin = True
        await db.commit()

    # Generate token
    token = create_access_token(user.id, settings)

    return LoginResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            phone=user.phone,
            nickname=user.nickname,
            avatar_url=user.avatar_url,
            is_admin=user.is_admin,
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user info."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user


async def get_current_admin(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> str:
    """Verify the current user is an admin."""
    result = await db.execute(select(User).where(User.id == user_id, User.is_admin == True))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return user_id


@router.get("/admin/stats")
async def admin_stats(
    user_id: str = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin-only: get platform-wide statistics."""
    # Total users
    total_users = await db.execute(select(func.count(User.id)))
    total_users_count = total_users.scalar() or 0

    # Today's active users (users who logged in = created today, simplified)
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_users = await db.execute(
        select(func.count(User.id)).where(User.created_at >= today_start)
    )
    today_users_count = today_users.scalar() or 0

    # Total exams
    total_exams = await db.execute(select(func.count(Exam.id)))
    total_exams_count = total_exams.scalar() or 0

    # Total wrong questions (non-mastered)
    total_wq = await db.execute(
        select(func.count(WrongQuestion.id)).where(WrongQuestion.is_mastered == False)
    )
    total_wq_count = total_wq.scalar() or 0

    # Total knowledge points
    total_kp = await db.execute(select(func.count(KnowledgePoint.id)))
    total_kp_count = total_kp.scalar() or 0

    return {
        "total_users": total_users_count,
        "today_active_users": today_users_count,
        "total_exams": total_exams_count,
        "total_wrong_questions": total_wq_count,
        "total_knowledge_points": total_kp_count,
    }
