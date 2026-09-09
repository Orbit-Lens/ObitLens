"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestUpload = requestUpload;
exports.confirmUpload = confirmUpload;
exports.getImages = getImages;
exports.getImageById = getImageById;
exports.getImageDownloadUrl = getImageDownloadUrl;
exports.updateImage = updateImage;
exports.deleteImage = deleteImage;
const mongoose_1 = require("mongoose");
const image_model_js_1 = require("./image.model.js");
const storage_js_1 = require("../../config/storage.js");
const ownershipCheck_js_1 = require("../../utils/ownershipCheck.js");
const processingClient_service_js_1 = require("../../services/processingClient.service.js");
const logger_js_1 = require("../../utils/logger.js");
async function requestUpload(userId, input) {
    const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `imagery/${userId}/${Date.now()}_${sanitizedFilename}`;
    const image = await image_model_js_1.Image.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        projectId: input.projectId ? new mongoose_1.Types.ObjectId(input.projectId) : undefined,
        name: input.name,
        filename: input.filename,
        format: input.format,
        sensor: input.sensor,
        resolutionMetersPerPixel: input.resolutionMetersPerPixel,
        sunAzimuthDeg: input.sunAzimuthDeg,
        sunElevationDeg: input.sunElevationDeg,
        acquisitionTime: input.acquisitionTime ? new Date(input.acquisitionTime) : undefined,
        storageKey,
        status: 'pending_upload',
    });
    const uploadUrl = await (0, storage_js_1.generatePresignedUploadUrl)(storageKey, input.contentType);
    return { image, uploadUrl };
}
async function confirmUpload(userId, imageId, input) {
    const image = await (0, ownershipCheck_js_1.assertOwnership)(image_model_js_1.Image, imageId, userId);
    image.status = 'ready';
    if (input) {
        if (input.fileSizeBytes)
            image.fileSizeBytes = input.fileSizeBytes;
        if (input.width)
            image.width = input.width;
        if (input.height)
            image.height = input.height;
        if (input.channels)
            image.channels = input.channels;
        if (input.resolutionMetersPerPixel)
            image.resolutionMetersPerPixel = input.resolutionMetersPerPixel;
        if (input.sunAzimuthDeg !== undefined)
            image.sunAzimuthDeg = input.sunAzimuthDeg;
        if (input.sunElevationDeg !== undefined)
            image.sunElevationDeg = input.sunElevationDeg;
    }
    await image.save();
    // Asynchronously request Python processing service to inspect/parse raster metadata
    (0, processingClient_service_js_1.triggerMetadataExtraction)(image._id.toString(), image.storageKey)
        .then(async (metadata) => {
        if (metadata) {
            if (metadata.width)
                image.width = metadata.width;
            if (metadata.height)
                image.height = metadata.height;
            if (metadata.channels)
                image.channels = metadata.channels;
            if (metadata.resolutionMetersPerPixel)
                image.resolutionMetersPerPixel = metadata.resolutionMetersPerPixel;
            if (metadata.sunAzimuthDeg !== undefined)
                image.sunAzimuthDeg = metadata.sunAzimuthDeg;
            if (metadata.sunElevationDeg !== undefined)
                image.sunElevationDeg = metadata.sunElevationDeg;
            if (metadata.footprint)
                image.footprint = metadata.footprint;
            image.metadataParsed = true;
            await image.save();
        }
    })
        .catch((err) => {
        logger_js_1.logger.warn(`Metadata extraction notice for image ${imageId}:`, err.message);
    });
    return image;
}
async function getImages(userId, options) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;
    const query = { userId: new mongoose_1.Types.ObjectId(userId) };
    if (options.sensor)
        query.sensor = options.sensor;
    if (options.projectId && mongoose_1.Types.ObjectId.isValid(options.projectId)) {
        query.projectId = new mongoose_1.Types.ObjectId(options.projectId);
    }
    if (options.status)
        query.status = options.status;
    const [images, total] = await Promise.all([
        image_model_js_1.Image.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        image_model_js_1.Image.countDocuments(query),
    ]);
    return { images, total };
}
async function getImageById(userId, imageId) {
    return await (0, ownershipCheck_js_1.assertOwnership)(image_model_js_1.Image, imageId, userId);
}
async function getImageDownloadUrl(userId, imageId) {
    const image = await (0, ownershipCheck_js_1.assertOwnership)(image_model_js_1.Image, imageId, userId);
    return await (0, storage_js_1.generatePresignedDownloadUrl)(image.storageKey);
}
async function updateImage(userId, imageId, input) {
    const image = await (0, ownershipCheck_js_1.assertOwnership)(image_model_js_1.Image, imageId, userId);
    if (input.name)
        image.name = input.name;
    if (input.sensor)
        image.sensor = input.sensor;
    if (input.resolutionMetersPerPixel !== undefined)
        image.resolutionMetersPerPixel = input.resolutionMetersPerPixel;
    if (input.sunAzimuthDeg !== undefined)
        image.sunAzimuthDeg = input.sunAzimuthDeg;
    if (input.sunElevationDeg !== undefined)
        image.sunElevationDeg = input.sunElevationDeg;
    if (input.projectId)
        image.projectId = new mongoose_1.Types.ObjectId(input.projectId);
    return await image.save();
}
async function deleteImage(userId, imageId) {
    await (0, ownershipCheck_js_1.assertOwnership)(image_model_js_1.Image, imageId, userId);
    await image_model_js_1.Image.findByIdAndDelete(imageId);
}
