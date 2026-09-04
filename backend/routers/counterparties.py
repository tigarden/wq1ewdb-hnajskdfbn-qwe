from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.database import get_db
from backend.core.dependencies import get_current_admin
from backend.services.counterparty_service import CounterpartyService
from backend.schemas import (
    OtherCounterpartyCreate,
    OtherCounterpartyOut,
    OtherTransactionCreate,
    OtherTransactionOut
)

router = APIRouter(
    tags=["Other Counterparties"],
    dependencies=[Depends(get_current_admin)]
)

# Counterparties CRUD
@router.get("/other-counterparties", response_model=List[OtherCounterpartyOut])
async def list_other_counterparties(
    limit: Optional[int] = Query(None, ge=1, le=1000, description="Max counterparties to return"),
    offset: Optional[int] = Query(None, ge=0, description="Offset for pagination"),
    db: AsyncSession = Depends(get_db)
):
    """List other counterparties (masters, clients, etc.) with optional pagination."""
    return await CounterpartyService.get_all_counterparties(db, limit=limit, offset=offset)

@router.post("/other-counterparties", response_model=OtherCounterpartyOut, status_code=status.HTTP_201_CREATED)
async def create_other_counterparty(cp_in: OtherCounterpartyCreate, db: AsyncSession = Depends(get_db)):
    """Create a new other counterparty."""
    try:
        return await CounterpartyService.create_counterparty(db, cp_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/other-counterparties/{cp_id}")
async def delete_other_counterparty(cp_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a counterparty and their transactions."""
    deleted = await CounterpartyService.delete_counterparty(db, cp_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Контрагент не найден")
    return {"success": True, "message": f"Контрагент {cp_id} удален"}

# Transactions CRUD
@router.get("/other-transactions", response_model=List[OtherTransactionOut])
async def list_other_transactions(
    counterparty_id: Optional[str] = Query(None, description="Filter by counterparty ID"),
    limit: Optional[int] = Query(None, ge=1, le=2000, description="Max transactions to return"),
    offset: Optional[int] = Query(None, ge=0, description="Offset for pagination"),
    db: AsyncSession = Depends(get_db)
):
    """List all transactions with other counterparties with optional filters."""
    return await CounterpartyService.get_all_transactions(
        db,
        counterparty_id=counterparty_id,
        limit=limit,
        offset=offset
    )

@router.post("/other-transactions", response_model=OtherTransactionOut, status_code=status.HTTP_201_CREATED)
async def create_other_transaction(tx_in: OtherTransactionCreate, db: AsyncSession = Depends(get_db)):
    """Add a settlement record for a counterparty."""
    try:
        return await CounterpartyService.create_transaction(db, tx_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/other-transactions/{tx_id}")
async def delete_other_transaction(tx_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a settlement record."""
    deleted = await CounterpartyService.delete_transaction(db, tx_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Транзакция не найдена")
    return {"success": True, "message": f"Транзакция {tx_id} удалена"}
