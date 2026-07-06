from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "AI Personal Trainer"
    debug: bool = True
    secret_key: str = "change-me-in-production-please"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 30  # 30 days

    # Database
    database_url: str = "sqlite+aiosqlite:///./ai_trainer.db"

    # File storage
    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 10

    # AI Service (Qwen / 通义千问)
    ai_api_key: str = ""
    ai_api_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    ai_model: str = "qwen-vl-max"

    # SMS (placeholder for verification code)
    sms_api_key: str = ""
    sms_secret: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
