import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

// In CommonJS mode (no "type":"module"), dotenv.config() automatically reads
// the .env file in the current working directory (backend/).
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import incidentRoutes from './routes/incident.routes';
import analyticsRoutes from './routes/analytics.routes';
import investigationRoutes from './routes/investigation.routes';
import actionItemRoutes from './routes/actionItem.routes';
import referenceRoutes from './routes/reference.routes';
import aiRoutes from './routes/ai.routes';
import importRoutes from './routes/import.routes';
import { errorHandler, notFound } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & parsing middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Incident Dashboard API v1.0', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/investigations', investigationRoutes);
app.use('/api/action-items', actionItemRoutes);
app.use('/api', referenceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/import', importRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🤖 AI Service: ${process.env.ANTHROPIC_API_KEY ? 'Configured ✓' : 'Not configured (add ANTHROPIC_API_KEY to backend/.env)'}`);
});

export default app;
