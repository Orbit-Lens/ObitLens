"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timingSafeEqual = timingSafeEqual;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Constant-time string comparison to prevent timing attacks on tokens / internal API keys.
 */
function timingSafeEqual(a, b) {
    if (!a || !b)
        return false;
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');
    if (bufA.length !== bufB.length) {
        return false;
    }
    return crypto_1.default.timingSafeEqual(bufA, bufB);
}
