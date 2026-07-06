from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from .api.auth import router as auth_router
from .api.exams import router as exams_router
from .api.wrong_questions import router as wrong_q_router
from .api.knowledge import router as knowledge_router
from .core.config import get_settings
from .core.database import get_engine
from .models import Base

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

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

# Static files for uploaded images
os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "app": settings.app_name}
