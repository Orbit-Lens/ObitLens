"""Illumination-invariant representations for extreme lunar sun angles."""
from app.algorithms.illumination.clahe import compute_retinex_reflectance, illumination_invariant_representation
from app.algorithms.illumination.gradients import sobel_gradient_magnitude, scharr_gradient_magnitude, laplacian_response
from app.algorithms.illumination.edges import canny_edges
from app.algorithms.illumination.shadow import detect_shadow_mask
from app.algorithms.illumination.phase_congruency import phase_congruency
