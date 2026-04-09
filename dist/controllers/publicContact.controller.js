"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitContact = submitContact;
const contactMail_1 = require("../utils/contactMail");
async function submitContact(req, res) {
    const parsed = (0, contactMail_1.validateContactPayload)(req.body);
    if (!parsed.ok) {
        res.status(400).json({ message: parsed.message });
        return;
    }
    const result = await (0, contactMail_1.sendContactEmail)({
        name: parsed.name,
        email: parsed.email,
        message: parsed.message,
    });
    if (!result.ok) {
        if (result.isConfig) {
            console.error('[contact] Mail not configured:', result.reason);
            res.status(503).json({
                message: 'Contact form is not configured on the server. Please email us directly or try again later.',
            });
            return;
        }
        res.status(502).json({ message: result.reason });
        return;
    }
    res.status(200).json({ ok: true });
}
