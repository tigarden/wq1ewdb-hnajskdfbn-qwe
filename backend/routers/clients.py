from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.database import get_db
from backend.core.dependencies import get_current_admin
from backend.services.client_service import ClientService
from backend.schemas import ClientCreate, ClientUpdate, ClientOut

router = APIRouter(
    prefix="/clients",
    tags=["Clients"],
    dependencies=[Depends(get_current_admin)]
)

@router.get("", response_model=List[ClientOut])
async def list_clients(
    limit: Optional[int] = Query(None, ge=1, le=1000, description="Max clients to return"),
    offset: Optional[int] = Query(None, ge=0, description="Offset for pagination"),
    db: AsyncSession = Depends(get_db)
):
    """List clients ordered by creation date with optional pagination."""
    return await ClientService.get_all(db, limit=limit, offset=offset)

@router.get("/{client_id}", response_model=ClientOut)
async def get_client(client_id: str, db: AsyncSession = Depends(get_db)):
    """Get single client by ID."""
    client = await ClientService.get_by_id(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    return client

@router.post("", response_model=ClientOut, status_code=status.HTTP_201_CREATED)
async def create_client(client_in: ClientCreate, db: AsyncSession = Depends(get_db)):
    """Create a new client with initial balance."""
    try:
        return await ClientService.create(db, client_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{client_id}", response_model=ClientOut)
async def update_client(client_id: str, client_in: ClientUpdate, db: AsyncSession = Depends(get_db)):
    """Update client details."""
    client = await ClientService.update(db, client_id, client_in)
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    return client

@router.delete("/{client_id}")
async def delete_client(client_id: str, db: AsyncSession = Depends(get_db)):
    """Delete client and cascade-delete all related transactions."""
    deleted = await ClientService.delete(db, client_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    return {"success": True, "message": f"Клиент {client_id} успешно удален"}
