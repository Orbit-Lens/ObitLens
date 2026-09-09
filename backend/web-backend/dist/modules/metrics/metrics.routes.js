"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const metrics_controller_js_1 = require("./metrics.controller.js");
const requireAuth_js_1 = require("../../middleware/requireAuth.js");
const router = (0, express_1.Router)();
router.use(requireAuth_js_1.requireAuth);
router.get('/overview', metrics_controller_js_1.getMetricsOverviewHandler);
exports.default = router;
