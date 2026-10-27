import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/authRoutes.js';
import productRoutes from './server/routes/productRoutes.js';
import reviewRoutes from './server/routes/reviewRoutes.js';
import analysisRoutes from './server/routes/analysisRoutes.js';
import analyticsRoutes from './server/routes/analyticsRoutes.js';
import uploadRoutes from './server/routes/uploadRoutes.js';
import importRoutes from './server/routes/importRoutes.js';
import settingsRoutes from './server/routes/settingsRoutes.js';
import {
  connectSupabase,
  getSupabaseStatusInfo,
} from './server/services/supabaseService.js';
import { seedInitialDataIfNeeded } from './server/services/seedService.js';

// Capture runtime-injected secrets from container environment before dotenv
const runtimeApifyToken = process.env.APIFY_API_TOKEN;
const runtimeGeminiKey = process.env.GEMINI_API_KEY;
const runtimeSupabaseUrl = process.env.SUPABASE_URL;
const runtimeSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

dotenv.config();

// Ensure real container secrets take absolute precedence over placeholder values
if (runtimeApifyToken && runtimeApifyToken !== 'your_apify_token') {
  process.env.APIFY_API_TOKEN = runtimeApifyToken;
}
if (runtimeGeminiKey && runtimeGeminiKey !== 'MY_GEMINI_API_KEY') {
  process.env.GEMINI_API_KEY = runtimeGeminiKey;
}
if (runtimeSupabaseUrl && runtimeSupabaseUrl !== 'https://your-project-ref.supabase.co') {
  process.env.SUPABASE_URL = runtimeSupabaseUrl;
}
if (runtimeSupabaseKey && runtimeSupabaseKey !== 'your_supabase_service_role_key') {
  process.env.SUPABASE_SERVICE_ROLE_KEY = runtimeSupabaseKey;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Seed default demo datasets into memory if local store is empty
  await seedInitialDataIfNeeded();

  // Initialize Supabase PostgreSQL connection and hydrate/reconcile if configured
  await connectSupabase();

  // Global middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    const dbStatus = getSupabaseStatusInfo();
    res.json({
      status: 'ok',
      service: 'AI Product Review Analyzer API',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      aiModel: 'AI Review Intelligence Engine',
      database: {
        provider: 'Supabase PostgreSQL',
        isConnected: dbStatus.isConnected,
        configured: dbStatus.configured,
        missingVars: dbStatus.missingVars,
        activeEngine: dbStatus.isConnected ? 'supabase' : 'preserved_json_fallback',
        lastError: dbStatus.lastError,
      },
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/analysis', analysisRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/import', importRoutes);
  app.use('/api/settings', settingsRoutes);

  // Global error handling middleware for API routes
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('API Error:', err);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal server error occurred.',
    });
  });

  // Vite middleware in development vs static SPA serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`REVIEWLYTICS backend server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
