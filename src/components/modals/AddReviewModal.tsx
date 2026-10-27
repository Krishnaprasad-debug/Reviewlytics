import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { RatingStars } from '../common/RatingStars.js';
import { Product, Review } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { Sparkles, User, MessageSquare, Tag } from 'lucide-react';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProductId?: string;
  reviewToEdit?: Review | null;
  onSuccess: (review: Review) => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProductId,
  reviewToEdit,
  onSuccess,
}) => {
  const { toast, success, error } = useToast();
  const [productId, setProductId] = useState(selectedProductId || '');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reviewToEdit) {
      setProductId(reviewToEdit.productId);
      setRating(reviewToEdit.rating);
      setTitle(reviewToEdit.title);
      setReviewText(reviewToEdit.reviewText);
      setAuthorName(reviewToEdit.authorName || '');
    } else {
      setProductId(selectedProductId || (products.length > 0 ? products[0]._id : ''));
      setRating(5);
      setTitle('');
      setReviewText('');
      setAuthorName('');
    }
  }, [reviewToEdit, selectedProductId, products, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      error('Please select a target product.');
      return;
    }
    if (!reviewText.trim()) {
      error('Please enter review feedback.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (reviewToEdit) {
        const res = await api.reviews.update(reviewToEdit._id, {
          rating,
          title: title.trim() || 'Customer Review',
          reviewText: reviewText.trim(),
          authorName: authorName.trim() || 'Verified Buyer',
          reanalyze: autoAnalyze,
        });
        success('Review updated successfully!');
        onSuccess(res.data.review);
      } else {
        const res = await api.reviews.create({
          productId,
          rating,
          title: title.trim() || (reviewText.length > 40 ? reviewText.substring(0, 40) + '...' : reviewText),
          reviewText: reviewText.trim(),
          authorName: authorName.trim() || 'Verified Buyer',
          autoAnalyze,
        });
        success(
          autoAnalyze
            ? 'Review submitted and analyzed by AI Review Intelligence!'
            : 'Review submitted successfully!'
        );
        onSuccess(res.data.review);
      }
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reviewToEdit ? 'Edit Customer Review' : 'Add Product Review'}
      subtitle="Submit customer feedback with real-time AI sentiment & aspect extraction."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Select Product <span className="text-rose-500">*</span>
          </label>
          <select
            value={productId}
            onChange={e => setProductId(e.target.value)}
            required
            disabled={!!selectedProductId && !reviewToEdit}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="" disabled>
              Select product...
            </option>
            {products.map(p => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.brand})
              </option>
            ))}
          </select>
        </div>

        {/* Rating selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Product Rating (1 to 5 Stars)
          </label>
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl">
            <RatingStars rating={rating} interactive size="lg" onChange={val => setRating(val)} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {rating} of 5 Stars
            </span>
          </div>
        </div>

        {/* Review Title & Author */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Review Headline
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Incredible noise cancellation!"
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Author / Reviewer Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Detailed Review Text */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Customer Review Text <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <textarea
              rows={4}
              required
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Describe user experience, battery, ergonomics, sound, quality, or issues..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        </div>

        {/* Auto Analyze Checkbox */}
        <div className="p-3 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <div>
              <div className="font-semibold text-xs text-cyan-900 dark:text-cyan-200">
                Run AI NLP Review Analysis
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Instantly extract sentiment, aspect scores, pros, cons, and suspicious review indicators.
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoAnalyze}
            onChange={e => setAutoAnalyze(e.target.checked)}
            className="w-4 h-4 accent-cyan-600 rounded cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{reviewToEdit ? 'Update Review' : 'Submit & Analyze'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
