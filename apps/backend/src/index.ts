import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import winston from 'winston';

// Import routes
import authRoutes from './routes/auth';
import { generalRateLimit } from './middleware/rateLimit';
import { verifyEmailConnection } from './utils/email';
import { cleanupExpiredTokens } from './utils/auth';

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'high-seas-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  })
);
app.use(express.json());
app.use(generalRateLimit); // Apply general rate limiting to all routes

// Routes
app.use('/api/auth', authRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'high-seas-backend',
  });
});

// Socket.io connection handling
io.on('connection', socket => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  // Test event
  socket.on('test', data => {
    logger.info('Test event received:', data);
    socket.emit('test-response', {
      message: 'Hello from High Seas VTT server!',
      data,
    });
  });
});

const PORT = process.env.PORT || 3001;

// Initialize services
const initializeServices = async () => {
  // Verify email connection
  await verifyEmailConnection();

  // Run initial cleanup of expired tokens
  await cleanupExpiredTokens();

  // Schedule periodic cleanup of expired tokens (every hour)
  setInterval(
    async () => {
      await cleanupExpiredTokens();
    },
    60 * 60 * 1000
  );
};

server.listen(PORT, async () => {
  logger.info(`🏴‍☠️ High Seas VTT Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Initialize services
  await initializeServices();
});
