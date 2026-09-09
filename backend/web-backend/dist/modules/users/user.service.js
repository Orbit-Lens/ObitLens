"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.deleteAccount = deleteAccount;
const user_model_js_1 = require("./user.model.js");
async function getProfile(userId) {
    const user = await user_model_js_1.User.findById(userId).select('-passwordHash -refreshTokenHash');
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    return user;
}
async function updateProfile(userId, data) {
    const user = await user_model_js_1.User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true }).select('-passwordHash -refreshTokenHash');
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    return user;
}
async function deleteAccount(userId) {
    await user_model_js_1.User.findByIdAndDelete(userId);
}
