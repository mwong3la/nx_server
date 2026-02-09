import { Router } from 'express';
import { login, signup, me, logout } from '../controllers/auth.controller';
import isAuthenticated from '../middlewares/auth.middleware';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/signup', signup);
authRouter.post('/logout', logout);
authRouter.get('/me', isAuthenticated, me);

export default authRouter;
