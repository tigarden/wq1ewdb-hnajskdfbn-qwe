import uuid
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models import OtherCounterparty, OtherTransaction
from backend.schemas import OtherCounterpartyCreate, OtherTransactionCreate

class CounterpartyService:
    @staticmethod
    async def get_all_counterparties(
        db: AsyncSession,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[OtherCounterparty]:
        stmt = select(OtherCounterparty).order_by(OtherCounterparty.created_at.asc())
        if offset:
            stmt = stmt.offset(offset)
        if limit:
            stmt = stmt.limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_counterparty(db: AsyncSession, cp_in: OtherCounterpartyCreate) -> OtherCounterparty:
        cid = cp_in.id or f"oth-{uuid.uuid4().hex}"
        existing = await db.get(OtherCounterparty, cid)
        if existing:
            raise ValueError(f"Поставщик с ID '{cid}' уже существует")

        cp = OtherCounterparty(
            id=cid,
            name=cp_in.name.strip(),
            phone=cp_in.phone.strip() if cp_in.phone else "",
            notes=cp_in.notes.strip() if cp_in.notes else "",
        )
        db.add(cp)
        await db.commit()
        await db.refresh(cp)
        return cp

    @staticmethod
    async def delete_counterparty(db: AsyncSession, cp_id: str) -> bool:
        cp = await db.get(OtherCounterparty, cp_id)
        if not cp:
            return False
        await db.delete(cp)
        await db.commit()
        return True

    @staticmethod
    async def get_all_transactions(
        db: AsyncSession,
        counterparty_id: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[OtherTransaction]:
        stmt = select(OtherTransaction)
        if counterparty_id:
            stmt = stmt.filter(OtherTransaction.counterparty_id == counterparty_id)
        stmt = stmt.order_by(OtherTransaction.date.desc(), OtherTransaction.created_at.desc())
        if offset:
            stmt = stmt.offset(offset)
        if limit:
            stmt = stmt.limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_transaction(db: AsyncSession, tx_in: OtherTransactionCreate) -> OtherTransaction:
        cp = await db.get(OtherCounterparty, tx_in.counterparty_id)
        if not cp:
            raise ValueError(f"Поставщик с ID '{tx_in.counterparty_id}' не найден")

        tx_id = tx_in.id or f"otx-{uuid.uuid4().hex}"
        amt = Decimal(str(tx_in.amount or "0.00"))
        tx = OtherTransaction(
            id=tx_id,
            counterparty_id=tx_in.counterparty_id,
            amount=round(amt, 2),
            note=tx_in.note.strip() if tx_in.note else "",
            date=tx_in.date.strip() if tx_in.date else "",
        )
        db.add(tx)
        await db.commit()
        await db.refresh(tx)
        return tx

    @staticmethod
    async def delete_transaction(db: AsyncSession, tx_id: str) -> bool:
        tx = await db.get(OtherTransaction, tx_id)
        if not tx:
            return False
        await db.delete(tx)
        await db.commit()
        return True
