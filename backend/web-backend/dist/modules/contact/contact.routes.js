"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_js_1 = require("./contact.controller.js");
const validate_js_1 = require("../../middleware/validate.js");
const contact_schema_js_1 = require("./contact.schema.js");
const router = (0, express_1.Router)();
// Public: Submit a contact message from contact form
router.post('/', (0, validate_js_1.validate)({ body: contact_schema_js_1.createContactMessageSchema }), contact_controller_js_1.submitContactMessageHandler);
// Authenticated/Admin: View contact messages
router.get('/', contact_controller_js_1.getContactMessagesHandler);
exports.default = router;
