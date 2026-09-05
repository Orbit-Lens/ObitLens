"""
processing-service/app/api/deps.py
Internal API key dependency — timing-safe comparison.
Blueprint §7 — crypto.timingSafeEqual equivalent in Python (hmac.compare_digest).
"""
import hmac
from fastapi import Header, HTTPException, status
from app.config import settings


def verify_internal_key(x_internal_key: str = Header(..., alias="X-Internal-Key")) -> None:
    """
    FastAPI dependency that validates the X-Internal-Key header.
    Uses hmac.compare_digest() for timing-safe comparison to prevent
    timing side-channel attacks.
    """
    is_valid = hmac.compare_digest(
        x_internal_key.encode("utf-8"),
        settings.internal_api_key.encode("utf-8"),
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Invalid internal API key"},
        )
