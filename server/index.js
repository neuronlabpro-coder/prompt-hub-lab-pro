import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// API routes
import promptRoutes from './routes/prompts.js';
import authRoutes from './routes/auth.js';
import executeRoutes from './routes/execute.js';
import improveRoutes from './routes/improve.js';
import translateRoutes from './routes/translate.js';
import emailRoutes from './routes/email.js';
import apiKeysRoutes from './routes/apiKeys.js';
import newsletterRoutes from './routes/newsletter.js';
import marketplaceRoutes from './routes/marketplace.js';
import supportRoutes from './routes/support.js';
import stripeRoutes from './routes/stripe.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/prompts', promptRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/improve', improveRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/api-keys', apiKeysRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/stripe', stripeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Never expose sensitive information in error messages
  const sanitizedMessage = process.env.NODE_ENV === 'development' 
    ? err.message.replace(/api[_-]?key|token|secret|password/gi, '***REDACTED***')
    : 'Something went wrong';
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: sanitizedMessage
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});