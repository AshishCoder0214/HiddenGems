import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';

import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import gemRoutes from './routes/gemRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Sentry Monitoring (in production/when DSN is provided)
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());
}

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Performance Optimization
app.use(compression());

// Parse requests
app.use(express.json({ limit: '10kb' })); // Anti-DoS body limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Global Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Auth routes specific rate limiter (Anti-Brute Force)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 registration/login calls per hour
  message: { error: 'Too many login attempts, please try again in an hour.' }
});
app.use('/api/auth', authLimiter);

// Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.originalUrl}`, { ip: req.ip });
  next();
});

// Setup health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'mongoDB',
    userEmail: 'er.ashishpriyadarshi@gmail.com',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/gems', gemRoutes);
app.use('/api', userRoutes);

// Sentry error handler (must be before standard error handler)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Centralized Error Middleware (Anti-Information Disclosure)
app.use(errorHandler);

// Connect DB & Start server
const startServer = async () => {
  await connectDB(); // Process exits automatically if connection fails
  
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Hidden Gems Production Backend executing on http://localhost:${PORT}`);
  });
};

startServer();
