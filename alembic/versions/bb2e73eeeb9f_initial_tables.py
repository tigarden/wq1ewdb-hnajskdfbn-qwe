"""Initial tables

Revision ID: bb2e73eeeb9f
Revises: 
Create Date: 2026-09-04 19:58:11.672932

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bb2e73eeeb9f'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. clients
    op.create_table(
        'clients',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=64), server_default='', nullable=True),
        sa.Column('car', sa.String(length=255), server_default='', nullable=True),
        sa.Column('initial_balance', sa.Numeric(precision=12, scale=2), server_default='0.00', nullable=True),
        sa.Column('notes', sa.Text(), server_default='', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(op.f('ix_clients_id'), 'clients', ['id'], unique=False)
    op.create_index(op.f('ix_clients_name'), 'clients', ['name'], unique=False)

    # 2. client_transactions
    op.create_table(
        'client_transactions',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('client_id', sa.String(length=64), sa.ForeignKey('clients.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type', sa.String(length=32), nullable=False),
        sa.Column('article', sa.String(length=128), server_default='', nullable=True),
        sa.Column('description', sa.Text(), server_default='', nullable=True),
        sa.Column('car_name', sa.String(length=255), server_default='', nullable=True),
        sa.Column('supplier_name', sa.String(length=255), server_default='', nullable=True),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), server_default='0.00', nullable=True),
        sa.Column('purchase_price', sa.Numeric(precision=12, scale=2), server_default='0.00', nullable=True),
        sa.Column('date', sa.String(length=32), server_default='', nullable=True),
        sa.Column('note', sa.Text(), server_default='', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(op.f('ix_client_transactions_id'), 'client_transactions', ['id'], unique=False)
    op.create_index(op.f('ix_client_transactions_client_id'), 'client_transactions', ['client_id'], unique=False)
    op.create_index(op.f('ix_client_transactions_article'), 'client_transactions', ['article'], unique=False)
    op.create_index(op.f('ix_client_transactions_date'), 'client_transactions', ['date'], unique=False)
    op.create_index('ix_client_transactions_client_date', 'client_transactions', ['client_id', 'date', 'created_at'], unique=False)

    # 3. suppliers
    op.create_table(
        'suppliers',
        sa.Column('id', sa.Integer(), autoincrement=True, primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(op.f('ix_suppliers_name'), 'suppliers', ['name'], unique=True)

    # 4. other_counterparties
    op.create_table(
        'other_counterparties',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=64), server_default='', nullable=True),
        sa.Column('notes', sa.Text(), server_default='', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(op.f('ix_other_counterparties_id'), 'other_counterparties', ['id'], unique=False)
    op.create_index(op.f('ix_other_counterparties_name'), 'other_counterparties', ['name'], unique=False)

    # 5. other_transactions
    op.create_table(
        'other_transactions',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('counterparty_id', sa.String(length=64), sa.ForeignKey('other_counterparties.id', ondelete='CASCADE'), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), server_default='0.00', nullable=True),
        sa.Column('note', sa.Text(), server_default='', nullable=True),
        sa.Column('date', sa.String(length=32), server_default='', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(op.f('ix_other_transactions_id'), 'other_transactions', ['id'], unique=False)
    op.create_index(op.f('ix_other_transactions_counterparty_id'), 'other_transactions', ['counterparty_id'], unique=False)
    op.create_index(op.f('ix_other_transactions_date'), 'other_transactions', ['date'], unique=False)
    op.create_index('ix_other_transactions_cp_date', 'other_transactions', ['counterparty_id', 'date', 'created_at'], unique=False)

    # 6. admin_auth
    op.create_table(
        'admin_auth',
        sa.Column('id', sa.Integer(), primary_key=True, default=1),
        sa.Column('master_password_hash', sa.String(length=255), nullable=True),
        sa.Column('totp_secret', sa.String(length=128), nullable=True),
        sa.Column('totp_enabled', sa.Boolean(), server_default=sa.text('0'), nullable=True),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    )

def downgrade() -> None:
    op.drop_table('admin_auth')
    op.drop_table('other_transactions')
    op.drop_table('other_counterparties')
    op.drop_table('suppliers')
    op.drop_table('client_transactions')
    op.drop_table('clients')
