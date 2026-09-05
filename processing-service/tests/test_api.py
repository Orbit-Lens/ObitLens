"""
processing-service/tests/test_api.py
FastAPI endpoint tests using TestClient.
Tests internal auth, job routing, and health endpoints.
"""
from __future__ import annotations

from unittest.mock import patch, MagicMock
import pytest


class TestHealthEndpoints:
    def test_health_returns_ok(self, test_client):
        resp = test_client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    def test_ready_endpoint_exists(self, test_client):
        # May return 200 or 503 depending on Redis/S3 availability in CI
        # Just assert it returns a valid response
        resp = test_client.get("/ready")
        assert resp.status_code in (200, 503)
        body = resp.json()
        assert "checks" in body


class TestInternalAuth:
    def test_post_jobs_without_key_returns_401(self, test_client):
        resp = test_client.post(
            "/internal/jobs",
            json={
                "jobId": "test-job-1",
                "sourceImageUri": "s3://bucket/src.tif",
                "referenceImageUri": "s3://bucket/ref.tif",
            },
        )
        assert resp.status_code == 422  # Missing required header → FastAPI 422

    def test_post_jobs_wrong_key_returns_401(self, test_client):
        resp = test_client.post(
            "/internal/jobs",
            json={
                "jobId": "test-job-1",
                "sourceImageUri": "s3://bucket/src.tif",
                "referenceImageUri": "s3://bucket/ref.tif",
            },
            headers={"X-Internal-Key": "wrong-key"},
        )
        assert resp.status_code == 401

    def test_post_jobs_valid_key_accepted(self, test_client, internal_headers):
        """Valid key → accepted (even if Celery task fails in test env)."""
        with patch("app.api.routes_jobs.run_registration_pipeline") as mock_task:
            mock_result = MagicMock()
            mock_result.id = "task-abc-123"
            mock_task.apply_async.return_value = mock_result

            resp = test_client.post(
                "/internal/jobs",
                json={
                    "jobId": "test-job-1",
                    "sourceImageUri": "s3://bucket/src.tif",
                    "referenceImageUri": "s3://bucket/ref.tif",
                },
                headers=internal_headers,
            )
            assert resp.status_code == 202
            assert resp.json()["jobId"] == "test-job-1"

    def test_get_job_unknown_id_returns_404(self, test_client, internal_headers):
        with patch("app.api.routes_jobs.get_job_status_from_store", return_value=None):
            resp = test_client.get("/internal/jobs/nonexistent-id", headers=internal_headers)
            assert resp.status_code == 404

    def test_metadata_endpoint_accepted(self, test_client, internal_headers):
        with patch("app.api.routes_jobs.extract_image_metadata") as mock_task:
            mock_result = MagicMock()
            mock_result.id = "task-meta-1"
            mock_task.apply_async.return_value = mock_result

            resp = test_client.post(
                "/internal/metadata",
                json={"imageId": "img-123", "storageUri": "s3://bucket/img.tif"},
                headers=internal_headers,
            )
            assert resp.status_code == 202
            assert resp.json()["imageId"] == "img-123"
