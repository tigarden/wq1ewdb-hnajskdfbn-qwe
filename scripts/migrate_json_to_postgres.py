"""
Script for migrating data from debet-data.json / INITIAL_DATA into PostgreSQL (or current active database).
Usage:
    python scripts/migrate_json_to_postgres.py
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime, timezone
import asyncio

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.database import engine, Base, AsyncSessionLocal
from backend.models import Client, ClientTransaction, Supplier, OtherCounterparty, OtherTransaction, AdminAuth
from backend.security import get_password_hash
from backend.config import settings

INITIAL_DATA = {
    "clients": [
        {"id": "cli-1", "name": "Тотус", "phone": "", "car": "", "initial_balance": 0.0, "notes": ""},
        {"id": "cli-2", "name": "Тотус 2", "phone": "", "car": "", "initial_balance": 0.0, "notes": ""},
        {"id": "cli-3", "name": "Эрик", "phone": "", "car": "Range Rover / Chery", "initial_balance": 0.0, "notes": ""},
        {"id": "cli-4", "name": "Витя", "phone": "", "car": "Passat / Vito", "initial_balance": 0.0, "notes": ""},
    ],
    "suppliers": ["Склад", "Партс-Трейд", "Автодок", "Одесса", "Тотус", "Эрнест", "Витя"],
    "otherCounterparties": [
        {"id": "oth-1", "name": "Махмуд", "phone": "", "notes": ""},
        {"id": "oth-2", "name": "Ваня ОД2", "phone": "", "notes": ""},
        {"id": "oth-3", "name": "Саня", "phone": "", "notes": ""},
    ]
}

async def run_migration():
    print(f"Connecting to database: {settings.DATABASE_URL}")
    
    # 1. Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables initialized.")

    # 2. Check for data in data/debet-data.json
    json_path = PROJECT_ROOT / "data" / "debet-data.json"
    file_data = {}
    if json_path.exists():
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                file_data = json.load(f)
            print(f"Found existing {json_path.name}")
        except Exception as e:
            print(f"Could not load {json_path}: {e}")

    async with AsyncSessionLocal() as db:
        # Check if clients already exist in DB
        from sqlalchemy import select
        existing_clients = await db.execute(select(Client))
        if existing_clients.scalars().first():
            print("Database already contains clients. Skipping initial seed.")
        else:
            print("Seeding initial data into database...")
            # Seed clients
            clients_to_seed = file_data.get("clients") or file_data.get("suppliers") or INITIAL_DATA["clients"]
            for c in clients_to_seed:
                cid = c.get("id") or f"cli-{c.get('name')}"
                client = Client(
                    id=cid,
                    name=c.get("name", "Без имени"),
                    phone=c.get("phone", ""),
                    car=c.get("car", ""),
                    initial_balance=float(c.get("initialBalance", c.get("initial_balance", 0.0)) or 0.0),
                    notes=c.get("notes", ""),
                )
                db.add(client)

            # Seed suppliers
            suppliers_list = file_data.get("suppliersList") or INITIAL_DATA["suppliers"]
            for s_name in set(suppliers_list):
                if s_name.strip():
                    db.add(Supplier(name=s_name.strip()))

            # Seed other counterparties
            others_list = file_data.get("otherCounterparties") or INITIAL_DATA["otherCounterparties"]
            for cp in others_list:
                db.add(OtherCounterparty(
                    id=cp.get("id", f"oth-{cp.get('name')}"),
                    name=cp.get("name", ""),
                    phone=cp.get("phone", ""),
                    notes=cp.get("notes", ""),
                ))

            # Initialize AdminAuth with Master Password
            admin = AdminAuth(
                id=1,
                master_password_hash=get_password_hash(settings.MASTER_PASSWORD),
                totp_enabled=False,
                created_at=datetime.now(timezone.utc)
            )
            db.add(admin)

            await db.commit()
            print("Successfully migrated initial clients, suppliers, and counterparties to database!")

if __name__ == "__main__":
    asyncio.run(run_migration())
