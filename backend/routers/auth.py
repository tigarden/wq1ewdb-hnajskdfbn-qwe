from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.database import get_db
from backend.core.config import settings
from backend.core.security import create_access_token, generate_totp_secret, get_totp_uri
from backend.core.dependencies import get_current_admin, auth_rate_limiter
from backend.services.auth_service import AuthService
from backend.schemas import (
    LoginRequest,
    TokenResponse,
    TotpSetupResponse,
    TotpVerifyRequest,
    PasswordChangeRequest
)

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/status")
async def auth_status(db: AsyncSession = Depends(get_db)):
    """Public check to know if TOTP 2FA is active on the server."""
    auth = await AuthService.get_or_create_admin_auth(db)
    return {
        "totp_enabled": auth.totp_enabled,
        "last_login": auth.last_login_at
    }

@router.post("/login", response_model=TokenResponse, dependencies=[Depends(auth_rate_limiter)])
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticate with master password or Google Authenticator TOTP code.
    Protected by rate limiter against brute-force.
    """
    authenticated, auth = await AuthService.authenticate(
        db,
        password=req.password,
        totp_code=req.totp_code
    )

    if not authenticated:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный пароль доступа или 6-значный код Google Authenticator",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expire_days = req.remember_days if req.remember_days and req.remember_days > 0 else 7
    token = create_access_token({"sub": "admin"}, expires_delta=timedelta(days=expire_days))

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_days=expire_days,
        totp_enabled=auth.totp_enabled
    )

@router.get("/totp/setup", response_model=TotpSetupResponse)
async def setup_totp(user=Depends(get_current_admin)):
    """Generate a new random TOTP secret and otpauth QR URI (Admin only)."""
    secret = generate_totp_secret()
    otpauth_url = get_totp_uri(secret, account_name="admin@debet.auto", issuer="Debet.auto")
    return TotpSetupResponse(secret=secret, otpauth_url=otpauth_url)

@router.post("/totp/enable", dependencies=[Depends(auth_rate_limiter)])
async def enable_totp(
    req: TotpVerifyRequest,
    user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Verify code and enable TOTP 2FA (Admin only)."""
    if not req.secret:
        raise HTTPException(status_code=400, detail="Секрет TOTP не передан")

    success = await AuthService.enable_totp(db, secret=req.secret, code=req.code)
    if not success:
        raise HTTPException(status_code=400, detail="Неверный 6-значный проверочный код")

    return {"success": True, "message": "Google Authenticator успешно подключен"}

@router.post("/totp/disable")
async def disable_totp(
    user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Disable TOTP 2FA (Admin only)."""
    await AuthService.disable_totp(db)
    return {"success": True, "message": "Google Authenticator отключен"}

@router.post("/change-password")
async def change_password(
    req: PasswordChangeRequest,
    user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Change master password securely (Admin only)."""
    success = await AuthService.change_password(db, old_password=req.old_password, new_password=req.new_password)
    if not success:
        raise HTTPException(status_code=400, detail="Текущий пароль указан неверно")

    return {"success": True, "message": "Мастер-пароль успешно изменен"}
