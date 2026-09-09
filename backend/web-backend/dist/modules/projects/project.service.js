"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
exports.getProjects = getProjects;
exports.getProjectById = getProjectById;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
const mongoose_1 = require("mongoose");
const project_model_js_1 = require("./project.model.js");
const ownershipCheck_js_1 = require("../../utils/ownershipCheck.js");
async function createProject(userId, input) {
    return await project_model_js_1.Project.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        ...input,
    });
}
async function getProjects(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
        project_model_js_1.Project.find({ userId: new mongoose_1.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        project_model_js_1.Project.countDocuments({ userId: new mongoose_1.Types.ObjectId(userId) }),
    ]);
    return { projects, total };
}
async function getProjectById(userId, projectId) {
    return await (0, ownershipCheck_js_1.assertOwnership)(project_model_js_1.Project, projectId, userId);
}
async function updateProject(userId, projectId, input) {
    const project = await (0, ownershipCheck_js_1.assertOwnership)(project_model_js_1.Project, projectId, userId);
    Object.assign(project, input);
    return await project.save();
}
async function deleteProject(userId, projectId) {
    await (0, ownershipCheck_js_1.assertOwnership)(project_model_js_1.Project, projectId, userId);
    await project_model_js_1.Project.findByIdAndDelete(projectId);
}
