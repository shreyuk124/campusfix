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

// Enable Cross-Origin requests from the frontend
const configuredClientUrl = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.trim().replace(/\/+$/, '')
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, '');
      if (
        !configuredClientUrl ||
        configuredClientUrl === '*' ||
        cleanOrigin === configuredClientUrl ||
        cleanOrigin === 'http://localhost:5173' ||
        cleanOrigin === 'http://localhost:5174' ||
        cleanOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, cleanOrigin);
      }
      return callback(null, cleanOrigin);
    },
    credentials: true,
  })
);

// Clear, beginner-friendly request logger that logs method, path, status, and duration
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[HTTP] ${req.method} ${req.originalUrl || req.url} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Middleware for parsing JSON and Form bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API routes
app.use('/api/v1', apiRoutes);

// Health check root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CampusFix API Server. Use /api/v1 for API endpoints.',
    documentation: 'Refer to API Contract v1.0',
  });
});

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

export default app;
