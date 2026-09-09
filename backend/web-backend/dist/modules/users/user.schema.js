"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccountSchema = exports.updateUserSchema = void 0;
const zod_1 = require("zod");
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
});
exports.deleteAccountSchema = zod_1.z.object({
    confirmation: zod_1.z.literal('DELETE MY ACCOUNT'),
});
