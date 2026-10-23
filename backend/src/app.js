import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Base API endpoints mounted at /api/v1
app.use('/api/v1', apiRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CampusFix API Server. Use /api/v1 for API endpoints.',
    documentation: 'Refer to API Contract v1.0',
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
