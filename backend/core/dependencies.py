import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials
from backend.core.security import security, verify_access_token
from backend.core.config import settings

# In-memory sliding window rate limiter
_request_history: Dict[str, List[float]] = defaultdict(list)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Enforces authentication for all protected endpoints.
    Requires a valid JWT Bearer token signed with current SECRET_KEY.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Необходима авторизация (Bearer токен)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный или истекший токен сессии. Авторизуйтесь снова.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("sub") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для выполнения операции",
        )

    return payload

class RateLimiter:
    """Sliding-window IP rate limiter to protect against brute-force attacks."""
    def __init__(self, requests_per_minute: int = 15):
        self.limit = requests_per_minute
        self.window = 60.0

    async def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Clean older timestamps
        timestamps = _request_history[client_ip]
        _request_history[client_ip] = [t for t in timestamps if now - t < self.window]
        
        if len(_request_history[client_ip]) >= self.limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Слишком много попыток входа. Подождите 1 минуту перед следующей попыткой.",
            )
        
        _request_history[client_ip].append(now)

# Default auth rate limiter instance
auth_rate_limiter = RateLimiter(requests_per_minute=settings.AUTH_RATE_LIMIT_PER_MINUTE)
