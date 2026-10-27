import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  productId: string;
  platform: 'amazon' | 'flipkart' | 'manual' | 'csv' | 'api';
  reviewId: string;
  rating: number;
  title?: string;
  text: string;
  author?: string;
  date?: string;
  verifiedPurchase?: boolean;
  helpfulVotes?: number;
  reviewUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: String, required: true, index: true },
    platform: { type: String, enum: ['amazon', 'flipkart', 'manual', 'csv', 'api'], required: true },
    reviewId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    text: { type: String, required: true },
    author: { type: String, default: 'Customer' },
    date: { type: String, default: '' },
    verifiedPurchase: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
    reviewUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

ReviewSchema.index({ platform: 1, reviewId: 1 }, { unique: true });

export const ReviewModel: Model<IReview> =
  (mongoose.models.Review as Model<IReview>) || mongoose.model<IReview>('Review', ReviewSchema);
