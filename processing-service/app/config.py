# processing-service/app/config.py
# Pydantic-settings env validation — crashes at startup if misconfigured.
# Blueprint §3 — Env Validation Pattern (Python processing service).

from pydantic_settings import BaseSettings
from pydantic import AnyUrl, field_validator
from typing import Optional


class Settings(BaseSettings):
    env: str = "development"
    port: int = 8000

    # Redis
    redis_url: str

    # Object storage
    s3_endpoint: str
    s3_bucket: str
    s3_access_key_id: str
    s3_secret_access_key: str
    s3_region: str = "us-east-1"

    # Internal API key (shared with web-backend)
    internal_api_key: str

    # Callback to web-backend
    web_backend_callback_url: str
    web_backend_callback_key: str

    # Matcher config
    default_matcher: str = "classical"  # classical | learned
    use_gpu: bool = False
    model_weights_uri: Optional[str] = None

    # Monitoring
    sentry_dsn: Optional[str] = None

    @field_validator("default_matcher")
    @classmethod
    def validate_matcher(cls, v: str) -> str:
        if v not in ("classical", "learned"):
            raise ValueError("default_matcher must be 'classical' or 'learned'")
        return v

    model_config = {"env_file": ".env", "case_sensitive": False}


# Crash fast on bad config — do not silently fall back
# Blueprint §3 — raises ValidationError if any required field is missing
settings = Settings()  # type: ignore[call-arg]
