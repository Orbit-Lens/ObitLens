"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertOwnership = assertOwnership;
const mongoose_1 = require("mongoose");
/**
 * Ensures the requesting user owns the resource, returning 404 (NOT_FOUND) instead of 403
 * to prevent resource ID enumeration attacks.
 */
async function assertOwnership(ModelClass, resourceId, userId) {
    if (!mongoose_1.Types.ObjectId.isValid(resourceId)) {
        const err = new Error('Resource not found');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    const doc = await ModelClass.findOne({
        _id: new mongoose_1.Types.ObjectId(resourceId),
        userId: new mongoose_1.Types.ObjectId(userId),
    });
    if (!doc) {
        const err = new Error('Resource not found');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    return doc;
}
