import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReviewAnalysis extends Document {
  reviewId: string;
  productId: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  sentimentScore: number;
  aspects: {
    aspect: string;
    sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
    score?: number;
    evidence?: string;
  }[];
  pros: string[];
  cons: string[];
  keywords: string[];
  suspiciousIndicators: string[];
  suspiciousStatus: 'Genuine' | 'Suspicious' | 'Uncertain';
  suspiciousScore: number;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewAnalysisSchema = new Schema<IReviewAnalysis>(
  {
    reviewId: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative', 'mixed'], required: true },
    sentimentScore: { type: Number, default: 0 },
    aspects: [
      {
        aspect: { type: String, required: true },
        sentiment: { type: String, enum: ['positive', 'neutral', 'negative', 'mixed'], required: true },
        score: { type: Number, default: 0 },
        evidence: { type: String, default: '' },
      },
    ],
    pros: [{ type: String }],
    cons: [{ type: String }],
    keywords: [{ type: String }],
    suspiciousIndicators: [{ type: String }],
    suspiciousStatus: { type: String, enum: ['Genuine', 'Suspicious', 'Uncertain'], default: 'Genuine' },
    suspiciousScore: { type: Number, default: 0 },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

export const ReviewAnalysisModel: Model<IReviewAnalysis> =
  (mongoose.models.ReviewAnalysis as Model<IReviewAnalysis>) ||
  mongoose.model<IReviewAnalysis>('ReviewAnalysis', ReviewAnalysisSchema);
