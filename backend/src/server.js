import express from 'express';
import { corsMiddleware } from './middleware/corsMiddleware.js';
import { securityMiddleware } from './middleware/securityMiddleware.js';
import { errorHandler } from './utils/errorHandler.js';
import { logger } from './utils/logger.js';

// Import routes
import courseRoutes from './routes/courseRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'OfflineCourseTracker API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/course', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/files', fileRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
  });
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', { error: err.message });
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message });
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

export default app;
