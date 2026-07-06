from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from sqlalchemy import inspect, text

from .api.auth import router as auth_router
from .api.exams import router as exams_router
from .api.wrong_questions import router as wrong_q_router
from .api.knowledge import router as knowledge_router
from .core.config import get_settings
from .core.database import get_engine
from .models import Base

settings = get_settings()
public_base_path = os.environ.get("PUBLIC_BASE_PATH", "").strip().rstrip("/")
if public_base_path and not public_base_path.startswith("/"):
    public_base_path = f"/{public_base_path}"


def _ensure_sqlite_dev_schema(conn):
    """Keep local SQLite databases compatible with lightweight dev startup."""
    if conn.dialect.name != "sqlite":
        return

    inspector = inspect(conn)
    if "exams" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("exams")}
    if "subject" not in columns:
        conn.execute(text("ALTER TABLE exams ADD COLUMN subject VARCHAR(20) NOT NULL DEFAULT '通用'"))
        columns.add("subject")

    indexes = {index["name"] for index in inspector.get_indexes("exams")}
    if "subject" in columns and "ix_exams_subject" not in indexes:
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_exams_subject ON exams (subject)"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(_ensure_sqlite_dev_schema)
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
    docs_url=f"{public_base_path}/docs" if public_base_path else "/docs",
    redoc_url=f"{public_base_path}/redoc" if public_base_path else "/redoc",
    openapi_url=f"{public_base_path}/openapi.json" if public_base_path else "/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix="/api")
app.include_router(exams_router, prefix="/api")
app.include_router(wrong_q_router, prefix="/api")
app.include_router(knowledge_router, prefix="/api")
if public_base_path:
    app.include_router(auth_router, prefix=f"{public_base_path}/api")
    app.include_router(exams_router, prefix=f"{public_base_path}/api")
    app.include_router(wrong_q_router, prefix=f"{public_base_path}/api")
    app.include_router(knowledge_router, prefix=f"{public_base_path}/api")

# Static files for uploaded images
os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
if public_base_path:
    app.mount(f"{public_base_path}/uploads", StaticFiles(directory=settings.upload_dir), name="prefixed_uploads")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "app": settings.app_name}


if public_base_path:
    app.add_api_route(f"{public_base_path}/api/health", health_check, methods=["GET"])
