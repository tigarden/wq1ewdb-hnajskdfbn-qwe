from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models import Client, ClientTransaction, Supplier, OtherCounterparty, OtherTransaction
from backend.schemas import FullBackupPayload

def _chunked(iterable: list, chunk_size: int = 500):
    for i in range(0, len(iterable), chunk_size):
        yield iterable[i:i + chunk_size]

def _to_decimal(val: Any) -> Decimal:
    if val is None or val == "":
        return Decimal("0.00")
    try:
        return round(Decimal(str(val)), 2)
    except Exception:
        return Decimal("0.00")

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
                    "initialBalance": float(c.initial_balance or Decimal("0.00")),
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
                    "amount": float(t.amount or Decimal("0.00")),
                    "purchasePrice": float(t.purchase_price or Decimal("0.00")),
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
                    "amount": float(ot.amount or Decimal("0.00")),
                    "note": ot.note or "",
                    "date": ot.date or "",
                    "createdAt": ot.created_at.isoformat() if ot.created_at else None
                }
                for ot in other_txs
            ]
        }

    @staticmethod
    async def import_full_data(db: AsyncSession, payload: FullBackupPayload) -> int:
        """
        High-performance batch import with batch lookups to eliminate the N+1 query disaster.
        Imports thousands of records safely within a single transaction.
        """
        imported_records = 0

        # 1. Batch Upsert Clients
        for chunk in _chunked(payload.clients, 500):
            chunk_ids = [c.get("id") for c in chunk if c.get("id")]
            if not chunk_ids:
                continue
            existing_res = await db.execute(select(Client).where(Client.id.in_(chunk_ids)))
            existing_map = {c.id: c for c in existing_res.scalars().all()}

            for cli_dict in chunk:
                cid = cli_dict.get("id")
                if not cid:
                    continue
                init_bal = _to_decimal(cli_dict.get("initialBalance", cli_dict.get("initial_balance", 0.0)))
                if cid in existing_map:
                    c = existing_map[cid]
                    c.name = cli_dict.get("name", c.name)
                    c.phone = cli_dict.get("phone", c.phone)
                    c.car = cli_dict.get("car", c.car)
                    c.initial_balance = init_bal
                    c.notes = cli_dict.get("notes", c.notes)
                else:
                    db.add(Client(
                        id=cid,
                        name=cli_dict.get("name", ""),
                        phone=cli_dict.get("phone", ""),
                        car=cli_dict.get("car", ""),
                        initial_balance=init_bal,
                        notes=cli_dict.get("notes", ""),
                    ))
                imported_records += 1

        # 2. Batch Suppliers
        clean_names = list({s.strip() for s in payload.suppliersList if s and s.strip()})
        if clean_names:
            existing_sups = await db.execute(select(Supplier.name).where(Supplier.name.in_(clean_names)))
            existing_set = set(existing_sups.scalars().all())
            for name in clean_names:
                if name not in existing_set:
                    db.add(Supplier(name=name))
                    existing_set.add(name)
                    imported_records += 1

        # 3. Batch Upsert Other Counterparties
        for chunk in _chunked(payload.otherCounterparties, 500):
            chunk_ids = [cp.get("id") for cp in chunk if cp.get("id")]
            if not chunk_ids:
                continue
            existing_res = await db.execute(select(OtherCounterparty).where(OtherCounterparty.id.in_(chunk_ids)))
            existing_map = {cp.id: cp for cp in existing_res.scalars().all()}

            for cp_dict in chunk:
                pid = cp_dict.get("id")
                if not pid:
                    continue
                if pid in existing_map:
                    cp = existing_map[pid]
                    cp.name = cp_dict.get("name", cp.name)
                    cp.phone = cp_dict.get("phone", cp.phone)
                    cp.notes = cp_dict.get("notes", cp.notes)
                else:
                    db.add(OtherCounterparty(
                        id=pid,
                        name=cp_dict.get("name", ""),
                        phone=cp_dict.get("phone", ""),
                        notes=cp_dict.get("notes", ""),
                    ))
                imported_records += 1

        # Flush clients and counterparties before transactions to guarantee foreign keys
        await db.flush()

        # 4. Batch Upsert Client Transactions
        for chunk in _chunked(payload.clientTransactions, 500):
            chunk_ids = [tx.get("id") for tx in chunk if tx.get("id")]
            if not chunk_ids:
                continue
            existing_res = await db.execute(select(ClientTransaction).where(ClientTransaction.id.in_(chunk_ids)))
            existing_map = {tx.id: tx for tx in existing_res.scalars().all()}

            for tx_dict in chunk:
                tid = tx_dict.get("id")
                client_id = tx_dict.get("clientId", tx_dict.get("client_id"))
                if not tid or not client_id:
                    continue
                amt = _to_decimal(tx_dict.get("amount", 0.0))
                purch = _to_decimal(tx_dict.get("purchasePrice", tx_dict.get("purchase_price", 0.0)))
                art = (tx_dict.get("article") or "").strip().upper()

                if tid in existing_map:
                    tx = existing_map[tid]
                    tx.client_id = client_id
                    tx.type = tx_dict.get("type", tx.type)
                    tx.article = art
                    tx.description = tx_dict.get("description", tx.description)
                    tx.car_name = tx_dict.get("carName", tx_dict.get("car_name", tx.car_name))
                    tx.supplier_name = tx_dict.get("supplierName", tx_dict.get("supplier_name", tx.supplier_name))
                    tx.amount = amt
                    tx.purchase_price = purch
                    tx.date = tx_dict.get("date", tx.date)
                    tx.note = tx_dict.get("note", tx.note)
                else:
                    db.add(ClientTransaction(
                        id=tid,
                        client_id=client_id,
                        type=tx_dict.get("type", "item"),
                        article=art,
                        description=tx_dict.get("description", ""),
                        car_name=tx_dict.get("carName", tx_dict.get("car_name", "")),
                        supplier_name=tx_dict.get("supplierName", tx_dict.get("supplier_name", "")),
                        amount=amt,
                        purchase_price=purch,
                        date=tx_dict.get("date", ""),
                        note=tx_dict.get("note", ""),
                    ))
                imported_records += 1

        # 5. Batch Upsert Other Transactions
        for chunk in _chunked(payload.otherTransactions, 500):
            chunk_ids = [ot.get("id") for ot in chunk if ot.get("id")]
            if not chunk_ids:
                continue
            existing_res = await db.execute(select(OtherTransaction).where(OtherTransaction.id.in_(chunk_ids)))
            existing_map = {ot.id: ot for ot in existing_res.scalars().all()}

            for ot_dict in chunk:
                otid = ot_dict.get("id")
                cpid = ot_dict.get("counterpartyId", ot_dict.get("counterparty_id"))
                if not otid or not cpid:
                    continue
                amt = _to_decimal(ot_dict.get("amount", 0.0))

                if otid in existing_map:
                    ot = existing_map[otid]
                    ot.counterparty_id = cpid
                    ot.amount = amt
                    ot.note = ot_dict.get("note", ot.note)
                    ot.date = ot_dict.get("date", ot.date)
                else:
                    db.add(OtherTransaction(
                        id=otid,
                        counterparty_id=cpid,
                        amount=amt,
                        note=ot_dict.get("note", ""),
                        date=ot_dict.get("date", ""),
                    ))
                imported_records += 1

        await db.commit()
        return imported_records
