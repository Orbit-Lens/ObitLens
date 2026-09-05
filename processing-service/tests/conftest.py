"""
processing-service/tests/conftest.py
Shared pytest fixtures for unit and API tests.
"""
from __future__ import annotations

import os
import tempfile
from pathlib import Path
from typing import Generator
from unittest.mock import MagicMock, patch

import numpy as np
import pytest
import rasterio
from fastapi.testclient import TestClient
from rasterio.transform import from_bounds


# ── Environment setup ─────────────────────────────────────────────────────────

def pytest_configure(config):
    """Set required env vars before importing any app module."""
    os.environ.setdefault("ENV", "test")
    os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
    os.environ.setdefault("S3_ENDPOINT", "http://localhost:9000")
    os.environ.setdefault("S3_BUCKET", "orbitlens-test")
    os.environ.setdefault("S3_ACCESS_KEY_ID", "minioadmin")
    os.environ.setdefault("S3_SECRET_ACCESS_KEY", "minioadmin")
    os.environ.setdefault("INTERNAL_API_KEY", "test-internal-key-32-chars-minimum!!")
    os.environ.setdefault("WEB_BACKEND_CALLBACK_URL", "http://localhost:5000/api/v1/jobs/callback")
    os.environ.setdefault("WEB_BACKEND_CALLBACK_KEY", "test-internal-key-32-chars-minimum!!")


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def tmp_dir() -> Generator[str, None, None]:
    """Provide a temporary directory that is cleaned up after the test."""
    with tempfile.TemporaryDirectory() as d:
        yield d


@pytest.fixture
def synthetic_image_512() -> np.ndarray:
    """
    512×512 float32 synthetic lunar-like image with craters.
    Blueprint — ALGORITHM_NOTES.md baseline: synthetic_512x512_affine.
    """
    rng = np.random.default_rng(42)
    img = rng.uniform(0.2, 0.8, (512, 512)).astype(np.float32)

    # Add synthetic crater-like circular features
    for (cy, cx, r) in [(128, 128, 30), (350, 250, 50), (200, 400, 20), (400, 100, 40)]:
        yy, xx = np.ogrid[:512, :512]
        mask = (yy - cy) ** 2 + (xx - cx) ** 2 < r ** 2
        img[mask] *= 0.3  # dark crater floor

    return img


@pytest.fixture
def synthetic_geotiff(tmp_dir: str, synthetic_image_512: np.ndarray) -> str:
    """Write a synthetic GeoTIFF to disk and return the path."""
    path = os.path.join(tmp_dir, "synthetic.tif")
    transform = from_bounds(0, 0, 1, 1, 512, 512)
    with rasterio.open(
        path, "w",
        driver="GTiff",
        height=512, width=512,
        count=1, dtype="float32",
        transform=transform,
    ) as ds:
        ds.write(synthetic_image_512, 1)
    return path


@pytest.fixture
def test_client():
    """FastAPI TestClient with the internal API key header pre-set."""
    from app.main import app
    with TestClient(app) as client:
        yield client


@pytest.fixture
def internal_headers():
    """Headers with valid internal API key."""
    return {"X-Internal-Key": "test-internal-key-32-chars-minimum!!"}
