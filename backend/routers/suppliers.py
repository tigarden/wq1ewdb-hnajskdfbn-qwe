from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.database import get_db
from backend.core.dependencies import get_current_admin
from backend.services.supplier_service import SupplierService
from backend.schemas import SupplierCreate, SupplierOut

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"],
    dependencies=[Depends(get_current_admin)]
)

@router.get("", response_model=List[SupplierOut])
async def list_suppliers(db: AsyncSession = Depends(get_db)):
    """List all auto parts suppliers."""
    return await SupplierService.get_all(db)

@router.post("", response_model=SupplierOut)
async def add_supplier(supplier_in: SupplierCreate, db: AsyncSession = Depends(get_db)):
    """Add a new supplier to the directory."""
    try:
        return await SupplierService.add(db, supplier_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
