import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import Client
from backend.schemas import ClientCreate, ClientUpdate, ClientOut
from backend.security import get_current_admin

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.get("", response_model=List[ClientOut])
async def list_clients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client).order_by(Client.created_at.asc()))
    return result.scalars().all()

@router.post("", response_model=ClientOut, status_code=status.HTTP_201_CREATED)
async def create_client(client_in: ClientCreate, db: AsyncSession = Depends(get_db)):
    cid = client_in.id or f"cli-{uuid.uuid4().hex[:8]}"
    existing = await db.get(Client, cid)
    if existing:
        raise HTTPException(status_code=400, detail="Клиент с таким ID уже существует")

    client = Client(
        id=cid,
        name=client_in.name.strip(),
        phone=client_in.phone.strip() if client_in.phone else "",
        car=client_in.car.strip() if client_in.car else "",
        initial_balance=client_in.initial_balance or 0.0,
        notes=client_in.notes.strip() if client_in.notes else "",
    )
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client

@router.put("/{client_id}", response_model=ClientOut)
async def update_client(client_id: str, client_in: ClientUpdate, db: AsyncSession = Depends(get_db)):
    client = await db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    if client_in.name is not None:
        client.name = client_in.name.strip()
    if client_in.phone is not None:
        client.phone = client_in.phone.strip()
    if client_in.car is not None:
        client.car = client_in.car.strip()
    if client_in.initial_balance is not None:
        client.initial_balance = client_in.initial_balance
    if client_in.notes is not None:
        client.notes = client_in.notes.strip()

    await db.commit()
    await db.refresh(client)
    return client

@router.delete("/{client_id}")
async def delete_client(client_id: str, db: AsyncSession = Depends(get_db)):
    client = await db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    await db.delete(client)
    await db.commit()
    return {"success": True, "message": f"Клиент {client_id} и все его операции удалены"}
