from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models import Client, ClientTransaction, Supplier, OtherCounterparty, OtherTransaction
from backend.schemas import FullBackupPayload

class BackupService:
    @staticmethod
    async def export_full_data(db: AsyncSession) -> Dict[str, Any]:
        """Export all database tables to structured JSON matching the app format."""
        clients_res = await db.execute(select(Client).order_by(Client.created_at.asc()))
        clients = clients_res.scalars().all()

        txs_res = await db.execute(select(ClientTransaction).order_by(ClientTransaction.created_at.desc()))
        txs = txs_res.scalars().all()

        suppliers_res = await db.execute(select(Supplier).order_by(Supplier.name.asc()))
        suppliers = suppliers_res.scalars().all()

        other_cp_res = await db.execute(select(OtherCounterparty).order_by(OtherCounterparty.created_at.asc()))
        other_cps = other_cp_res.scalars().all()

        other_txs_res = await db.execute(select(OtherTransaction).order_by(OtherTransaction.created_at.desc()))
        other_txs = other_txs_res.scalars().all()

        return {
            "version": 3,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
            "clients": [
                {
                    "id": c.id,
                    "name": c.name,
                    "phone": c.phone or "",
                    "car": c.car or "",
                    "initialBalance": c.initial_balance or 0.0,
                    "notes": c.notes or "",
                    "createdAt": c.created_at.isoformat() if c.created_at else None
                }
                for c in clients
            ],
            "clientTransactions": [
                {
                    "id": t.id,
                    "clientId": t.client_id,
                    "type": t.type,
                    "article": t.article or "",
                    "description": t.description or "",
                    "carName": t.car_name or "",
                    "supplierName": t.supplier_name or "",
                    "amount": t.amount or 0.0,
                    "purchasePrice": t.purchase_price or 0.0,
                    "date": t.date or "",
                    "note": t.note or "",
                    "createdAt": t.created_at.isoformat() if t.created_at else None
                }
                for t in txs
            ],
            "suppliersList": [s.name for s in suppliers],
            "otherCounterparties": [
                {
                    "id": p.id,
                    "name": p.name,
                    "phone": p.phone or "",
                    "notes": p.notes or "",
                    "createdAt": p.created_at.isoformat() if p.created_at else None
                }
                for p in other_cps
            ],
            "otherTransactions": [
                {
                    "id": ot.id,
                    "counterpartyId": ot.counterparty_id,
                    "amount": ot.amount or 0.0,
                    "note": ot.note or "",
                    "date": ot.date or "",
                    "createdAt": ot.created_at.isoformat() if ot.created_at else None
                }
                for ot in other_txs
            ]
        }

    @staticmethod
    async def import_full_data(db: AsyncSession, payload: FullBackupPayload) -> int:
        """Import full dataset with upsert logic, ensuring foreign key consistency."""
        imported_records = 0

        # 1. Clients
        for cli_dict in payload.clients:
            cid = cli_dict.get("id")
            if not cid:
                continue
            existing = await db.get(Client, cid)
            if existing:
                existing.name = cli_dict.get("name", existing.name)
                existing.phone = cli_dict.get("phone", existing.phone)
                existing.car = cli_dict.get("car", existing.car)
                existing.initial_balance = round(float(cli_dict.get("initialBalance", existing.initial_balance) or 0.0), 2)
                existing.notes = cli_dict.get("notes", existing.notes)
            else:
                db.add(Client(
                    id=cid,
                    name=cli_dict.get("name", ""),
                    phone=cli_dict.get("phone", ""),
                    car=cli_dict.get("car", ""),
                    initial_balance=round(float(cli_dict.get("initialBalance", 0.0) or 0.0), 2),
                    notes=cli_dict.get("notes", ""),
                ))
            imported_records += 1

        # 2. Suppliers
        for sup_name in payload.suppliersList:
            clean = sup_name.strip()
            if not clean:
                continue
            res = await db.execute(select(Supplier).filter(Supplier.name == clean))
            if not res.scalars().first():
                db.add(Supplier(name=clean))
                imported_records += 1

        # 3. Other Counterparties
        for cp_dict in payload.otherCounterparties:
            pid = cp_dict.get("id")
            if not pid:
                continue
            existing = await db.get(OtherCounterparty, pid)
            if existing:
                existing.name = cp_dict.get("name", existing.name)
                existing.phone = cp_dict.get("phone", existing.phone)
                existing.notes = cp_dict.get("notes", existing.notes)
            else:
                db.add(OtherCounterparty(
                    id=pid,
                    name=cp_dict.get("name", ""),
                    phone=cp_dict.get("phone", ""),
                    notes=cp_dict.get("notes", ""),
                ))
            imported_records += 1

        # Flush before transactions to satisfy foreign keys
        await db.flush()

        # 4. Client Transactions
        for tx_dict in payload.clientTransactions:
            tid = tx_dict.get("id")
            client_id = tx_dict.get("clientId")
            if not tid or not client_id:
                continue
            existing_tx = await db.get(ClientTransaction, tid)
            if existing_tx:
                existing_tx.client_id = client_id
                existing_tx.type = tx_dict.get("type", existing_tx.type)
                existing_tx.article = (tx_dict.get("article") or "").strip().upper()
                existing_tx.description = tx_dict.get("description", existing_tx.description)
                existing_tx.car_name = tx_dict.get("carName", existing_tx.car_name)
                existing_tx.supplier_name = tx_dict.get("supplierName", existing_tx.supplier_name)
                existing_tx.amount = round(float(tx_dict.get("amount", existing_tx.amount) or 0.0), 2)
                existing_tx.purchase_price = round(float(tx_dict.get("purchasePrice", existing_tx.purchase_price) or 0.0), 2)
                existing_tx.date = tx_dict.get("date", existing_tx.date)
                existing_tx.note = tx_dict.get("note", existing_tx.note)
            else:
                db.add(ClientTransaction(
                    id=tid,
                    client_id=client_id,
                    type=tx_dict.get("type", "item"),
                    article=(tx_dict.get("article") or "").strip().upper(),
                    description=tx_dict.get("description", ""),
                    car_name=tx_dict.get("carName", ""),
                    supplier_name=tx_dict.get("supplierName", ""),
                    amount=round(float(tx_dict.get("amount", 0.0) or 0.0), 2),
                    purchase_price=round(float(tx_dict.get("purchasePrice", 0.0) or 0.0), 2),
                    date=tx_dict.get("date", ""),
                    note=tx_dict.get("note", ""),
                ))
            imported_records += 1

        # 5. Other Transactions
        for ot_dict in payload.otherTransactions:
            otid = ot_dict.get("id")
            cpid = ot_dict.get("counterpartyId")
            if not otid or not cpid:
                continue
            existing_ot = await db.get(OtherTransaction, otid)
            if existing_ot:
                existing_ot.counterparty_id = cpid
                existing_ot.amount = round(float(ot_dict.get("amount", existing_ot.amount) or 0.0), 2)
                existing_ot.note = ot_dict.get("note", existing_ot.note)
                existing_ot.date = ot_dict.get("date", existing_ot.date)
            else:
                db.add(OtherTransaction(
                    id=otid,
                    counterparty_id=cpid,
                    amount=round(float(ot_dict.get("amount", 0.0) or 0.0), 2),
                    note=ot_dict.get("note", ""),
                    date=ot_dict.get("date", ""),
                ))
            imported_records += 1

        await db.commit()
        return imported_records
