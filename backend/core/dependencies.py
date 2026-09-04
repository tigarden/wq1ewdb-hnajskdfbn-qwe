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
    """Sliding-window IP rate limiter to protect against brute-force attacks with memory cleanup."""
    def __init__(self, requests_per_minute: int = 15):
        self.limit = requests_per_minute
        self.window = 60.0
        self._last_cleanup = time.time()

    def _cleanup_expired(self, now: float):
        """Prune inactive client entries to prevent unbounded memory growth."""
        if now - self._last_cleanup < 30.0:
            return
        self._last_cleanup = now
        expired_ips = [ip for ip, times in _request_history.items() if not times or (now - times[-1] >= self.window)]
        for ip in expired_ips:
            _request_history.pop(ip, None)

    async def __call__(self, request: Request):
        # Support reverse proxy headers (e.g. Nginx, Cloudflare, Traefik)
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"

        now = time.time()
        self._cleanup_expired(now)

        # Clean older timestamps for current IP
        timestamps = _request_history.get(client_ip, [])
        valid_timestamps = [t for t in timestamps if now - t < self.window]

        if len(valid_timestamps) >= self.limit:
            _request_history[client_ip] = valid_timestamps
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Слишком много попыток входа. Подождите 1 минуту перед следующей попыткой.",
            )

        valid_timestamps.append(now)
        _request_history[client_ip] = valid_timestamps

# Default auth rate limiter instance
auth_rate_limiter = RateLimiter(requests_per_minute=settings.AUTH_RATE_LIMIT_PER_MINUTE)
