import { Response } from 'express';
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

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, role } = req.query;
    const where: Record<string, unknown> = {};
    if (role && typeof role === 'string') where.role = role;

    const { rows, count } = await User.findAndCountAll({
      where,
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
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(toUserShape(user));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
