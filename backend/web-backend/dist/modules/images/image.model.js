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
exports.Image = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ImageSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', index: true },
    name: { type: String, required: true, trim: true },
    filename: { type: String, required: true },
    format: {
        type: String,
        enum: ['GEOTIFF', 'PDS4_IMG', 'PNG', 'JPEG', 'TIFF'],
        default: 'GEOTIFF',
    },
    sensor: {
        type: String,
        enum: ['OHRC', 'TMC-2', 'IIRS', 'LRO_NAC', 'LRO_WAC', 'KAGUYA', 'OTHER'],
        default: 'OHRC',
    },
    resolutionMetersPerPixel: { type: Number },
    sunAzimuthDeg: { type: Number },
    sunElevationDeg: { type: Number },
    incidenceAngleDeg: { type: Number },
    emissionAngleDeg: { type: Number },
    phaseAngleDeg: { type: Number },
    acquisitionTime: { type: Date },
    storageKey: { type: String, required: true },
    fileSizeBytes: { type: Number },
    width: { type: Number },
    height: { type: Number },
    channels: { type: Number },
    footprint: {
        type: { type: String, default: 'Polygon' },
        coordinates: [[[Number]]],
    },
    status: {
        type: String,
        enum: ['pending_upload', 'uploaded', 'ready', 'failed'],
        default: 'pending_upload',
        index: true,
    },
    errorMessage: { type: String },
    metadataParsed: { type: Boolean, default: false },
}, { timestamps: true });
exports.Image = mongoose_1.default.model('Image', ImageSchema);
