"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
const response_js_1 = require("../utils/response.js");
function validate(schema) {
    return async (req, res, next) => {
        try {
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            if (schema.query) {
                req.query = await schema.query.parseAsync(req.query);
            }
            if (schema.params) {
                req.params = await schema.params.parseAsync(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const fields = {};
                for (const issue of error.issues) {
                    const path = issue.path.join('.') || 'root';
                    if (!fields[path]) {
                        fields[path] = [];
                    }
                    fields[path].push(issue.message);
                }
                return (0, response_js_1.sendError)(res, 'VALIDATION_ERROR', 'Validation failed for incoming request parameters', 400, fields);
            }
            next(error);
        }
    };
}
