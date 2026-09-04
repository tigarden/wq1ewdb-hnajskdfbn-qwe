import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models import OtherCounterparty, OtherTransaction
from backend.schemas import OtherCounterpartyCreate, OtherTransactionCreate

class CounterpartyService:
    @staticmethod
    async def get_all_counterparties(db: AsyncSession) -> List[OtherCounterparty]:
        result = await db.execute(select(OtherCounterparty).order_by(OtherCounterparty.created_at.asc()))
        return list(result.scalars().all())

    @staticmethod
    async def create_counterparty(db: AsyncSession, cp_in: OtherCounterpartyCreate) -> OtherCounterparty:
        cid = cp_in.id or f"oth-{uuid.uuid4().hex[:8]}"
        existing = await db.get(OtherCounterparty, cid)
        if existing:
            raise ValueError(f"Контрагент с ID '{cid}' уже существует")

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
    async def get_all_transactions(db: AsyncSession) -> List[OtherTransaction]:
        result = await db.execute(select(OtherTransaction).order_by(OtherTransaction.created_at.desc()))
        return list(result.scalars().all())

    @staticmethod
    async def create_transaction(db: AsyncSession, tx_in: OtherTransactionCreate) -> OtherTransaction:
        cp = await db.get(OtherCounterparty, tx_in.counterparty_id)
        if not cp:
            raise ValueError(f"Контрагент с ID '{tx_in.counterparty_id}' не найден")

        tx_id = tx_in.id or f"otx-{uuid.uuid4().hex[:10]}"
        tx = OtherTransaction(
            id=tx_id,
            counterparty_id=tx_in.counterparty_id,
            amount=round(float(tx_in.amount or 0.0), 2),
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
