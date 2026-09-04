from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.database import get_db
from backend.core.dependencies import get_current_admin
from backend.services.transaction_service import TransactionService
from backend.schemas import (
    ClientTransactionCreate,
    ClientTransactionUpdate,
    ClientTransactionOut
)

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
    dependencies=[Depends(get_current_admin)]
)

@router.get("", response_model=List[ClientTransactionOut])
async def list_transactions(
    client_id: Optional[str] = Query(None, description="Filter by client ID"),
    type: Optional[str] = Query(None, description="Filter by type: 'item' or 'payment'"),
    limit: Optional[int] = Query(None, ge=1, le=2000, description="Limit returned transactions"),
    offset: Optional[int] = Query(None, ge=0, description="Offset for pagination"),
    db: AsyncSession = Depends(get_db)
):
    """List client transactions with optional client, type, and pagination filters."""
    return await TransactionService.get_all(db, client_id=client_id, type=type, limit=limit, offset=offset)

@router.get("/{tx_id}", response_model=ClientTransactionOut)
async def get_transaction(tx_id: str, db: AsyncSession = Depends(get_db)):
    """Get single transaction by ID."""
    tx = await TransactionService.get_by_id(db, tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Транзакция не найдена")
    return tx

@router.post("", response_model=ClientTransactionOut, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    tx_in: ClientTransactionCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new item purchase or payment transaction."""
    try:
        return await TransactionService.create(db, tx_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{tx_id}", response_model=ClientTransactionOut)
async def update_transaction(
    tx_id: str,
    tx_in: ClientTransactionUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update transaction fields."""
    tx = await TransactionService.update(db, tx_id, tx_in)
    if not tx:
        raise HTTPException(status_code=404, detail="Транзакция не найдена")
    return tx

@router.delete("/{tx_id}")
async def delete_transaction(tx_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a transaction."""
    deleted = await TransactionService.delete(db, tx_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Транзакция не найдена")
    return {"success": True, "message": f"Транзакция {tx_id} удалена"}
