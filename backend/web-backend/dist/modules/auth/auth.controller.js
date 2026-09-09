"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHandler = registerHandler;
exports.loginHandler = loginHandler;
exports.refreshHandler = refreshHandler;
exports.logoutHandler = logoutHandler;
const authService = __importStar(require("./auth.service.js"));
const response_js_1 = require("../../utils/response.js");
const env_js_1 = require("../../config/env.js");
const REFRESH_COOKIE_NAME = 'orbitlens_refresh_token';
const cookieOptions = {
    httpOnly: true,
    secure: env_js_1.env.NODE_ENV === 'production',
    sameSite: (env_js_1.env.NODE_ENV === 'production' ? 'strict' : 'lax'),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
};
async function registerHandler(req, res, next) {
    try {
        const result = await authService.register(req.body, req.ip);
        res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, cookieOptions);
        return (0, response_js_1.sendSuccess)(res, {
            user: result.user,
            accessToken: result.accessToken,
        }, 201);
    }
    catch (error) {
        next(error);
    }
}
async function loginHandler(req, res, next) {
    try {
        const result = await authService.login(req.body, req.ip);
        res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, cookieOptions);
        return (0, response_js_1.sendSuccess)(res, {
            user: result.user,
            accessToken: result.accessToken,
        }, 200);
    }
    catch (error) {
        next(error);
    }
}
async function refreshHandler(req, res, next) {
    try {
        const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
        if (!token) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'No refresh token provided' },
            });
        }
        const tokens = await authService.refresh(token);
        res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, cookieOptions);
        return (0, response_js_1.sendSuccess)(res, { accessToken: tokens.accessToken }, 200);
    }
    catch (error) {
        next(error);
    }
}
async function logoutHandler(req, res, next) {
    try {
        if (req.user?.userId) {
            await authService.logout(req.user.userId);
        }
        res.clearCookie(REFRESH_COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
        return (0, response_js_1.sendSuccess)(res, { message: 'Logged out successfully' }, 200);
    }
    catch (error) {
        next(error);
    }
}
