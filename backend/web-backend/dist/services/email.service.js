"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendJobCompletionEmail = sendJobCompletionEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_js_1 = require("../config/env.js");
const logger_js_1 = require("../utils/logger.js");
let transporter = null;
if (env_js_1.env.SMTP_HOST && env_js_1.env.SMTP_USER && env_js_1.env.SMTP_PASS) {
    transporter = nodemailer_1.default.createTransport({
        host: env_js_1.env.SMTP_HOST,
        port: env_js_1.env.SMTP_PORT || 587,
        secure: env_js_1.env.SMTP_PORT === 465,
        auth: {
            user: env_js_1.env.SMTP_USER,
            pass: env_js_1.env.SMTP_PASS,
        },
    });
}
async function sendJobCompletionEmail(toEmail, jobId, rmse, inlierCount) {
    if (!transporter) {
        logger_js_1.logger.debug(`Email service not configured. Skipping job completion notification to ${toEmail}`);
        return;
    }
    try {
        await transporter.sendMail({
            from: env_js_1.env.EMAIL_FROM,
            to: toEmail,
            subject: `OrbitLens Registration Completed — Job #${jobId.slice(-6)}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a;">OrbitLens Registration Completed</h2>
          <p>Your lunar image registration job has completed successfully.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Job ID:</strong> ${jobId}</p>
            <p><strong>RMSE Accuracy:</strong> ${rmse.toFixed(3)} px</p>
            <p><strong>Verified Inlier Matches:</strong> ${inlierCount}</p>
          </div>
          <p><a href="${env_js_1.env.CLIENT_URL}/jobs/${jobId}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px;">View Results & Metrics</a></p>
        </div>
      `,
        });
    }
    catch (error) {
        logger_js_1.logger.error(`Failed to send email to ${toEmail}:`, error.message);
    }
}
