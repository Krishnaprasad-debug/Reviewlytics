import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductInsight extends Document {
  productId: string;
  overallSummary: string;
  overallSentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
    mixed?: number;
  };
  averageRating: number;
  topPros: { text: string; count: number }[];
  topCons: { text: string; count: number }[];
  aspectBreakdown: {
    name: string;
    aspect?: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
    score?: number;
    mentions?: number;
  }[];
  topKeywords: { keyword: string; count: number }[];
  keyObservations: string[];
  suspiciousCount: number;
  totalAnalyzed: number;
  reviewCoverage: {
    reviewsAnalyzed: number;
    note?: string;
  };
  purchaseInsight: string;
  reviewSignal: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductInsightSchema = new Schema<IProductInsight>(
  {
    productId: { type: String, required: true, unique: true, index: true },
    overallSummary: { type: String, required: true },
    overallSentiment: { type: String, enum: ['positive', 'neutral', 'negative', 'mixed'], default: 'positive' },
    sentimentBreakdown: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      mixed: { type: Number, default: 0 },
    },
    averageRating: { type: Number, default: 0 },
    topPros: [{ text: { type: String }, count: { type: Number, default: 1 } }],
    topCons: [{ text: { type: String }, count: { type: Number, default: 1 } }],
    aspectBreakdown: [
      {
        name: { type: String },
        aspect: { type: String },
        sentiment: { type: String },
        score: { type: Number },
        mentions: { type: Number },
      },
    ],
    topKeywords: [{ keyword: { type: String }, count: { type: Number, default: 1 } }],
    keyObservations: [{ type: String }],
    suspiciousCount: { type: Number, default: 0 },
    totalAnalyzed: { type: Number, default: 0 },
    reviewCoverage: {
      reviewsAnalyzed: { type: Number, default: 0 },
      note: { type: String, default: '' },
    },
    purchaseInsight: { type: String, default: '' },
    reviewSignal: { type: String, default: 'Generally Positive' },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ProductInsightModel: Model<IProductInsight> =
  (mongoose.models.ProductInsight as Model<IProductInsight>) ||
  mongoose.model<IProductInsight>('ProductInsight', ProductInsightSchema);
