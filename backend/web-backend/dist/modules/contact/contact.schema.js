"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContactMessageSchema = void 0;
const zod_1 = require("zod");
exports.createContactMessageSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    subject: zod_1.z.string().min(2).default('General Inquiry').optional(),
    message: zod_1.z.string().min(5, 'Message must be at least 5 characters'),
});
