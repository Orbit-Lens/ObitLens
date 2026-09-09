"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_js_1 = require("../users/user.model.js");
const audit_model_js_1 = require("../audit/audit.model.js");
const jwt_js_1 = require("../../utils/jwt.js");
async function register(input, ipAddress) {
    const existing = await user_model_js_1.User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
        await audit_model_js_1.AuditLog.create({
            userEmail: input.email,
            action: 'USER_REGISTER',
            status: 'FAILED',
            details: 'Email conflict - user already exists',
            ipAddress,
        }).catch(() => { });
        const err = new Error('User with this email already exists');
        err.statusCode = 409;
        err.code = 'CONFLICT';
        throw err;
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    const passwordHash = await bcryptjs_1.default.hash(input.password, salt);
    const user = await user_model_js_1.User.create({
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: input.role || 'user',
        lastLoginAt: new Date(),
        loginCount: 1,
    });
    const accessToken = (0, jwt_js_1.signAccessToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    const refreshToken = (0, jwt_js_1.signRefreshToken)({ userId: user._id.toString() });
    const refreshHash = await bcryptjs_1.default.hash(refreshToken, 10);
    user.refreshTokenHash = refreshHash;
    await user.save();
    await audit_model_js_1.AuditLog.create({
        userId: user._id,
        userEmail: user.email,
        action: 'USER_REGISTER',
        status: 'SUCCESS',
        details: `User registered successfully with role '${user.role}'`,
        ipAddress,
    }).catch(() => { });
    return {
        accessToken,
        refreshToken,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}
async function login(input, ipAddress) {
    const user = await user_model_js_1.User.findOne({ email: input.email.toLowerCase() });
    if (!user) {
        await audit_model_js_1.AuditLog.create({
            userEmail: input.email,
            action: 'USER_LOGIN',
            status: 'FAILED',
            details: 'Invalid email address',
            ipAddress,
        }).catch(() => { });
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        err.code = 'UNAUTHORIZED';
        throw err;
    }
    if (user.isLocked()) {
        await audit_model_js_1.AuditLog.create({
            userId: user._id,
            userEmail: user.email,
            action: 'USER_LOGIN',
            status: 'FAILED',
            details: 'Account temporarily locked',
            ipAddress,
        }).catch(() => { });
        const err = new Error('Account temporarily locked due to multiple failed login attempts. Please try again later.');
        err.statusCode = 403;
        err.code = 'FORBIDDEN';
        throw err;
    }
    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
        await user.incLoginAttempts();
        await audit_model_js_1.AuditLog.create({
            userId: user._id,
            userEmail: user.email,
            action: 'USER_LOGIN',
            status: 'FAILED',
            details: 'Password mismatch',
            ipAddress,
        }).catch(() => { });
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        err.code = 'UNAUTHORIZED';
        throw err;
    }
    await user.resetLoginLock();
    const accessToken = (0, jwt_js_1.signAccessToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    const refreshToken = (0, jwt_js_1.signRefreshToken)({ userId: user._id.toString() });
    const refreshHash = await bcryptjs_1.default.hash(refreshToken, 10);
    user.refreshTokenHash = refreshHash;
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();
    await audit_model_js_1.AuditLog.create({
        userId: user._id,
        userEmail: user.email,
        action: 'USER_LOGIN',
        status: 'SUCCESS',
        details: `User logged in successfully (Total logins: ${user.loginCount})`,
        ipAddress,
    }).catch(() => { });
    return {
        accessToken,
        refreshToken,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}
async function refresh(oldRefreshToken) {
    let decoded;
    try {
        decoded = (0, jwt_js_1.verifyRefreshToken)(oldRefreshToken);
    }
    catch (error) {
        const err = new Error('Invalid or expired refresh token');
        err.statusCode = 401;
        err.code = 'TOKEN_INVALID';
        throw err;
    }
    const user = await user_model_js_1.User.findById(decoded.userId);
    if (!user || !user.refreshTokenHash) {
        const err = new Error('Unauthorized');
        err.statusCode = 401;
        err.code = 'UNAUTHORIZED';
        throw err;
    }
    // Verify stored hash matches
    const isMatch = await bcryptjs_1.default.compare(oldRefreshToken, user.refreshTokenHash);
    if (!isMatch) {
        // Reuse detected! Invalidate all tokens for security
        user.refreshTokenHash = undefined;
        await user.save();
        const err = new Error('Refresh token reuse detected. Session invalidated.');
        err.statusCode = 401;
        err.code = 'TOKEN_INVALID';
        throw err;
    }
    // Rotate refresh token
    const newAccessToken = (0, jwt_js_1.signAccessToken)({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
    });
    const newRefreshToken = (0, jwt_js_1.signRefreshToken)({ userId: user._id.toString() });
    user.refreshTokenHash = await bcryptjs_1.default.hash(newRefreshToken, 10);
    await user.save();
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
}
async function logout(userId) {
    await user_model_js_1.User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
}
