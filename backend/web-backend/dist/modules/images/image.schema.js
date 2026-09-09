"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateImageSchema = exports.confirmUploadSchema = exports.requestUploadUrlSchema = void 0;
const zod_1 = require("zod");
exports.requestUploadUrlSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Image display name is required'),
    filename: zod_1.z.string().min(1, 'Filename is required'),
    contentType: zod_1.z.string().default('image/tiff'),
    format: zod_1.z.enum(['GEOTIFF', 'PDS4_IMG', 'PNG', 'JPEG', 'TIFF']).default('GEOTIFF'),
    sensor: zod_1.z.enum(['OHRC', 'TMC-2', 'IIRS', 'LRO_NAC', 'LRO_WAC', 'KAGUYA', 'OTHER']).default('OHRC'),
    projectId: zod_1.z.string().optional(),
    resolutionMetersPerPixel: zod_1.z.number().positive().optional(),
    sunAzimuthDeg: zod_1.z.number().min(0).max(360).optional(),
    sunElevationDeg: zod_1.z.number().min(-90).max(90).optional(),
    acquisitionTime: zod_1.z.string().datetime().optional(),
});
exports.confirmUploadSchema = zod_1.z.object({
    fileSizeBytes: zod_1.z.number().positive().optional(),
    width: zod_1.z.number().positive().optional(),
    height: zod_1.z.number().positive().optional(),
    channels: zod_1.z.number().positive().optional(),
    resolutionMetersPerPixel: zod_1.z.number().positive().optional(),
    sunAzimuthDeg: zod_1.z.number().min(0).max(360).optional(),
    sunElevationDeg: zod_1.z.number().min(-90).max(90).optional(),
});
exports.updateImageSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    sensor: zod_1.z.enum(['OHRC', 'TMC-2', 'IIRS', 'LRO_NAC', 'LRO_WAC', 'KAGUYA', 'OTHER']).optional(),
    resolutionMetersPerPixel: zod_1.z.number().positive().optional(),
    sunAzimuthDeg: zod_1.z.number().min(0).max(360).optional(),
    sunElevationDeg: zod_1.z.number().min(-90).max(90).optional(),
    projectId: zod_1.z.string().optional(),
});
