import express from 'express';
import { getUsers, getUser } from '../controllers/user.controller';
import isAuthenticated from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types/rbac.types';

const userRouter = express.Router();

userRouter.get('/', isAuthenticated, requireRole([UserRole.ADMIN]), getUsers);
userRouter.get('/:id', isAuthenticated, requireRole([UserRole.ADMIN]), getUser);

export default userRouter;
