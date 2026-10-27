import { Response } from 'express';
import multer from 'multer';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { db, ReviewDoc, AnalysisDoc } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { analyzeReview } from '../services/geminiService.js';
import {
  pgUpsertReviewsBatch,
  pgUpsertAnalysesBatch,
} from '../services/supabaseService.js';

// Multer memory storage configuration (max 5MB)
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.endsWith('.csv') ||
      file.mimetype === 'text/plain'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed.'));
    }
  },
});

interface ParsedRow {
  rowNumber: number;
  reviewText: string;
  rating: number;
  title: string;
  authorName: string;
  isValid: boolean;
  error?: string;
}

function normalizeCsvHeaders(headers: string[]): { [key: string]: string } {
  const map: { [key: string]: string } = {};
  headers.forEach(h => {
    const clean = h.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    map[clean] = h;
  });
  return map;
}

export async function parseAndValidateCsv(buffer: Buffer): Promise<{ rows: ParsedRow[]; errors: string[]; summary: { total: number; valid: number; invalid: number } }> {
  return new Promise((resolve, reject) => {
    const rows: ParsedRow[] = [];
    const errors: string[] = [];
    let rowCount = 0;

    const stream = Readable.from(buffer);
    stream
      .pipe(csvParser())
      .on('data', (data) => {
        rowCount++;
        const keys = Object.keys(data);
        const headerMap = normalizeCsvHeaders(keys);

        // Find review text column
        const textKey =
          headerMap['review'] ||
          headerMap['reviewtext'] ||
          headerMap['text'] ||
          headerMap['content'] ||
          headerMap['feedback'] ||
          headerMap['comment'] ||
          keys.find(k => k.toLowerCase().includes('review') || k.toLowerCase().includes('text') || k.toLowerCase().includes('body'));

        // Find rating column
        const ratingKey =
          headerMap['rating'] ||
          headerMap['score'] ||
          headerMap['stars'] ||
          headerMap['star'] ||
          keys.find(k => k.toLowerCase().includes('rating') || k.toLowerCase().includes('score') || k.toLowerCase().includes('star'));

        // Optional title & author
        const titleKey = headerMap['title'] || headerMap['headline'] || headerMap['summary'];
        const authorKey = headerMap['author'] || headerMap['authorname'] || headerMap['user'] || headerMap['username'] || headerMap['reviewer'];

        const rawText = textKey ? String(data[textKey] || '').trim() : '';
        const rawRating = ratingKey ? parseFloat(String(data[ratingKey]).trim()) : 5;
        const title = titleKey ? String(data[titleKey] || '').trim() : '';
        const authorName = authorKey ? String(data[authorKey] || '').trim() : 'Verified Buyer';

        if (!rawText || rawText.length < 3) {
          errors.push(`Row ${rowCount}: Review text is missing or too short.`);
          rows.push({
            rowNumber: rowCount,
            reviewText: rawText,
            rating: isNaN(rawRating) ? 5 : Math.min(5, Math.max(1, rawRating)),
            title: title || 'Customer Review',
            authorName,
            isValid: false,
            error: 'Review text is too short or empty.',
          });
          return;
        }

        let parsedRating = isNaN(rawRating) ? 5 : rawRating;
        if (parsedRating < 1) parsedRating = 1;
        if (parsedRating > 5) parsedRating = 5;

        rows.push({
          rowNumber: rowCount,
          reviewText: rawText,
          rating: Math.round(parsedRating * 10) / 10,
          title: title || (rawText.length > 40 ? rawText.substring(0, 40) + '...' : rawText),
          authorName: authorName || `Buyer #${rowCount}`,
          isValid: true,
        });
      })
      .on('end', () => {
        const valid = rows.filter(r => r.isValid).length;
        resolve({
          rows,
          errors,
          summary: {
            total: rows.length,
            valid,
            invalid: rows.length - valid,
          },
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

export async function previewCsv(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No CSV file uploaded.' });
      return;
    }

    const { rows, errors, summary } = await parseAndValidateCsv(req.file.buffer);

    res.json({
      success: true,
      message: `Parsed ${summary.total} rows. ${summary.valid} valid, ${summary.invalid} invalid.`,
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        summary,
        errors: errors.slice(0, 10),
        previewRows: rows.slice(0, 8),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to parse CSV file.' });
  }
}

export async function importCsv(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No CSV file uploaded.' });
      return;
    }

    const { productId, autoAnalyze = 'false' } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required for import.' });
      return;
    }

    const product = db.products.get(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const { rows, errors, summary } = await parseAndValidateCsv(req.file.buffer);
    const validRows = rows.filter(r => r.isValid);

    if (validRows.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No valid reviews found in the uploaded CSV.',
        errors,
      });
      return;
    }

    const insertedReviews: ReviewDoc[] = [];
    const now = new Date().toISOString();

    for (const row of validRows) {
      const reviewDoc: ReviewDoc = {
        _id: uuidv4(),
        productId,
        userId: req.user?._id,
        authorName: row.authorName,
        rating: row.rating,
        title: row.title,
        reviewText: row.reviewText,
        source: 'csv',
        verifiedPurchase: true,
        createdAt: now,
        updatedAt: now,
      };
      insertedReviews.push(reviewDoc);
    }

    await pgUpsertReviewsBatch(insertedReviews);

    let analyzeCount = 0;
    const insertedAnalyses: AnalysisDoc[] = [];
    if (autoAnalyze === 'true' || autoAnalyze === true) {
      const batchToAnalyze = insertedReviews.slice(0, 25);
      for (const rev of batchToAnalyze) {
        try {
          const aiResult = await analyzeReview(rev.reviewText, rev.rating, product.name);
          const analysis: AnalysisDoc = {
            _id: uuidv4(),
            reviewId: rev._id,
            productId: rev.productId,
            sentiment: aiResult.sentiment,
            confidence: aiResult.confidence,
            aspects: aiResult.aspects,
            pros: aiResult.pros,
            cons: aiResult.cons,
            keywords: aiResult.keywords,
            suspiciousStatus: aiResult.suspiciousStatus,
            suspiciousReason: aiResult.suspiciousReason,
            suspiciousScore: aiResult.suspiciousScore,
            createdAt: now,
            updatedAt: now,
          };
          insertedAnalyses.push(analysis);
          analyzeCount++;
        } catch (e) {
          console.error('Auto analysis error during CSV import:', e);
        }
      }
      if (insertedAnalyses.length > 0) {
        await pgUpsertAnalysesBatch(insertedAnalyses);
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${insertedReviews.length} reviews for ${product.name}!${analyzeCount > 0 ? ` (${analyzeCount} AI analyzed)` : ''}`,
      data: {
        importedCount: insertedReviews.length,
        skippedCount: summary.invalid,
        analyzedCount: analyzeCount,
        product: product.name,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to import CSV reviews.' });
  }
}
