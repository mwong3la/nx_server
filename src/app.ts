import express, { Application, Request, Response } from 'express';
import apiRouter from './routes/api.routes';
import http from 'http';
import cors from 'cors';
import { initializeDatabase } from './database/db';

const app: Application = express();

const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({
  credentials: true,
}));

app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Coltium-Auto API", version: "1.0" });
});

app.use("/api/v1", apiRouter);

async function startServer() {
  try {
    await initializeDatabase();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
