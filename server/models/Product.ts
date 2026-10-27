import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct {
  _id: string;
  name: string;
  brand: string;
  category: string;
  image?: string;
  description?: string;
  price?: number;
  currency?: string;
  features?: string[];
  canonicalId?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: String, default: 'Electronics', trim: true },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    features: [{ type: String }],
    canonicalId: { type: String, index: true },
    createdBy: { type: String, default: 'system' },
  },
  { timestamps: true }
);

export const ProductModel: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>('Product', ProductSchema);
