import { Response } from 'express';
import { Vehicle } from '../database/models/Vehicle';
import { AuthenticatedRequest } from '../types/auth';
import { UserRole } from '../types/rbac.types';

function toVehicleShape(v: Vehicle) {
  return {
    id: v.id,
    userId: v.userId,
    make: v.make,
    model: v.model,
    year: v.year,
    vin: v.vin ?? undefined,
    registrationNumber: v.registrationNumber ?? undefined,
    mileage: v.mileage ?? undefined,
    mileageUnit: v.mileageUnit ?? undefined,
    createdAt: (v as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: (v as any).updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export const list = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isAdmin = req.userRole === UserRole.ADMIN;
    const where: Record<string, string> = {};
    if (!isAdmin && req.user?.id) where.userId = req.user.id;

    const vehicles = await Vehicle.findAll({
      where: Object.keys(where).length ? where : undefined,
      order: [['createdAt', 'DESC']],
    });
    res.json(vehicles.map((v) => toVehicleShape(v)));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const get = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      res.status(404).json({ message: 'Vehicle not found' });
      return;
    }
    if (req.userRole !== UserRole.ADMIN && vehicle.userId !== req.user?.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    res.json(toVehicleShape(vehicle));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const create = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { make, model, year, vin, registrationNumber, mileage, mileageUnit } = req.body;
    const vehicle = await Vehicle.create({
      userId,
      make,
      model,
      year,
      vin: vin || null,
      registrationNumber: registrationNumber || null,
      mileage: mileage != null ? Number(mileage) : null,
      mileageUnit: mileageUnit || null,
    });
    res.status(201).json(toVehicleShape(vehicle));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const update = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      res.status(404).json({ message: 'Vehicle not found' });
      return;
    }
    if (req.userRole !== UserRole.ADMIN && vehicle.userId !== req.user?.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    const { make, model, year, vin, registrationNumber, mileage, mileageUnit } = req.body;
    await vehicle.update({
      ...(make !== undefined && { make }),
      ...(model !== undefined && { model }),
      ...(year !== undefined && { year }),
      ...(vin !== undefined && { vin }),
      ...(registrationNumber !== undefined && { registrationNumber }),
      ...(mileage !== undefined && { mileage }),
      ...(mileageUnit !== undefined && { mileageUnit }),
    });
    res.json(toVehicleShape(vehicle));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const remove = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      res.status(404).json({ message: 'Vehicle not found' });
      return;
    }
    if (req.userRole !== UserRole.ADMIN && vehicle.userId !== req.user?.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    await vehicle.destroy();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
