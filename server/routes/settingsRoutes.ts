import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import {
  db,
  saveApifyTokenToEnv,
} from '../config/db.js';
import {
  getSupabaseStatusInfo,
  connectSupabase,
  saveSupabaseCredentialsToEnv,
  runSupabaseReadWriteVerification,
  migrateJsonToSupabase,
  hydrateMemoryFromSupabase,
} from '../services/supabaseService.js';

const router = Router();

/**
 * GET /api/settings/database/schema-sql
 * Returns the SQL schema migration file content so users in Google AI Studio can copy it with 1 click
 */
router.get('/database/schema-sql', (req: Request, res: Response) => {
  try {
    const sqlPath = path.join(
      process.cwd(),
      'supabase',
      'migrations',
      '20261026000001_initial_reviewlytics_schema.sql'
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    res.json({
      success: true,
      data: {
        filename: 'supabase/migrations/20261026000001_initial_reviewlytics_schema.sql',
        sql,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to load migration SQL file: ' + err.message,
    });
  }
});

/**
 * GET /api/settings/database
 * Fetch active Supabase PostgreSQL persistence engine status and collection metrics
 */
router.get('/database', async (req: Request, res: Response) => {
  try {
    const status = getSupabaseStatusInfo();

    res.json({
      success: true,
      data: {
        isConnected: status.isConnected,
        engine: status.isConnected ? 'supabase' : 'json',
        supabaseConfigured: status.configured,
        missingVars: status.missingVars,
        hasMongoUri: status.configured,
        maskedUri: status.maskedUrl,
        host: status.maskedUrl ? new URL(status.maskedUrl).host : undefined,
        dbName: 'postgres (public)',
        lastError: status.lastError,
        lastVerifiedAt: status.lastVerifiedAt,
        localStats: {
          products: db.products.size,
          reviews: db.reviews.size,
          analyses: db.analyses.size,
          summaries: db.summaries.size,
          listings: db.platformListings.size,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve database status: ' + err.message,
    });
  }
});

/**
 * POST /api/settings/database
 * Connect to Supabase PostgreSQL with provided SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY,
 * persist to .env, and migrate/reconcile records
 */
router.post('/database', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabaseUrl = (req.body.supabaseUrl || req.body.url || process.env.SUPABASE_URL || '').trim();
    const supabaseServiceRoleKey = (
      req.body.supabaseServiceRoleKey ||
      req.body.serviceRoleKey ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      ''
    ).trim();

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      res.status(400).json({
        success: false,
        message: 'Both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.',
      });
      return;
    }

    if (!supabaseUrl.startsWith('https://') && !supabaseUrl.startsWith('http://')) {
      res.status(400).json({
        success: false,
        message: 'Invalid SUPABASE_URL. Must start with "https://" (e.g., https://xyzcompany.supabase.co).',
      });
      return;
    }

    saveSupabaseCredentialsToEnv(supabaseUrl, supabaseServiceRoleKey);

    const connResult = await connectSupabase();
    if (!connResult.connected) {
      res.status(400).json({
        success: false,
        message: `Supabase Connection Failed: ${connResult.message}. Ensure the migration SQL (supabase/migrations/20261026000001_initial_reviewlytics_schema.sql) has been applied to your Supabase project.`,
      });
      return;
    }

    const migrationReport = await migrateJsonToSupabase();
    await hydrateMemoryFromSupabase();

    res.json({
      success: true,
      message: `Connected to Supabase PostgreSQL and reconciled records! (${migrationReport.destinationCounts.products} products, ${migrationReport.destinationCounts.reviews} reviews)`,
      data: {
        isConnected: true,
        engine: 'supabase',
        supabaseConfigured: true,
        hasMongoUri: true,
        maskedUri: supabaseUrl,
        host: new URL(supabaseUrl).host,
        dbName: 'postgres (public)',
        synced: migrationReport.importedCounts,
        localStats: {
          products: db.products.size,
          reviews: db.reviews.size,
          analyses: db.analyses.size,
          summaries: db.summaries.size,
          listings: db.platformListings.size,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to configure Supabase connection: ' + err.message,
    });
  }
});

/**
 * POST /api/settings/database/test
 * Test Supabase PostgreSQL connection & safe read/write verification
 */
router.post('/database/test', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabaseUrl = (req.body.supabaseUrl || req.body.url || process.env.SUPABASE_URL || '').trim();
    const supabaseServiceRoleKey = (
      req.body.supabaseServiceRoleKey ||
      req.body.serviceRoleKey ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      ''
    ).trim();

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      res.status(400).json({
        success: false,
        message: 'Both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for testing.',
      });
      return;
    }

    const verification = await runSupabaseReadWriteVerification(supabaseUrl, supabaseServiceRoleKey);
    if (!verification.connected || !verification.readPass || !verification.writePass) {
      res.status(400).json({
        success: false,
        message: verification.message,
        readPass: verification.readPass,
        writePass: verification.writePass,
      });
      return;
    }

    res.json({
      success: true,
      message: verification.message,
      readPass: verification.readPass,
      writePass: verification.writePass,
      tableCounts: verification.tableCounts,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: `Supabase verification failed: ${err.message}`,
    });
  }
});

/**
 * POST /api/settings/database/sync
 * Manually trigger safe idempotent migration from JSON to Supabase PostgreSQL
 */
router.post('/database/sync', async (req: Request, res: Response): Promise<void> => {
  try {
    const conn = await connectSupabase();
    if (!conn.connected) {
      res.status(400).json({
        success: false,
        message: `Cannot sync: Supabase is not connected (${conn.message}).`,
      });
      return;
    }

    const report = await migrateJsonToSupabase();
    await hydrateMemoryFromSupabase();

    res.json({
      success: true,
      message: report.message,
      counts: report.importedCounts,
      destinationCounts: report.destinationCounts,
      skippedOrFailed: report.skippedOrFailed,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Supabase synchronization failed: ' + err.message,
    });
  }
});

/**
 * GET /api/settings/apify
 * Returns whether Apify token is configured and a masked preview
 */
router.get('/apify', (req: Request, res: Response) => {
  try {
    const rawToken = (process.env.APIFY_API_TOKEN || '').trim();
    const isConfigured = Boolean(rawToken && rawToken !== 'your_apify_token');
    const maskedToken = isConfigured
      ? `${rawToken.slice(0, 8)}••••••••${rawToken.slice(-4)}`
      : null;

    res.json({
      success: true,
      data: {
        isConfigured,
        maskedToken,
        hasToken: Boolean(rawToken),
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve Apify status: ' + err.message,
    });
  }
});

/**
 * POST /api/settings/apify
 * Save Apify API token to server environment and .env
 */
router.post('/apify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid Apify API token string.',
      });
      return;
    }

    const cleanToken = token.trim();
    saveApifyTokenToEnv(cleanToken);

    res.json({
      success: true,
      message: 'Apify API token successfully saved and activated on the server!',
      data: {
        isConfigured: true,
        maskedToken: `${cleanToken.slice(0, 8)}••••••••${cleanToken.slice(-4)}`,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to save Apify token: ' + err.message,
    });
  }
});

export default router;
