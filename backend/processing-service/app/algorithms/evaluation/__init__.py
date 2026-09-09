"""Evaluation metrics and reporting."""
from app.algorithms.evaluation.metrics import (
    compute_rmse,
    compute_reprojection_residuals,
    compute_spatial_coverage,
    compute_confidence_score,
    check_registration_success,
)
from app.algorithms.evaluation.report import build_report
