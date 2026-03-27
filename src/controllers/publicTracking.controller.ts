import { Request, Response } from 'express';
import { Shipment } from '../database/models/Shipment';
import { ShipmentStatus } from '../database/models/ShipmentStatus';
import { canonicalTrackingLookupKey } from '../utils/trackingNumber';

const STATUS_LABEL: Record<ShipmentStatus, string> = {
  [ShipmentStatus.PENDING]: 'Order received',
  [ShipmentStatus.PROCESSING]: 'Being prepared',
  [ShipmentStatus.PACKED]: 'Packed',
  [ShipmentStatus.SHIPPED]: 'Shipped',
  [ShipmentStatus.IN_TRANSIT]: 'In transit',
  [ShipmentStatus.DELIVERED]: 'Delivered',
  [ShipmentStatus.CANCELLED]: 'Cancelled',
};

function deliveryStatusPayload(s: Shipment) {
  return {
    trackingNumber: s.trackingNumber,
    title: s.title,
    description: s.description ?? null,
    status: s.status,
    statusLabel: STATUS_LABEL[s.status] ?? s.status,
    progressNote: s.progressNote ?? null,
    currentLocation: s.currentLocation ?? null,
    lastUpdated: (s as any).updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

async function findShipmentByTrackingInput(raw: string): Promise<Shipment | null> {
  const key = canonicalTrackingLookupKey(raw);
  if (!key || key.length < 4) {
    return null;
  }
  const s = await Shipment.findOne({ where: { trackingNumber: key } });
  return s;
}

/**
 * For the website: GET /api/v1/public/tracking?number=NB-XXXXXXXX
 * (or ?q= or ?tracking=) — typical search-box submission without login.
 */
export const lookupByQuery = async (req: Request, res: Response) => {
  try {
    const q =
      (typeof req.query.number === 'string' && req.query.number) ||
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
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * For shareable links: GET /api/v1/public/tracking/NB-XXXXXXXX
 */
export const lookupByTrackingNumber = async (req: Request, res: Response) => {
  try {
    const raw = req.params.trackingNumber;
    const key = canonicalTrackingLookupKey(raw);
    if (!key || key.length < 4) {
      res.status(400).json({ message: 'Invalid tracking number' });
      return;
    }
    const s = await Shipment.findOne({ where: { trackingNumber: key } });
    if (!s) {
      res.status(404).json({ message: 'No delivery found for this tracking number' });
      return;
    }
    res.json(deliveryStatusPayload(s));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
