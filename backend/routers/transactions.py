import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import ClientTransaction, Client
from backend.schemas import ClientTransactionCreate, ClientTransactionUpdate, ClientTransactionOut
from backend.security import get_current_admin

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=List[ClientTransactionOut])
async def list_transactions(
    client_id: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ClientTransaction)
    if client_id:
        stmt = stmt.filter(ClientTransaction.client_id == client_id)
    if type:
        stmt = stmt.filter(ClientTransaction.type == type)
    
    stmt = stmt.order_by(ClientTransaction.date.desc(), ClientTransaction.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=ClientTransactionOut, status_code=status.HTTP_201_CREATED)
async def create_transaction(tx_in: ClientTransactionCreate, db: AsyncSession = Depends(get_db)):
    client = await db.get(Client, tx_in.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    tx_id = tx_in.id or f"ctx-{uuid.uuid4().hex[:10]}"
    tx = ClientTransaction(
        id=tx_id,
        client_id=tx_in.client_id,
        type=tx_in.type,
        article=tx_in.article.strip() if tx_in.article else "",
        description=tx_in.description.strip() if tx_in.description else "",
        car_name=tx_in.car_name.strip() if tx_in.car_name else "",
        supplier_name=tx_in.supplier_name.strip() if tx_in.supplier_name else "",
        amount=float(tx_in.amount) if tx_in.amount is not None else 0.0,
        purchase_price=float(tx_in.purchase_price) if tx_in.purchase_price is not None else 0.0,
        date=tx_in.date.strip() if tx_in.date else "",
        note=tx_in.note.strip() if tx_in.note else "",
    )
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return tx

@router.put("/{tx_id}", response_model=ClientTransactionOut)
async def update_transaction(tx_id: str, tx_in: ClientTransactionUpdate, db: AsyncSession = Depends(get_db)):
    tx = await db.get(ClientTransaction, tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Транзакция не найдена")

    if tx_in.type is not None:
        tx.type = tx_in.type
    if tx_in.article is not None:
        tx.article = tx_in.article.strip()
    if tx_in.description is not None:
        tx.description = tx_in.description.strip()
    if tx_in.car_name is not None:
        tx.car_name = tx_in.car_name.strip()
    if tx_in.supplier_name is not None:
        tx.supplier_name = tx_in.supplier_name.strip()
    if tx_in.amount is not None:
        tx.amount = float(tx_in.amount)
    if tx_in.purchase_price is not None:
        tx.purchase_price = float(tx_in.purchase_price)
    if tx_in.date is not None:
        tx.date = tx_in.date.strip()
    if tx_in.note is not None:
        tx.note = tx_in.note.strip()

    await db.commit()
    await db.refresh(tx)
    return tx

@router.delete("/{tx_id}")
async def delete_transaction(tx_id: str, db: AsyncSession = Depends(get_db)):
    tx = await db.get(ClientTransaction, tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Транзакция не найдена")

    await db.delete(tx)
    await db.commit()
    return {"success": True, "message": f"Транзакция {tx_id} удалена"}
