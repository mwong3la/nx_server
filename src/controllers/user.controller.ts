import { Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../database/models/User';
import { AuthenticatedRequest } from '../types/auth';
import { UserRole } from '../types/rbac.types';

function toUserShape(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: (user as any).phone ?? undefined,
    createdAt: (user as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

/** List staff accounts (admins). */
export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const { rows, count } = await User.findAndCountAll({
      where: { role: UserRole.ADMIN },
      attributes: { exclude: ['password'] },
      limit: Math.min(Number(limit) || 50, 100),
      offset: (Math.max(1, Number(page)) - 1) * Number(limit),
      order: [['createdAt', 'DESC']],
    });

    const users = rows.map((u) => toUserShape(u as User));
    res.json({ users, total: count });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user || user.role !== UserRole.ADMIN) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(toUserShape(user));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/** Create another admin staff account. */
export const createAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, name, phone } = req.body as {
      email?: string;
      password?: string;
      name?: string;
      phone?: string;
    };
    if (!email || !password) {
      res.status(400).json({ message: 'email and password are required' });
      return;
    }
    const existing = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      res.status(400).json({ message: 'An account with this email already exists' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: (name && name.trim()) || email.split('@')[0]!,
      role: UserRole.ADMIN,
      phone: phone?.trim() || null,
      isActive: true,
    });
    res.status(201).json(toUserShape(user));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
