import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlatformListing extends Document {
  productId: string;
  platform: 'amazon' | 'flipkart';
  platformProductId: string; // ASIN or Flipkart PID
  url: string;
  price?: number;
  currency?: string;
  rating?: number;
  ratingsCount?: number;
  availability?: string;
  lastScrapedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformListingSchema = new Schema<IPlatformListing>(
  {
    productId: { type: String, required: true, index: true },
    platform: { type: String, enum: ['amazon', 'flipkart'], required: true },
    platformProductId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    price: { type: Number },
    currency: { type: String, default: 'INR' },
    rating: { type: Number },
    ratingsCount: { type: Number },
    availability: { type: String, default: 'In Stock' },
    lastScrapedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PlatformListingSchema.index({ platform: 1, platformProductId: 1 }, { unique: true });

export const PlatformListingModel: Model<IPlatformListing> =
  (mongoose.models.PlatformListing as Model<IPlatformListing>) ||
  mongoose.model<IPlatformListing>('PlatformListing', PlatformListingSchema);
