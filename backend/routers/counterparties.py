import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import OtherCounterparty, OtherTransaction
from backend.schemas import (
    OtherCounterpartyCreate,
    OtherCounterpartyUpdate,
    OtherCounterpartyOut,
    OtherTransactionCreate,
    OtherTransactionOut
)

router = APIRouter(tags=["Other Counterparties"])

# Counterparties CRUD
@router.get("/other-counterparties", response_model=List[OtherCounterpartyOut])
async def list_other_counterparties(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OtherCounterparty).order_by(OtherCounterparty.created_at.asc()))
    return result.scalars().all()

@router.post("/other-counterparties", response_model=OtherCounterpartyOut, status_code=status.HTTP_201_CREATED)
async def create_other_counterparty(cp_in: OtherCounterpartyCreate, db: AsyncSession = Depends(get_db)):
    cid = cp_in.id or f"oth-{uuid.uuid4().hex[:8]}"
    existing = await db.get(OtherCounterparty, cid)
    if existing:
        raise HTTPException(status_code=400, detail="Контрагент с таким ID уже существует")

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

@router.delete("/other-counterparties/{cp_id}")
async def delete_other_counterparty(cp_id: str, db: AsyncSession = Depends(get_db)):
    cp = await db.get(OtherCounterparty, cp_id)
    if not cp:
        raise HTTPException(status_code=404, detail="Контрагент не найден")

    await db.delete(cp)
    await db.commit()
    return {"success": True, "message": f"Контрагент {cp_id} удален"}

# Transactions CRUD
@router.get("/other-transactions", response_model=List[OtherTransactionOut])
async def list_other_transactions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OtherTransaction).order_by(OtherTransaction.created_at.desc()))
    return result.scalars().all()

@router.post("/other-transactions", response_model=OtherTransactionOut, status_code=status.HTTP_201_CREATED)
async def create_other_transaction(tx_in: OtherTransactionCreate, db: AsyncSession = Depends(get_db)):
    cp = await db.get(OtherCounterparty, tx_in.counterparty_id)
    if not cp:
        raise HTTPException(status_code=404, detail="Контрагент не найден")

    tx_id = tx_in.id or f"otx-{uuid.uuid4().hex[:10]}"
    tx = OtherTransaction(
        id=tx_id,
        counterparty_id=tx_in.counterparty_id,
        amount=float(tx_in.amount) if tx_in.amount is not None else 0.0,
        note=tx_in.note.strip() if tx_in.note else "",
        date=tx_in.date.strip() if tx_in.date else "",
    )
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return tx

@router.delete("/other-transactions/{tx_id}")
async def delete_other_transaction(tx_id: str, db: AsyncSession = Depends(get_db)):
    tx = await db.get(OtherTransaction, tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Транзакция не найдена")

    await db.delete(tx)
    await db.commit()
    return {"success": True, "message": f"Транзакция {tx_id} удалена"}
