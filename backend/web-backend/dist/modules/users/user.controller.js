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
exports.getProfileHandler = getProfileHandler;
exports.updateProfileHandler = updateProfileHandler;
exports.exportDataHandler = exportDataHandler;
exports.deleteAccountHandler = deleteAccountHandler;
const userService = __importStar(require("./user.service.js"));
const response_js_1 = require("../../utils/response.js");
const image_model_js_1 = require("../images/image.model.js");
const job_model_js_1 = require("../jobs/job.model.js");
async function getProfileHandler(req, res, next) {
    try {
        const user = await userService.getProfile(req.user.userId);
        return (0, response_js_1.sendSuccess)(res, user);
    }
    catch (error) {
        next(error);
    }
}
async function updateProfileHandler(req, res, next) {
    try {
        const user = await userService.updateProfile(req.user.userId, req.body);
        return (0, response_js_1.sendSuccess)(res, user);
    }
    catch (error) {
        next(error);
    }
}
async function exportDataHandler(req, res, next) {
    try {
        const userId = req.user.userId;
        const user = await userService.getProfile(userId);
        const images = await image_model_js_1.Image.find({ userId }).select('-__v');
        const jobs = await job_model_js_1.Job.find({ userId }).select('-__v');
        return (0, response_js_1.sendSuccess)(res, {
            profile: user,
            images,
            jobs,
            exportedAt: new Date().toISOString(),
        });
    }
    catch (error) {
        next(error);
    }
}
async function deleteAccountHandler(req, res, next) {
    try {
        await userService.deleteAccount(req.user.userId);
        return (0, response_js_1.sendSuccess)(res, { message: 'Account successfully deleted' });
    }
    catch (error) {
        next(error);
    }
}
