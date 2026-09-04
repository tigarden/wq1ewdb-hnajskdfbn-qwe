# Backward compatibility re-export
from backend.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_access_token,
    generate_totp_secret,
    get_totp_uri,
    verify_totp_code,
    security
)
from backend.core.dependencies import get_current_admin

__all__ = [
    "verify_password",
    "get_password_hash",
    "create_access_token",
    "verify_access_token",
    "generate_totp_secret",
    "get_totp_uri",
    "verify_totp_code",
    "security",
    "get_current_admin"
]
