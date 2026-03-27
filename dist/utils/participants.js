"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortParticipantIds = sortParticipantIds;
/** Ensures a single conversation row per unordered pair of users. */
function sortParticipantIds(a, b) {
    return a < b ? [a, b] : [b, a];
}
