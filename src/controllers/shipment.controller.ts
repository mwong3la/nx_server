import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { Shipment } from '../database/models/Shipment';
import { ShipmentStatus } from '../database/models/ShipmentStatus';
import { Customer } from '../database/models/Customer';
import { generateTrackingNumber } from '../utils/trackingNumber';

function shipmentAdminShape(s: Shipment) {
  return {
    id: s.id,
    trackingNumber: s.trackingNumber,
    title: s.title,
    description: s.description ?? null,
    status: s.status,
    progressNote: s.progressNote ?? null,
    currentLocation: s.currentLocation ?? null,
    customerId: s.customerId ?? null,
    createdById: s.createdById,
    createdAt: (s as any).createdAt?.toISOString?.(),
    updatedAt: (s as any).updatedAt?.toISOString?.(),
  };
}

async function uniqueTrackingNumber(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const t = generateTrackingNumber();
    const exists = await Shipment.findOne({ where: { trackingNumber: t } });
    if (!exists) return t;
  }
  throw new Error('Could not allocate tracking number');
}

export const adminListShipments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const customerId = typeof req.query.customerId === 'string' ? req.query.customerId : undefined;

    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;

    const { rows, count } = await Shipment.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      include: [{ model: Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone'], required: false }],
    });
    res.json({
      shipments: rows.map((s) => ({
        ...shipmentAdminShape(s),
        customer: (s as any).customer
          ? {
              id: (s as any).customer.id,
              name: (s as any).customer.name,
              email: (s as any).customer.email,
              phone: (s as any).customer.phone,
            }
          : null,
      })),
      total: count,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const adminCreateShipment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, customerId, status } = req.body as {
      title?: string;
      description?: string;
      customerId?: string | null;
      status?: ShipmentStatus;
    };
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ message: 'title is required' });
      return;
    }
    if (customerId) {
      const cust = await Customer.findByPk(customerId);
      if (!cust) {
        res.status(400).json({ message: 'Customer not found' });
        return;
      }
    }
    const trackingNumber = await uniqueTrackingNumber();
    const s = await Shipment.create({
      trackingNumber,
      title: title.trim(),
      description: description?.trim() || null,
      customerId: customerId || null,
      status: status && Object.values(ShipmentStatus).includes(status) ? status : ShipmentStatus.PENDING,
      progressNote: null,
      currentLocation: null,
      createdById: req.user!.id,
    });
    const withCust = await Shipment.findByPk(s.id, {
      include: [{ model: Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone'], required: false }],
    });
    res.status(201).json({
      ...shipmentAdminShape(withCust!),
      customer: (withCust as any).customer
        ? {
            id: (withCust as any).customer.id,
            name: (withCust as any).customer.name,
            email: (withCust as any).customer.email,
            phone: (withCust as any).customer.phone,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const adminUpdateShipment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, progressNote, currentLocation, title, description, customerId } = req.body as {
      status?: ShipmentStatus;
      progressNote?: string | null;
      currentLocation?: string | null;
      title?: string;
      description?: string | null;
      customerId?: string | null;
    };
    const s = await Shipment.findByPk(id);
    if (!s) {
      res.status(404).json({ message: 'Shipment not found' });
      return;
    }
    if (customerId !== undefined && customerId) {
      const cust = await Customer.findByPk(customerId);
      if (!cust) {
        res.status(400).json({ message: 'Customer not found' });
        return;
      }
    }
    const patch: {
      status?: ShipmentStatus;
      progressNote?: string | null;
      currentLocation?: string | null;
      title?: string;
      description?: string | null;
      customerId?: string | null;
    } = {};
    if (status !== undefined) {
      if (!Object.values(ShipmentStatus).includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
      }
      patch.status = status;
    }
    if (progressNote !== undefined) patch.progressNote = progressNote;
    if (currentLocation !== undefined) patch.currentLocation = currentLocation;
    if (title !== undefined && title.trim()) patch.title = title.trim();
    if (description !== undefined) patch.description = description || null;
    if (customerId !== undefined) patch.customerId = customerId || null;
    await s.update(patch);
    await s.reload({
      include: [{ model: Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone'], required: false }],
    });
    res.json({
      ...shipmentAdminShape(s),
      customer: (s as any).customer
        ? {
            id: (s as any).customer.id,
            name: (s as any).customer.name,
            email: (s as any).customer.email,
            phone: (s as any).customer.phone,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
