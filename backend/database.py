# Backward compatibility re-export
from backend.core.database import (
    Base,
    engine,
    AsyncSessionLocal,
    get_db,
    settings
)

__all__ = ["Base", "engine", "AsyncSessionLocal", "get_db", "settings"]
