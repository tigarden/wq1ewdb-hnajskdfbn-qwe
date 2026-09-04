from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.database import get_db
from backend.core.dependencies import get_current_admin
from backend.services.backup_service import BackupService
from backend.schemas import FullBackupPayload

router = APIRouter(
    prefix="/backup",
    tags=["Backup"],
    dependencies=[Depends(get_current_admin)]
)

@router.get("/export")
async def export_database(db: AsyncSession = Depends(get_db)):
    """Export all database tables to structured JSON (Admin only)."""
    return await BackupService.export_full_data(db)

@router.post("/import")
async def import_database(payload: FullBackupPayload, db: AsyncSession = Depends(get_db)):
    """Import and synchronize JSON data into database atomically (Admin only)."""
    try:
        count = await BackupService.import_full_data(db, payload)
        return {
            "success": True,
            "message": f"Данные успешно импортированы ({count} записей синхронизировано)"
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка импорта данных: {str(e)}")
