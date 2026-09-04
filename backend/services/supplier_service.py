from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models import Supplier
from backend.schemas import SupplierCreate

class SupplierService:
    @staticmethod
    async def get_all(db: AsyncSession) -> List[Supplier]:
        result = await db.execute(select(Supplier).order_by(Supplier.name.asc()))
        return list(result.scalars().all())

    @staticmethod
    async def add(db: AsyncSession, supplier_in: SupplierCreate) -> Supplier:
        clean_name = supplier_in.name.strip()
        if not clean_name:
            raise ValueError("Название поставщика не может быть пустым")

        existing = await db.execute(select(Supplier).filter(Supplier.name == clean_name))
        found = existing.scalars().first()
        if found:
            return found

        sup = Supplier(name=clean_name)
        db.add(sup)
        await db.commit()
        await db.refresh(sup)
        return sup
