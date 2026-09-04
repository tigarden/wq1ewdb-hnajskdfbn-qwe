from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

# --- Client Schemas ---
class ClientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = ""
    car: Optional[str] = ""
    initial_balance: Optional[float] = 0.0
    notes: Optional[str] = ""

class ClientCreate(ClientBase):
    id: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    car: Optional[str] = None
    initial_balance: Optional[float] = None
    notes: Optional[str] = None

class ClientOut(ClientBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Client Transaction Schemas ---
class ClientTransactionBase(BaseModel):
    type: str = Field(..., pattern="^(item|payment)$")
    article: Optional[str] = ""
    description: Optional[str] = ""
    car_name: Optional[str] = ""
    supplier_name: Optional[str] = ""
    amount: float = 0.0
    purchase_price: Optional[float] = 0.0
    date: Optional[str] = ""
    note: Optional[str] = ""

class ClientTransactionCreate(ClientTransactionBase):
    id: Optional[str] = None
    client_id: str

class ClientTransactionUpdate(BaseModel):
    type: Optional[str] = None
    article: Optional[str] = None
    description: Optional[str] = None
    car_name: Optional[str] = None
    supplier_name: Optional[str] = None
    amount: Optional[float] = None
    purchase_price: Optional[float] = None
    date: Optional[str] = None
    note: Optional[str] = None

class ClientTransactionOut(ClientTransactionBase):
    id: str
    client_id: str
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Supplier Schemas ---
class SupplierBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)

class SupplierCreate(SupplierBase):
    pass

class SupplierOut(SupplierBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Other Counterparty Schemas ---
class OtherCounterpartyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = ""
    notes: Optional[str] = ""

class OtherCounterpartyCreate(OtherCounterpartyBase):
    id: Optional[str] = None

class OtherCounterpartyUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

class OtherCounterpartyOut(OtherCounterpartyBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Other Transaction Schemas ---
class OtherTransactionBase(BaseModel):
    amount: float = 0.0
    note: Optional[str] = ""
    date: Optional[str] = ""

class OtherTransactionCreate(OtherTransactionBase):
    id: Optional[str] = None
    counterparty_id: str

class OtherTransactionOut(OtherTransactionBase):
    id: str
    counterparty_id: str
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Auth & 2FA Schemas ---
class LoginRequest(BaseModel):
    password: Optional[str] = None
    totp_code: Optional[str] = None
    remember_days: Optional[int] = 7

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_days: int = 7
    totp_required: bool = False
    totp_enabled: bool = False

class TotpSetupResponse(BaseModel):
    secret: str
    otpauth_url: str

class TotpVerifyRequest(BaseModel):
    code: str
    secret: Optional[str] = None

# --- Full Backup & Seed Schemas ---
class FullBackupPayload(BaseModel):
    version: int = 3
    updatedAt: Optional[str] = None
    clients: List[dict] = []
    clientTransactions: List[dict] = []
    suppliersList: List[str] = []
    otherCounterparties: List[dict] = []
    otherTransactions: List[dict] = []

# --- Health Schema ---
class HealthResponse(BaseModel):
    status: str
    database: str
    database_type: str
    version: str
    total_clients: int
    total_transactions: int
