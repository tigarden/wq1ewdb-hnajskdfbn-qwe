import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models import ClientTransaction, Client
from backend.schemas import ClientTransactionCreate, ClientTransactionUpdate

class TransactionService:
    @staticmethod
    async def get_all(
        db: AsyncSession,
        client_id: Optional[str] = None,
        type: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List[ClientTransaction]:
        stmt = select(ClientTransaction)
        if client_id:
            stmt = stmt.filter(ClientTransaction.client_id == client_id)
        if type:
            stmt = stmt.filter(ClientTransaction.type == type)

        stmt = stmt.order_by(ClientTransaction.date.desc(), ClientTransaction.created_at.desc())
        if limit:
            stmt = stmt.limit(limit)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, tx_id: str) -> Optional[ClientTransaction]:
        return await db.get(ClientTransaction, tx_id)

    @staticmethod
    async def create(db: AsyncSession, tx_in: ClientTransactionCreate) -> ClientTransaction:
        client = await db.get(Client, tx_in.client_id)
        if not client:
            raise ValueError(f"Клиент с ID '{tx_in.client_id}' не найден")

        tx_id = tx_in.id or f"ctx-{uuid.uuid4().hex[:10]}"
        tx = ClientTransaction(
            id=tx_id,
            client_id=tx_in.client_id,
            type=tx_in.type,
            article=tx_in.article.strip().upper() if tx_in.article else "",
            description=tx_in.description.strip() if tx_in.description else "",
            car_name=tx_in.car_name.strip() if tx_in.car_name else "",
            supplier_name=tx_in.supplier_name.strip() if tx_in.supplier_name else "",
            amount=round(float(tx_in.amount or 0.0), 2),
            purchase_price=round(float(tx_in.purchase_price or 0.0), 2),
            date=tx_in.date.strip() if tx_in.date else "",
            note=tx_in.note.strip() if tx_in.note else "",
        )
        db.add(tx)
        await db.commit()
        await db.refresh(tx)
        return tx

    @staticmethod
    async def update(db: AsyncSession, tx_id: str, tx_in: ClientTransactionUpdate) -> Optional[ClientTransaction]:
        tx = await db.get(ClientTransaction, tx_id)
        if not tx:
            return None

        if tx_in.type is not None:
            tx.type = tx_in.type
        if tx_in.article is not None:
            tx.article = tx_in.article.strip().upper()
        if tx_in.description is not None:
            tx.description = tx_in.description.strip()
        if tx_in.car_name is not None:
            tx.car_name = tx_in.car_name.strip()
        if tx_in.supplier_name is not None:
            tx.supplier_name = tx_in.supplier_name.strip()
        if tx_in.amount is not None:
            tx.amount = round(float(tx_in.amount), 2)
        if tx_in.purchase_price is not None:
            tx.purchase_price = round(float(tx_in.purchase_price), 2)
        if tx_in.date is not None:
            tx.date = tx_in.date.strip()
        if tx_in.note is not None:
            tx.note = tx_in.note.strip()

        await db.commit()
        await db.refresh(tx)
        return tx

    @staticmethod
    async def delete(db: AsyncSession, tx_id: str) -> bool:
        tx = await db.get(ClientTransaction, tx_id)
        if not tx:
            return False
        await db.delete(tx)
        await db.commit()
        return True
