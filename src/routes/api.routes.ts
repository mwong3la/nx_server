import { Router } from 'express';
import authRouter from './auth.routes';
import userRouter from './users.routes';
import adminRouter from './admin.routes';
import publicRouter from './public.routes';

const apiRouter = Router();

apiRouter.use('/public', publicRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/admin', adminRouter);

export default apiRouter;
