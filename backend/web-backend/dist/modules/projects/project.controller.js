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
exports.createProjectHandler = createProjectHandler;
exports.getProjectsHandler = getProjectsHandler;
exports.getProjectByIdHandler = getProjectByIdHandler;
exports.updateProjectHandler = updateProjectHandler;
exports.deleteProjectHandler = deleteProjectHandler;
const projectService = __importStar(require("./project.service.js"));
const response_js_1 = require("../../utils/response.js");
async function createProjectHandler(req, res, next) {
    try {
        const project = await projectService.createProject(req.user.userId, req.body);
        return (0, response_js_1.sendSuccess)(res, project, 201);
    }
    catch (error) {
        next(error);
    }
}
async function getProjectsHandler(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { projects, total } = await projectService.getProjects(req.user.userId, page, limit);
        return (0, response_js_1.sendPaginated)(res, projects, {
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
async function getProjectByIdHandler(req, res, next) {
    try {
        const project = await projectService.getProjectById(req.user.userId, req.params.id);
        return (0, response_js_1.sendSuccess)(res, project);
    }
    catch (error) {
        next(error);
    }
}
async function updateProjectHandler(req, res, next) {
    try {
        const project = await projectService.updateProject(req.user.userId, req.params.id, req.body);
        return (0, response_js_1.sendSuccess)(res, project);
    }
    catch (error) {
        next(error);
    }
}
async function deleteProjectHandler(req, res, next) {
    try {
        await projectService.deleteProject(req.user.userId, req.params.id);
        return (0, response_js_1.sendSuccess)(res, { message: 'Project deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}
