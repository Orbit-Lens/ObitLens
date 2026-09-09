"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleGuard = roleGuard;
const response_js_1 = require("../utils/response.js");
function roleGuard(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return (0, response_js_1.sendError)(res, 'UNAUTHORIZED', 'Authentication required', 401);
        }
        if (!allowedRoles.includes(req.user.role)) {
            return (0, response_js_1.sendError)(res, 'FORBIDDEN', 'Insufficient permissions for this operation', 403);
        }
        next();
    };
}
