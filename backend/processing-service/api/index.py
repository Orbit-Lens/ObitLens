"""
Vercel serverless function entrypoint.
Exposes the FastAPI application instance for @vercel/python runtime.
"""
from app.main import app

__all__ = ["app"]
