from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, func
from backend.core.database import get_db
from backend.core.config import settings
from backend.models import Client, ClientTransaction
from backend.schemas import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check endpoint to verify database connectivity and stats."""
    db_type = "PostgreSQL" if "postgresql" in settings.DATABASE_URL else "SQLite"
    try:
        await db.execute(text("SELECT 1"))
        cli_count = await db.scalar(select(func.count(Client.id))) or 0
        tx_count = await db.scalar(select(func.count(ClientTransaction.id))) or 0

        return HealthResponse(
            status="online",
            database="connected",
            database_type=db_type,
            version=settings.VERSION,
            total_clients=cli_count,
            total_transactions=tx_count
        )
    except Exception as e:
        return HealthResponse(
            status="degraded",
            database=f"error: {str(e)}",
            database_type=db_type,
            version=settings.VERSION,
            total_clients=0,
            total_transactions=0
        )
