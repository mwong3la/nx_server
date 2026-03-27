"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTrackingNumber = generateTrackingNumber;
exports.normalizeTrackingInput = normalizeTrackingInput;
exports.canonicalTrackingLookupKey = canonicalTrackingLookupKey;
const crypto_1 = require("crypto");
const ALPHANUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateTrackingNumber() {
    let s = '';
    const buf = (0, crypto_1.randomBytes)(8);
    for (let i = 0; i < 8; i++) {
        s += ALPHANUM[buf[i] % ALPHANUM.length];
    }
    return `NB-${s}`;
}
function normalizeTrackingInput(raw) {
    return String(raw).trim().toUpperCase().replace(/\s+/g, '');
}
/**
 * Value stored in DB is always `NB-` + 8 alphanumeric chars.
 * Accepts the same pasted from email, or just the 8 characters.
 */
function canonicalTrackingLookupKey(raw) {
    let s = normalizeTrackingInput(raw);
    if (!s)
        return '';
    if (/^[A-Z0-9]{8}$/.test(s)) {
        s = `NB-${s}`;
    }
    return s;
}
