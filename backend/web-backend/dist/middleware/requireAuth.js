"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_js_1 = require("../utils/jwt.js");
const response_js_1 = require("../utils/response.js");
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return (0, response_js_1.sendError)(res, 'UNAUTHORIZED', 'Access token is required', 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_js_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return (0, response_js_1.sendError)(res, 'TOKEN_EXPIRED', 'Access token has expired', 401);
        }
        return (0, response_js_1.sendError)(res, 'TOKEN_INVALID', 'Invalid access token', 401);
    }
}
