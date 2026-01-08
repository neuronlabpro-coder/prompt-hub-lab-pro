import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables FIRST
dotenv.config();

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
import uploadRoutes from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const connectSrc = [
  "'self'",
  "https://*.supabase.co",
  "https://api.openai.com",
  "https://api.anthropic.com",
  "https://openrouter.ai",
];
if (supabaseUrl) {
  connectSrc.push(supabaseUrl);
}

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc,
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["'self'", "https://js.stripe.com"],
    },
  },
}));

app.use(cors({
  origin: true,
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
app.use('/api', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, '../public/uploads')));

// Serve static files from dist folder
app.use(express.static(join(__dirname, '../dist')));

// Catch-all route to serve index.html for SPA routing
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(__dirname, '../dist/index.html'));
  } else {
    next();
  }
});

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
