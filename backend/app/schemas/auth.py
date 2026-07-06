from pydantic import BaseModel, Field


class SendCodeRequest(BaseModel):
    phone: str = Field(..., pattern=r"^1\d{10}$", description="手机号")


class LoginRequest(BaseModel):
    phone: str = Field(..., pattern=r"^1\d{10}$")
    code: str = Field(..., min_length=4, max_length=6)


class UserResponse(BaseModel):
    id: str
    phone: str
    nickname: str
    avatar_url: str | None = None
    is_admin: bool = False

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    token: str
    user: UserResponse
