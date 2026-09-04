from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.config import settings
from backend.models import AdminAuth
from backend.schemas import LoginRequest, TokenResponse, TotpSetupResponse, TotpVerifyRequest
from backend.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    generate_totp_secret,
    get_totp_uri,
    verify_totp_code,
    get_current_admin
)

router = APIRouter(prefix="/auth", tags=["Auth"])

async def get_or_create_admin_auth(db: AsyncSession) -> AdminAuth:
    result = await db.execute(select(AdminAuth).filter(AdminAuth.id == 1))
    auth = result.scalars().first()
    if not auth:
        auth = AdminAuth(
            id=1,
            master_password_hash=get_password_hash(settings.MASTER_PASSWORD),
            totp_enabled=False,
            created_at=datetime.now(timezone.utc)
        )
        db.add(auth)
        await db.commit()
        await db.refresh(auth)
    return auth

@router.get("/status")
async def auth_status(db: AsyncSession = Depends(get_db)):
    auth = await get_or_create_admin_auth(db)
    return {
        "totp_enabled": auth.totp_enabled,
        "last_login": auth.last_login_at
    }

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    auth = await get_or_create_admin_auth(db)

    # If TOTP is enabled, accept valid 6-digit TOTP code OR master password
    authenticated = False
    
    if req.totp_code and auth.totp_enabled and auth.totp_secret:
        if verify_totp_code(auth.totp_secret, req.totp_code):
            authenticated = True

    if not authenticated and req.password:
        if verify_password(req.password, auth.master_password_hash):
            authenticated = True
        elif req.password == settings.MASTER_PASSWORD:
            # Fallback if hash was not updated
            auth.master_password_hash = get_password_hash(settings.MASTER_PASSWORD)
            authenticated = True

    if not authenticated:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный пароль доступа или код Google Authenticator"
        )

    auth.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    expire_delta = timedelta(days=req.remember_days or 7)
    token = create_access_token({"sub": "admin"}, expires_delta=expire_delta)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_days=req.remember_days or 7,
        totp_enabled=auth.totp_enabled
    )

@router.get("/totp/setup", response_model=TotpSetupResponse)
async def setup_totp(user=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    secret = generate_totp_secret()
    otpauth_url = get_totp_uri(secret, account_name="admin@debet.auto", issuer="Debet.auto")
    return TotpSetupResponse(secret=secret, otpauth_url=otpauth_url)

@router.post("/totp/enable")
async def enable_totp(req: TotpVerifyRequest, user=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    if not req.secret:
        raise HTTPException(status_code=400, detail="Секрет TOTP не передан")
    
    if not verify_totp_code(req.secret, req.code):
        raise HTTPException(status_code=400, detail="Неверный 6-значный проверочный код")

    auth = await get_or_create_admin_auth(db)
    auth.totp_secret = req.secret
    auth.totp_enabled = True
    await db.commit()

    return {"success": True, "message": "Google Authenticator успешно подключен"}

@router.post("/totp/disable")
async def disable_totp(user=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    auth = await get_or_create_admin_auth(db)
    auth.totp_enabled = False
    auth.totp_secret = None
    await db.commit()
    return {"success": True, "message": "Google Authenticator отключен"}
