"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_controller_js_1 = require("./job.controller.js");
const requireAuth_js_1 = require("../../middleware/requireAuth.js");
const validate_js_1 = require("../../middleware/validate.js");
const rateLimiters_js_1 = require("../../middleware/rateLimiters.js");
const job_schema_js_1 = require("./job.schema.js");
const router = (0, express_1.Router)();
// Internal processing service callback (authenticated via X-Internal-Key header)
router.post('/:id/status-internal', (0, validate_js_1.validate)({ body: job_schema_js_1.updateJobStatusInternalSchema }), job_controller_js_1.updateJobStatusInternalHandler);
// Protected public routes
router.use(requireAuth_js_1.requireAuth);
router.post('/', rateLimiters_js_1.jobCreationLimiter, (0, validate_js_1.validate)({ body: job_schema_js_1.createJobSchema }), job_controller_js_1.createJobHandler);
router.get('/', job_controller_js_1.getJobsHandler);
router.get('/:id', job_controller_js_1.getJobByIdHandler);
router.get('/:id/metrics', job_controller_js_1.getJobMetricsHandler);
router.get('/:id/artifacts', job_controller_js_1.getJobArtifactsHandler);
router.delete('/:id', job_controller_js_1.deleteJobHandler);
exports.default = router;
