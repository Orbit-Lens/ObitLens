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
exports.requestUploadHandler = requestUploadHandler;
exports.confirmUploadHandler = confirmUploadHandler;
exports.getImagesHandler = getImagesHandler;
exports.getImageByIdHandler = getImageByIdHandler;
exports.getImageDownloadUrlHandler = getImageDownloadUrlHandler;
exports.updateImageHandler = updateImageHandler;
exports.deleteImageHandler = deleteImageHandler;
const imageService = __importStar(require("./image.service.js"));
const response_js_1 = require("../../utils/response.js");
async function requestUploadHandler(req, res, next) {
    try {
        const result = await imageService.requestUpload(req.user.userId, req.body);
        return (0, response_js_1.sendSuccess)(res, result, 201);
    }
    catch (error) {
        next(error);
    }
}
async function confirmUploadHandler(req, res, next) {
    try {
        const image = await imageService.confirmUpload(req.user.userId, req.params.id, req.body);
        return (0, response_js_1.sendSuccess)(res, image, 200);
    }
    catch (error) {
        next(error);
    }
}
async function getImagesHandler(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sensor = req.query.sensor;
        const projectId = req.query.projectId;
        const status = req.query.status;
        const { images, total } = await imageService.getImages(req.user.userId, {
            page,
            limit,
            sensor,
            projectId,
            status,
        });
        return (0, response_js_1.sendPaginated)(res, images, {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        }, 200);
    }
    catch (error) {
        next(error);
    }
}
async function getImageByIdHandler(req, res, next) {
    try {
        const image = await imageService.getImageById(req.user.userId, req.params.id);
        return (0, response_js_1.sendSuccess)(res, image);
    }
    catch (error) {
        next(error);
    }
}
async function getImageDownloadUrlHandler(req, res, next) {
    try {
        const downloadUrl = await imageService.getImageDownloadUrl(req.user.userId, req.params.id);
        return (0, response_js_1.sendSuccess)(res, { downloadUrl });
    }
    catch (error) {
        next(error);
    }
}
async function updateImageHandler(req, res, next) {
    try {
        const image = await imageService.updateImage(req.user.userId, req.params.id, req.body);
        return (0, response_js_1.sendSuccess)(res, image);
    }
    catch (error) {
        next(error);
    }
}
async function deleteImageHandler(req, res, next) {
    try {
        await imageService.deleteImage(req.user.userId, req.params.id);
        return (0, response_js_1.sendSuccess)(res, { message: 'Image record deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}
