import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models import Client
from backend.schemas import ClientCreate, ClientUpdate

class ClientService:
    @staticmethod
    async def get_all(db: AsyncSession) -> List[Client]:
        result = await db.execute(select(Client).order_by(Client.created_at.asc()))
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, client_id: str) -> Optional[Client]:
        return await db.get(Client, client_id)

    @staticmethod
    async def create(db: AsyncSession, client_in: ClientCreate) -> Client:
        cid = client_in.id or f"cli-{uuid.uuid4().hex[:8]}"
        existing = await db.get(Client, cid)
        if existing:
            raise ValueError(f"Клиент с ID '{cid}' уже существует")

        client = Client(
            id=cid,
            name=client_in.name.strip(),
            phone=client_in.phone.strip() if client_in.phone else "",
            car=client_in.car.strip() if client_in.car else "",
            initial_balance=float(client_in.initial_balance or 0.0),
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
        if client_in.phone is not None:
            client.phone = client_in.phone.strip()
        if client_in.car is not None:
            client.car = client_in.car.strip()
        if client_in.initial_balance is not None:
            client.initial_balance = float(client_in.initial_balance)
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
