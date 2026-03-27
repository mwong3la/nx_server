import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { Customer } from '../database/models/Customer';

function toCustomerShape(c: Customer) {
  return {
    id: c.id,
    name: c.name,
    email: c.email ?? null,
    phone: c.phone ?? null,
    createdAt: (c as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export const listCustomers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const { rows, count } = await Customer.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });
    res.json({
      customers: rows.map((c) => toCustomerShape(c)),
      total: count,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const c = await Customer.findByPk(req.params.id);
    if (!c) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    res.json(toCustomerShape(c));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
    };
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ message: 'name is required' });
      return;
    }
    const c = await Customer.create({
      name: name.trim(),
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
    });
    res.status(201).json(toCustomerShape(c));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const c = await Customer.findByPk(req.params.id);
    if (!c) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    const { name, email, phone } = req.body as {
      name?: string;
      email?: string | null;
      phone?: string | null;
    };
    if (name !== undefined) {
      if (!name.trim()) {
        res.status(400).json({ message: 'name cannot be empty' });
        return;
      }
      c.name = name.trim();
    }
    if (email !== undefined) c.email = email?.trim() || undefined;
    if (phone !== undefined) c.phone = phone?.trim() || undefined;
    await c.save();
    res.json(toCustomerShape(c));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
