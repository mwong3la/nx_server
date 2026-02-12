import { Response } from 'express';
import { Op } from 'sequelize';
import { Inspection, InspectionStatus } from '../database/models/Inspection';
import { Vehicle } from '../database/models/Vehicle';
import { User } from '../database/models/User';
import { Subscription } from '../database/models/Subscription';
import { AuthenticatedRequest } from '../types/auth';
import { UserRole } from '../types/rbac.types';

function toInspectionShape(i: Inspection & { vehicle?: Vehicle; technician?: User }) {
  return {
    id: i.id,
    userId: i.userId,
    vehicleId: i.vehicleId,
    vehicle: i.vehicle ? { id: i.vehicle.id, make: i.vehicle.make, model: i.vehicle.model, year: i.vehicle.year, userId: i.vehicle.userId } : undefined,
    technicianId: i.technicianId ?? undefined,
    technician: i.technician ? { id: i.technician.id, email: i.technician.email, name: (i.technician as any).name, role: i.technician.role } : undefined,
    status: i.status,
    requestedAt: (i as any).requestedAt?.toISOString?.() ?? new Date().toISOString(),
    scheduledAt: (i as any).scheduledAt?.toISOString?.() ?? undefined,
    startedAt: (i as any).startedAt?.toISOString?.() ?? undefined,
    completedAt: (i as any).completedAt?.toISOString?.() ?? undefined,
    reportId: i.reportId ?? undefined,
    notes: i.notes ?? undefined,
    createdAt: (i as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: (i as any).updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

const includeVehicleAndTechnician = [
  { model: Vehicle, as: 'vehicle', attributes: ['id', 'userId', 'make', 'model', 'year'] },
  { model: User, as: 'technician', attributes: ['id', 'email', 'name', 'role'], required: false },
];

export const list = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, vehicleId } = req.query;
    const where: Record<string, unknown> = {};
    if (req.userRole !== UserRole.ADMIN && req.user?.id) {
      where.userId = req.user.id;
    }
    if (status && typeof status === 'string') where.status = status;
    if (vehicleId && typeof vehicleId === 'string') where.vehicleId = vehicleId;

    const inspections = await Inspection.findAll({
      where,
      include: includeVehicleAndTechnician,
      order: [['createdAt', 'DESC']],
    });
    res.json(inspections.map((i) => toInspectionShape(i as any)));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const listMine = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const inspections = await Inspection.findAll({
      where: { technicianId: req.user!.id },
      include: includeVehicleAndTechnician,
      order: [['createdAt', 'DESC']],
    });
    res.json(inspections.map((i) => toInspectionShape(i as any)));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const listAssigned = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const inspections = await Inspection.findAll({
      where: { technicianId: req.user!.id },
      include: includeVehicleAndTechnician,
      order: [['createdAt', 'DESC']],
    });
    res.json(inspections.map((i) => toInspectionShape(i as any)));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const get = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const inspection = await Inspection.findByPk(id, {
      include: includeVehicleAndTechnician,
    });
    if (!inspection) {
      res.status(404).json({ message: 'Inspection not found' });
      return;
    }
    if (req.userRole !== UserRole.ADMIN && inspection.userId !== req.user?.id && inspection.technicianId !== req.user?.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    res.json(toInspectionShape(inspection as any));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const create = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { vehicleId, scheduledAt, notes } = req.body;
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      res.status(404).json({ message: 'Vehicle not found' });
      return;
    }
    if (req.userRole !== UserRole.ADMIN && vehicle.userId !== req.user?.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    // Require an active subscription for non-admin users before creating an inspection
    if (req.userRole !== UserRole.ADMIN) {
      const activeSub = await Subscription.findOne({
        where: { userId: vehicle.userId, status: 'active' },
      });
      if (!activeSub) {
        res.status(403).json({ message: 'An active subscription is required to request an inspection.' });
        return;
      }
    }
    const inspection = await Inspection.create({
      userId: vehicle.userId,
      vehicleId,
      status: InspectionStatus.PENDING,
      requestedAt: new Date(),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      notes: notes || null,
    });
    const withIncludes = await Inspection.findByPk(inspection.id, { include: includeVehicleAndTechnician });
    res.status(201).json(toInspectionShape(withIncludes as any));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const assign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;
    const inspection = await Inspection.findByPk(id, { include: includeVehicleAndTechnician });
    if (!inspection) {
      res.status(404).json({ message: 'Inspection not found' });
      return;
    }
    if (req.userRole !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only admin can assign' });
      return;
    }
    await inspection.update({
      technicianId,
      status: InspectionStatus.ASSIGNED,
    });
    const updated = await Inspection.findByPk(id, { include: includeVehicleAndTechnician });
    res.json(toInspectionShape(updated as any));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const start = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const inspection = await Inspection.findByPk(id, { include: includeVehicleAndTechnician });
    if (!inspection) {
      res.status(404).json({ message: 'Inspection not found' });
      return;
    }
    if (inspection.technicianId !== req.user?.id && req.userRole !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only assigned technician can start' });
      return;
    }
    await inspection.update({
      status: InspectionStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
    const updated = await Inspection.findByPk(id, { include: includeVehicleAndTechnician });
    res.json(toInspectionShape(updated as any));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const complete = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const inspection = await Inspection.findByPk(id, { include: includeVehicleAndTechnician });
    if (!inspection) {
      res.status(404).json({ message: 'Inspection not found' });
      return;
    }
    if (inspection.technicianId !== req.user?.id && req.userRole !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only assigned technician can complete' });
      return;
    }
    await inspection.update({
      status: InspectionStatus.COMPLETED,
      completedAt: new Date(),
    });
    const updated = await Inspection.findByPk(id, { include: includeVehicleAndTechnician });
    res.json(toInspectionShape(updated as any));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
