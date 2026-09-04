from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, String, Numeric, Text, DateTime, ForeignKey, Integer, Boolean, Index
from sqlalchemy.orm import relationship
from backend.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Client(Base):
    __tablename__ = "clients"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    client_type = Column(String(32), default="retail")
    phone = Column(String(64), default="")
    car = Column(String(255), default="")
    initial_balance = Column(Numeric(12, 2, asdecimal=True), default=Decimal("0.00"))
    notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    transactions = relationship(
        "ClientTransaction",
        back_populates="client",
        cascade="all, delete-orphan",
        order_by="desc(ClientTransaction.created_at)"
    )

class ClientTransaction(Base):
    __tablename__ = "client_transactions"

    id = Column(String(64), primary_key=True, index=True)
    client_id = Column(String(64), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(32), nullable=False)  # 'item' or 'payment'
    article = Column(String(128), index=True, default="")
    description = Column(Text, default="")
    car_name = Column(String(255), default="")
    supplier_name = Column(String(255), default="")
    amount = Column(Numeric(12, 2, asdecimal=True), default=Decimal("0.00"))
    purchase_price = Column(Numeric(12, 2, asdecimal=True), default=Decimal("0.00"))
    date = Column(String(32), index=True, default="")
    note = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    __table_args__ = (
        Index("ix_client_transactions_client_date", "client_id", "date", "created_at"),
    )

    client = relationship("Client", back_populates="transactions")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

class OtherCounterparty(Base):
    __tablename__ = "other_counterparties"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    phone = Column(String(64), default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    transactions = relationship(
        "OtherTransaction",
        back_populates="counterparty",
        cascade="all, delete-orphan",
        order_by="desc(OtherTransaction.created_at)"
    )

class OtherTransaction(Base):
    __tablename__ = "other_transactions"

    id = Column(String(64), primary_key=True, index=True)
    counterparty_id = Column(String(64), ForeignKey("other_counterparties.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(12, 2, asdecimal=True), default=Decimal("0.00"))
    note = Column(Text, default="")
    date = Column(String(32), index=True, default="")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    __table_args__ = (
        Index("ix_other_transactions_cp_date", "counterparty_id", "date", "created_at"),
    )

    counterparty = relationship("OtherCounterparty", back_populates="transactions")

class AdminAuth(Base):
    __tablename__ = "admin_auth"

    id = Column(Integer, primary_key=True, default=1)
    master_password_hash = Column(String(255), nullable=True)
    totp_secret = Column(String(128), nullable=True)
    totp_enabled = Column(Boolean, default=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
