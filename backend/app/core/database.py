from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from .config import get_settings

_engine = None
_async_session = None


def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(settings.database_url, echo=settings.debug)
    return _engine


def get_sessionmaker():
    global _async_session
    if _async_session is None:
        _async_session = async_sessionmaker(get_engine(), class_=AsyncSession, expire_on_commit=False)
    return _async_session


async def get_db() -> AsyncSession:
    async with get_sessionmaker()() as session:
        try:
            yield session
        finally:
            await session.close()
