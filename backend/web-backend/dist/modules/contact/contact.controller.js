"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitContactMessageHandler = submitContactMessageHandler;
exports.getContactMessagesHandler = getContactMessagesHandler;
const contact_model_js_1 = require("./contact.model.js");
const response_js_1 = require("../../utils/response.js");
async function submitContactMessageHandler(req, res, next) {
    try {
        const { name, email, subject, message } = req.body;
        const contactMessage = await contact_model_js_1.ContactMessage.create({
            name,
            email,
            subject: subject || 'General Inquiry',
            message,
        });
        return (0, response_js_1.sendSuccess)(res, {
            id: contactMessage._id,
            message: 'Your message has been received successfully! Our team will get back to you shortly.',
        }, 201);
    }
    catch (err) {
        next(err);
    }
}
async function getContactMessagesHandler(req, res, next) {
    try {
        const messages = await contact_model_js_1.ContactMessage.find().sort({ createdAt: -1 }).limit(100);
        return (0, response_js_1.sendSuccess)(res, { messages, count: messages.length });
    }
    catch (err) {
        next(err);
    }
}
