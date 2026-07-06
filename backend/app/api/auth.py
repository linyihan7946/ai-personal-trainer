from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..core.config import get_settings, Settings
from ..core.security import create_access_token
from ..models.user import User
from ..schemas.auth import (
    SendCodeRequest,
    LoginRequest,
    LoginResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory code store (use Redis in production)
_code_store: dict[str, str] = {}


@router.post("/send-code")
async def send_code(req: SendCodeRequest):
    """Send verification code to phone number.

    In production, integrate with a real SMS service (e.g., Aliyun SMS).
    For development, the code is always '1234'.
    """
    code = "1234"  # Dev mode: fixed code
    _code_store[req.phone] = code

    # TODO: Integrate with SMS provider
    # await sms_service.send(req.phone, code)

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
        user = User(phone=req.phone, nickname=f"同学{req.phone[-4:]}")
        db.add(user)
        await db.flush()

    # Generate token
    token = create_access_token(user.id, settings)

    return LoginResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            phone=user.phone,
            nickname=user.nickname,
            avatar_url=user.avatar_url,
        ),
    )
