import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../database/models/User';
import { AuthenticatedRequest } from '../types/auth';
import dotenv from 'dotenv';
import { UserRole } from '../types/rbac.types';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'coltium-secret';
const JWT_EXPIRES_IN = '7d';

function toUserShape(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone ?? undefined,
    createdAt: (user as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

function generateToken(user: User): { token: string; expiresAt: string } {
  const expiresIn = JWT_EXPIRES_IN;
  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn }
  );
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return { token, expiresAt };
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    if (!user.isActive) {
      res.status(401).json({ message: 'Account deactivated' });
      return;
    }
    await user.update({ lastLoginAt: new Date() });
    const { token, expiresAt } = generateToken(user);
    res.status(200).json({
      user: toUserShape(user),
      token,
      expiresAt,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, phone } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(400).json({ message: 'Account already exists with this email' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      role: role && Object.values(UserRole).includes(role) ? role : UserRole.USER,
      phone: phone || null,
    });
    const { token, expiresAt } = generateToken(user);
    res.status(201).json({
      user: toUserShape(user),
      token,
      expiresAt,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    res.json(toUserShape(req.user));
  } catch (error: any) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.status(200).json({ ok: true });
};
