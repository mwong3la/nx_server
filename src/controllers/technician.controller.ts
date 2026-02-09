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

export const list = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.findAll({
      where: { role: UserRole.TECHNICIAN },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(users.map((u) => toUserShape(u)));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const create = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(400).json({ message: 'A technician with this email already exists' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      role: UserRole.TECHNICIAN,
      phone: phone || null,
    });
    res.status(201).json(toUserShape(user));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
