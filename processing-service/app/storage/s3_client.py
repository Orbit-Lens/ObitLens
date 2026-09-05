"""
processing-service/app/storage/s3_client.py
S3/MinIO client — download and upload raster artifacts using boto3.
Blueprint §4 — Never buffer multi-GB imagery; always stream to/from disk.
"""
from __future__ import annotations

import logging
import os
import tempfile
from pathlib import Path

import boto3
from botocore.config import Config

from app.config import settings

logger = logging.getLogger(__name__)


def _make_client() -> "boto3.client":
    """Create a boto3 S3 client configured for MinIO or AWS S3."""
    kwargs: dict = {
        "aws_access_key_id": settings.s3_access_key_id,
        "aws_secret_access_key": settings.s3_secret_access_key,
        "region_name": settings.s3_region,
        "config": Config(
            retries={"max_attempts": 3, "mode": "adaptive"},
            signature_version="s3v4",
        ),
    }
    # MinIO requires a custom endpoint; AWS S3 uses the default
    if settings.s3_endpoint:
        kwargs["endpoint_url"] = settings.s3_endpoint

    return boto3.client("s3", **kwargs)


_client = None


def get_client():
    """Return a module-level singleton S3 client."""
    global _client
    if _client is None:
        _client = _make_client()
    return _client


def _key_from_uri(storage_uri: str) -> str:
    """
    Extract the S3 object key from a storage URI.
    Supports: s3://bucket/key  →  key
    """
    if storage_uri.startswith("s3://"):
        parts = storage_uri[5:].split("/", 1)
        if len(parts) == 2:
            return parts[1]
        raise ValueError(f"Invalid S3 URI: {storage_uri}")
    raise ValueError(f"Unsupported storage URI scheme: {storage_uri}")


def download_to_file(storage_uri: str, local_path: str) -> None:
    """
    Stream-download an S3 object to a local file.
    Never loads the full file into memory.
    Blueprint §4 — Always stream; never buffer multi-GB imagery.
    """
    key = _key_from_uri(storage_uri)
    logger.info("Downloading s3://%s/%s → %s", settings.s3_bucket, key, local_path)
    Path(local_path).parent.mkdir(parents=True, exist_ok=True)
    get_client().download_file(settings.s3_bucket, key, local_path)
    logger.info("Download complete: %s (%d bytes)", local_path, os.path.getsize(local_path))


def upload_file(local_path: str, key: str) -> str:
    """
    Stream-upload a local file to S3.
    Returns the s3:// URI of the uploaded object.
    """
    logger.info("Uploading %s → s3://%s/%s", local_path, settings.s3_bucket, key)
    get_client().upload_file(local_path, settings.s3_bucket, key)
    uri = f"s3://{settings.s3_bucket}/{key}"
    logger.info("Upload complete: %s", uri)
    return uri


def make_temp_dir() -> str:
    """
    Create a per-job temporary directory for local scratch files.
    The caller is responsible for cleanup (use a context manager in tasks.py).
    """
    tmp = tempfile.mkdtemp(prefix="orbitlens_")
    logger.debug("Created temp dir: %s", tmp)
    return tmp
