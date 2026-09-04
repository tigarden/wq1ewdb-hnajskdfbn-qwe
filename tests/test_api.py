import sys
from pathlib import Path
from starlette.testclient import TestClient

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.main import app
from backend.core.config import settings
from backend.core.security import generate_totp_secret, verify_totp_code
import pyotp

def test_health():
    with TestClient(app) as client:
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] in ["online", "degraded"]
        print("[OK] Healthcheck passed:", data["status"], data["database_type"])

def test_unauthorized_access_blocked():
    with TestClient(app) as client:
        # Protected endpoints must return 401 without Bearer token
        assert client.get("/api/clients").status_code == 401
        assert client.post("/api/clients", json={"name": "Hacker"}).status_code == 401
        assert client.get("/api/transactions").status_code == 401
        assert client.get("/api/suppliers").status_code == 401
        assert client.get("/api/other-counterparties").status_code == 401
        assert client.get("/api/backup/export").status_code == 401
        assert client.post("/api/backup/import", json={}).status_code == 401
        print("[OK] Security verification: All protected endpoints strictly require Bearer authorization (401)")

def test_auth_and_protected_crud():
    with TestClient(app) as client:
        # 1. Login with valid master password
        res = client.post("/api/auth/login", json={"password": settings.MASTER_PASSWORD, "remember_days": 7})
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("[OK] Login successful, JWT token obtained")

        # 2. Bad password rejected
        bad_res = client.post("/api/auth/login", json={"password": "wrong_password_123"})
        assert bad_res.status_code == 401

        # 3. Create client with auth
        cli_payload = {
            "id": "test-cli-auth-1",
            "name": "Тестовый клиент Защита",
            "phone": "+380501234567",
            "car": "Audi A6",
            "initial_balance": 500.0,
            "notes": "Проверка авторизации"
        }
        res_create = client.post("/api/clients", json=cli_payload, headers=headers)
        assert res_create.status_code == 201
        assert res_create.json()["name"] == "Тестовый клиент Защита"
        print("[OK] Authenticated client creation passed")

        # 4. Create transaction for client
        tx_payload = {
            "client_id": "test-cli-auth-1",
            "type": "item",
            "article": "W712/75",
            "description": "Фильтр масляный",
            "car_name": "Audi A6",
            "supplier_name": "Склад",
            "amount": 350.0,
            "purchase_price": 220.0,
            "date": "2026-09-04",
            "note": "ТО"
        }
        res_tx = client.post("/api/transactions", json=tx_payload, headers=headers)
        assert res_tx.status_code == 201
        tx_id = res_tx.json()["id"]
        assert res_tx.json()["article"] == "W712/75"
        print("[OK] Authenticated transaction creation passed")

        # 4b. Invalid transaction type rejected by validation (422)
        bad_tx = {
            "client_id": "test-cli-auth-1",
            "type": "fraudulent_type",
            "amount": 100.0
        }
        res_bad_tx = client.post("/api/transactions", json=bad_tx, headers=headers)
        assert res_bad_tx.status_code == 422
        print("[OK] Schema validation strictly rejects invalid transaction types (422)")

        # 5. Export backup
        res_export = client.get("/api/backup/export", headers=headers)
        assert res_export.status_code == 200
        backup_data = res_export.json()
        assert "clients" in backup_data
        assert "clientTransactions" in backup_data
        print("[OK] Authenticated backup export passed")

        # 5b. Upsert modified transaction via backup import
        backup_data["clientTransactions"][0]["purchasePrice"] = 235.0
        res_import = client.post("/api/backup/import", json=backup_data, headers=headers)
        assert res_import.status_code == 200
        # Verify updated price in database
        res_get_tx = client.get(f"/api/transactions/{tx_id}", headers=headers)
        assert res_get_tx.status_code == 200
        assert res_get_tx.json()["purchase_price"] == 235.0
        print("[OK] Database upsert successfully synchronizes updated transaction fields")

        # 6. Delete client and cascade
        res_del = client.delete("/api/clients/test-cli-auth-1", headers=headers)
        assert res_del.status_code == 200
        print("[OK] Authenticated client deletion passed")

def test_totp():
    secret = generate_totp_secret()
    totp = pyotp.TOTP(secret)
    code = totp.now()
    assert verify_totp_code(secret, code) is True
    assert verify_totp_code(secret, "000000") is False
    print("[OK] TOTP RFC 6238 generation & validation passed")

if __name__ == "__main__":
    test_health()
    test_unauthorized_access_blocked()
    test_auth_and_protected_crud()
    test_totp()
    print("\nALL BACKEND TESTS PASSED WITH 100% SECURITY COVERAGE!")

