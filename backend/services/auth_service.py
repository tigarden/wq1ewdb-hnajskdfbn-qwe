from datetime import datetime, timezone
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.core.config import settings
from backend.core.security import (
    async_verify_password,
    async_get_password_hash,
    verify_totp_code
)
from backend.models import AdminAuth

class AuthService:
    @staticmethod
    async def get_or_create_admin_auth(db: AsyncSession) -> AdminAuth:
        """Fetch or initialize the single admin authentication record."""
        result = await db.execute(select(AdminAuth).filter(AdminAuth.id == 1))
        auth = result.scalars().first()
        if not auth:
            initial_hash = await async_get_password_hash(settings.MASTER_PASSWORD)
            auth = AdminAuth(
                id=1,
                master_password_hash=initial_hash,
                totp_enabled=False,
                created_at=datetime.now(timezone.utc)
            )
            db.add(auth)
            await db.commit()
            await db.refresh(auth)
        elif not auth.master_password_hash:
            auth.master_password_hash = await async_get_password_hash(settings.MASTER_PASSWORD)
            await db.commit()
        return auth

    @classmethod
    async def authenticate(
        cls,
        db: AsyncSession,
        password: Optional[str] = None,
        totp_code: Optional[str] = None
    ) -> Tuple[bool, AdminAuth]:
        """
        Authenticate admin user.
        Supports either:
        - Master password verification against current hash in DB.
        - TOTP 6-digit verification when TOTP is activated.
        Strictly enforces credentials and eliminates default password backdoors.
        """
        auth = await cls.get_or_create_admin_auth(db)
        # 1. Verify Password (Factor 1)
        if not password or not auth.master_password_hash:
            return False, auth

        if not await async_verify_password(password, auth.master_password_hash):
            return False, auth

        # 2. If 2FA is active, strictly require and verify Google Authenticator TOTP (Factor 2)
        if auth.totp_enabled:
            if not totp_code or not auth.totp_secret:
                return False, auth
            if not verify_totp_code(auth.totp_secret, totp_code):
                return False, auth

        authenticated = True
        auth.last_login_at = datetime.now(timezone.utc)
        await db.commit()

        return authenticated, auth

    @classmethod
    async def change_password(
        cls,
        db: AsyncSession,
        old_password: str,
        new_password: str
    ) -> bool:
        """Change master password strictly after verifying current password against stored hash."""
        auth = await cls.get_or_create_admin_auth(db)
        if not auth.master_password_hash:
            return False

        valid = await async_verify_password(old_password, auth.master_password_hash)
        if not valid:
            return False

        auth.master_password_hash = await async_get_password_hash(new_password)
        await db.commit()
        return True

    @classmethod
    async def enable_totp(cls, db: AsyncSession, secret: str, code: str) -> bool:
        """Verify code and activate TOTP."""
        if not verify_totp_code(secret, code):
            return False
        auth = await cls.get_or_create_admin_auth(db)
        auth.totp_secret = secret
        auth.totp_enabled = True
        await db.commit()
        return True

    @classmethod
    async def disable_totp(cls, db: AsyncSession) -> bool:
        """Deactivate TOTP."""
        auth = await cls.get_or_create_admin_auth(db)
        auth.totp_enabled = False
        auth.totp_secret = None
        await db.commit()
        return True
