import uuid
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models import Client
from backend.schemas import ClientCreate, ClientUpdate

class ClientService:
    @staticmethod
    async def get_all(
        db: AsyncSession,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[Client]:
        stmt = select(Client).order_by(Client.created_at.asc())
        if offset:
            stmt = stmt.offset(offset)
        if limit:
            stmt = stmt.limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, client_id: str) -> Optional[Client]:
        return await db.get(Client, client_id)

    @staticmethod
    async def create(db: AsyncSession, client_in: ClientCreate) -> Client:
        # Use full uuid4 hex (32 chars) to guarantee zero primary key collision
        cid = client_in.id or f"cli-{uuid.uuid4().hex}"
        existing = await db.get(Client, cid)
        if existing:
            raise ValueError(f"Клиент с ID '{cid}' уже существует")

        init_bal = Decimal(str(client_in.initial_balance or "0.00"))
        client = Client(
            id=cid,
            name=client_in.name.strip(),
            client_type=client_in.client_type or "retail",
            phone=client_in.phone.strip() if client_in.phone else "",
            car=client_in.car.strip() if client_in.car else "",
            initial_balance=round(init_bal, 2),
            notes=client_in.notes.strip() if client_in.notes else "",
        )
        db.add(client)
        await db.commit()
        await db.refresh(client)
        return client

    @staticmethod
    async def update(db: AsyncSession, client_id: str, client_in: ClientUpdate) -> Optional[Client]:
        client = await db.get(Client, client_id)
        if not client:
            return None

        if client_in.name is not None:
            client.name = client_in.name.strip()
        if client_in.client_type is not None:
            client.client_type = client_in.client_type
        if client_in.phone is not None:
            client.phone = client_in.phone.strip()
        if client_in.car is not None:
            client.car = client_in.car.strip()
        if client_in.initial_balance is not None:
            client.initial_balance = round(Decimal(str(client_in.initial_balance)), 2)
        if client_in.notes is not None:
            client.notes = client_in.notes.strip()

        await db.commit()
        await db.refresh(client)
        return client

    @staticmethod
    async def delete(db: AsyncSession, client_id: str) -> bool:
        client = await db.get(Client, client_id)
        if not client:
            return False
        await db.delete(client)
        await db.commit()
        return True
