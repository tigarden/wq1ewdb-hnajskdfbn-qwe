import sys
from pathlib import Path
from starlette.testclient import TestClient

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.main import app
from backend.config import settings
from backend.security import generate_totp_secret, verify_totp_code
import pyotp

def test_health():
    with TestClient(app) as client:
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] in ["online", "degraded"]
        print("Healthcheck response:", data)

def test_auth_login():
    with TestClient(app) as client:
        # Valid password
        res = client.post("/api/auth/login", json={"password": settings.MASTER_PASSWORD, "remember_days": 7})
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["expires_in_days"] == 7
        token = data["access_token"]
        print("Login token received:", token[:20] + "...")

        # Invalid password
        bad_res = client.post("/api/auth/login", json={"password": "wrong_password"})
        assert bad_res.status_code == 401

def test_clients_crud():
    with TestClient(app) as client:
        # List clients
        res = client.get("/api/clients")
        assert res.status_code == 200
        clients = res.json()
        assert isinstance(clients, list)

        # Create new client
        new_cli = {
            "id": "test-cli-100",
            "name": "Тестовый клиент Авто",
            "phone": "+380991234567",
            "car": "BMW X5",
            "initial_balance": 1500.0,
            "notes": "Проверка API"
        }
        res_create = client.post("/api/clients", json=new_cli)
        assert res_create.status_code == 201
        created = res_create.json()
        assert created["name"] == "Тестовый клиент Авто"

        # Update client
        res_update = client.put("/api/clients/test-cli-100", json={"notes": "Обновленные заметки"})
        assert res_update.status_code == 200
        assert res_update.json()["notes"] == "Обновленные заметки"

        # Create client transaction
        tx = {
            "client_id": "test-cli-100",
            "type": "item",
            "article": "OC90",
            "description": "Фильтр масляный",
            "car_name": "BMW X5",
            "supplier_name": "Автодок",
            "amount": 450.0,
            "purchase_price": 280.0,
            "date": "2026-09-04",
            "note": "Замена масла"
        }
        res_tx = client.post("/api/transactions", json=tx)
        assert res_tx.status_code == 201
        tx_data = res_tx.json()
        assert tx_data["article"] == "OC90"

        # Delete client
        res_del = client.delete("/api/clients/test-cli-100")
        assert res_del.status_code == 200

def test_totp_generation_and_verification():
    secret = generate_totp_secret()
    totp = pyotp.TOTP(secret)
    current_code = totp.now()
    assert verify_totp_code(secret, current_code) == True
    assert verify_totp_code(secret, "000000") == False
    print("TOTP verification test passed with 6-digit code:", current_code)

if __name__ == "__main__":
    test_health()
    test_auth_login()
    test_clients_crud()
    test_totp_generation_and_verification()
    print("ALL API TESTS PASSED SUCCESSFULLY!")
