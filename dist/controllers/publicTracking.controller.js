"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupByTrackingNumber = exports.lookupByQuery = void 0;
const Shipment_1 = require("../database/models/Shipment");
const ShipmentStatus_1 = require("../database/models/ShipmentStatus");
const trackingNumber_1 = require("../utils/trackingNumber");
const STATUS_LABEL = {
    [ShipmentStatus_1.ShipmentStatus.PENDING]: 'Order received',
    [ShipmentStatus_1.ShipmentStatus.PROCESSING]: 'Being prepared',
    [ShipmentStatus_1.ShipmentStatus.PACKED]: 'Packed',
    [ShipmentStatus_1.ShipmentStatus.SHIPPED]: 'Shipped',
    [ShipmentStatus_1.ShipmentStatus.IN_TRANSIT]: 'In transit',
    [ShipmentStatus_1.ShipmentStatus.DELIVERED]: 'Delivered',
    [ShipmentStatus_1.ShipmentStatus.CANCELLED]: 'Cancelled',
};
function deliveryStatusPayload(s) {
    return {
        trackingNumber: s.trackingNumber,
        title: s.title,
        description: s.description ?? null,
        status: s.status,
        statusLabel: STATUS_LABEL[s.status] ?? s.status,
        progressNote: s.progressNote ?? null,
        currentLocation: s.currentLocation ?? null,
        lastUpdated: s.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    };
}
async function findShipmentByTrackingInput(raw) {
    const key = (0, trackingNumber_1.canonicalTrackingLookupKey)(raw);
    if (!key || key.length < 4) {
        return null;
    }
    const s = await Shipment_1.Shipment.findOne({ where: { trackingNumber: key } });
    return s;
}
/**
 * For the website: GET /api/v1/public/tracking?number=NB-XXXXXXXX
 * (or ?q= or ?tracking=) — typical search-box submission without login.
 */
const lookupByQuery = async (req, res) => {
    try {
        const q = (typeof req.query.number === 'string' && req.query.number) ||
            (typeof req.query.q === 'string' && req.query.q) ||
            (typeof req.query.tracking === 'string' && req.query.tracking) ||
            '';
        if (!q.trim()) {
            res.status(400).json({
                message: 'Enter a tracking number. Example: ?number=NB-XXXXXXXX',
            });
            return;
        }
        const s = await findShipmentByTrackingInput(q);
        if (!s) {
            res.status(404).json({ message: 'No delivery found for this tracking number' });
            return;
        }
        res.json(deliveryStatusPayload(s));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.lookupByQuery = lookupByQuery;
/**
 * For shareable links: GET /api/v1/public/tracking/NB-XXXXXXXX
 */
const lookupByTrackingNumber = async (req, res) => {
    try {
        const raw = req.params.trackingNumber;
        const key = (0, trackingNumber_1.canonicalTrackingLookupKey)(raw);
        if (!key || key.length < 4) {
            res.status(400).json({ message: 'Invalid tracking number' });
            return;
        }
        const s = await Shipment_1.Shipment.findOne({ where: { trackingNumber: key } });
        if (!s) {
            res.status(404).json({ message: 'No delivery found for this tracking number' });
            return;
        }
        res.json(deliveryStatusPayload(s));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.lookupByTrackingNumber = lookupByTrackingNumber;
