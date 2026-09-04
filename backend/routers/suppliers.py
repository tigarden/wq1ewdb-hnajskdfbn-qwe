from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import Supplier
from backend.schemas import SupplierCreate, SupplierOut

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])

@router.get("", response_model=List[SupplierOut])
async def list_suppliers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).order_by(Supplier.name.asc()))
    return result.scalars().all()

@router.post("", response_model=SupplierOut)
async def add_supplier(supplier_in: SupplierCreate, db: AsyncSession = Depends(get_db)):
    clean_name = supplier_in.name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Название поставщика не может быть пустым")

    existing = await db.execute(select(Supplier).filter(Supplier.name == clean_name))
    if existing.scalars().first():
        return existing.scalars().first()

    sup = Supplier(name=clean_name)
    db.add(sup)
    await db.commit()
    await db.refresh(sup)
    return sup
