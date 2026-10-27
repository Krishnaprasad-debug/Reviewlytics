import { ApifyClient } from 'apify-client';

export interface ScrapedAmazonProduct {
  asin: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  rating: number;
  ratingsCount: number;
  image: string;
  url: string;
  availability?: string;
  features?: string[];
}

export interface ScrapedAmazonReview {
  reviewId: string;
  rating: number;
  title: string;
  text: string;
  author: string;
  date: string;
  verifiedPurchase: boolean;
  helpfulVotes: number;
  source: 'amazon' | 'flipkart';
  platform?: 'amazon' | 'flipkart';
  reviewText?: string;
  authorName?: string;
}

export interface ApifyAmazonScrapeResult {
  success: boolean;
  source: 'amazon' | 'flipkart';
  product: ScrapedAmazonProduct;
  reviews: ScrapedAmazonReview[];
  reviewCount: number;
}

export interface CustomError extends Error {
  statusCode?: number;
}

/**
 * Scrapes customer reviews and product details for an Amazon URL or ASIN
 * via the Apify actor `kestrel/amazon-reviews-scraper`.
 */
export async function scrapeAmazonReviews(
  targetUrl: string,
  asin: string,
  domain: string = 'in'
): Promise<ApifyAmazonScrapeResult> {
  const token = process.env.APIFY_API_TOKEN;

  if (!token || !token.trim()) {
    const error: CustomError = new Error(
      'APIFY_API_TOKEN environment variable is not configured. Please configure your Apify API token.'
    );
    error.statusCode = 500;
    throw error;
  }

  console.log(`[Apify] Starting Amazon review extraction`);
  console.log(`[Apify] ASIN: ${asin}`);

  const client = new ApifyClient({ token: token.trim() });

  // Configure scraper input according to actor specifications: pass canonical ASIN and domain
  const input = {
    asins: [asin],
    domain: domain || 'in',
    maxReviewsPerProduct: 10,
    requireText: true,
    verifiedOnly: false,
  };

  let run;
  try {
    // Run the Apify actor and wait for it to complete without redirecting actor console logs to stderr
    run = await client.actor('kestrel/amazon-reviews-scraper').call(input, {
      waitSecs: 180,
      log: null,
    });
  } catch (err: any) {
    const isTimeout = err?.message?.toLowerCase().includes('timeout') || err?.code === 'ETIMEDOUT';
    const errorMsg = isTimeout
      ? 'Apify actor execution timed out while scraping Amazon reviews.'
      : `Apify scraper request failed: ${err?.message || 'Actor execution failure'}`;

    console.error('[Apify] Actor execution error:', err?.message || err);
    const error: CustomError = new Error(errorMsg);
    error.statusCode = 502;
    throw error;
  }

  if (!run || !run.defaultDatasetId) {
    const error: CustomError = new Error('Apify actor finished without creating a valid dataset.');
    error.statusCode = 502;
    throw error;
  }

  // Fetch dataset items produced by the scraper run
  let items: any[] = [];
  try {
    const dataset = await client.dataset(run.defaultDatasetId).listItems();
    items = dataset.items || [];
  } catch (datasetErr: any) {
    console.error('[Apify] Failed to fetch dataset items:', datasetErr?.message || datasetErr);
    const error: CustomError = new Error('Failed to retrieve scraped data records from Apify dataset.');
    error.statusCode = 502;
    throw error;
  }

  if (!items || items.length === 0) {
    const error: CustomError = new Error('No data was returned by the Apify scraper for this product.');
    error.statusCode = 404;
    throw error;
  }

  let productRecord: any = null;
  const rawReviews: any[] = [];
  const validReviews: ScrapedAmazonReview[] = [];

  for (const item of items) {
    const isProduct =
      item.type === 'product' ||
      (!item.type && (item.asin || item.title) && !item.review_id && !item.text);

    const isReview =
      item.type === 'review' ||
      Boolean(item.review_id) ||
      (item.rating !== undefined && (item.text !== undefined || item.title !== undefined));

    if (isProduct && !productRecord) {
      productRecord = item;
    } else if (isReview) {
      rawReviews.push(item);

      // Enforce strict criteria: Only review records where text is a non-empty string
      // Do not use review URLs as a substitute for review text.
      const rawText = item.text || item.reviewText || item.body || item.content;
      if (typeof rawText === 'string' && rawText.trim().length > 0) {
        const cleanText = rawText.trim();
        const reviewId = String(
          item.review_id || item.reviewId || item.id || `amz-rev-${asin}-${validReviews.length + 1}`
        );
        const ratingVal =
          typeof item.rating === 'number'
            ? item.rating
            : parseFloat(String(item.rating || '5')) || 5;
        const titleVal = typeof item.title === 'string' ? item.title.trim() : '';
        const authorVal =
          typeof item.author === 'string' && item.author.trim()
            ? item.author.trim()
            : 'Amazon Customer';
        const dateVal =
          typeof item.date_text === 'string' && item.date_text.trim()
            ? item.date_text.trim()
            : typeof item.date === 'string' && item.date.trim()
            ? item.date.trim()
            : new Date().toISOString();
        const verifiedVal = Boolean(item.verified ?? item.verifiedPurchase ?? true);
        const helpfulVotes =
          typeof item.helpful_votes === 'number'
            ? item.helpful_votes
            : parseInt(String(item.helpful_votes || '0'), 10) || 0;

        validReviews.push({
          reviewId,
          rating: Math.min(5, Math.max(1, ratingVal)),
          title: titleVal,
          text: cleanText,
          reviewText: cleanText,
          author: authorVal,
          authorName: authorVal,
          date: dateVal,
          verifiedPurchase: verifiedVal,
          helpfulVotes,
          source: 'amazon',
        });
      }
    }
  }

  console.log(`[Apify] Reviews returned: ${rawReviews.length}`);
  console.log(`[Apify] Reviews with text: ${validReviews.length}`);

  if (rawReviews.length === 0 && !productRecord) {
    const error: CustomError = new Error('No product or reviews found for the provided Amazon URL.');
    error.statusCode = 404;
    throw error;
  }

  // Parse product price
  let priceNumber = 0;
  if (typeof productRecord?.price === 'number') {
    priceNumber = productRecord.price;
  } else if (typeof productRecord?.price_display === 'string') {
    const parsed = parseFloat(productRecord.price_display.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) priceNumber = parsed;
  } else if (typeof productRecord?.price === 'string') {
    const parsed = parseFloat(productRecord.price.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) priceNumber = parsed;
  }

  // Parse product ratings count
  const rawRatingsCount =
    productRecord?.ratings_count ?? productRecord?.ratingsCount ?? productRecord?.reviews_visible;
  let ratingsCountNumber = 0;
  if (typeof rawRatingsCount === 'number') {
    ratingsCountNumber = rawRatingsCount;
  } else if (rawRatingsCount) {
    ratingsCountNumber = parseInt(String(rawRatingsCount).replace(/[^0-9]/g, ''), 10) || 0;
  }

  // Parse product average rating
  const rawRating = productRecord?.rating;
  let ratingNumber = 4.0;
  if (typeof rawRating === 'number') {
    ratingNumber = Number(rawRating.toFixed(1));
  } else if (rawRating) {
    const parsed = parseFloat(String(rawRating));
    if (!isNaN(parsed)) ratingNumber = Number(parsed.toFixed(1));
  }

  // Determine currency based on domain or record
  const defaultCurrency = domain === 'in' ? 'INR' : domain === 'co.uk' ? 'GBP' : domain === 'de' ? 'EUR' : 'USD';
  const currency = productRecord?.currency || defaultCurrency;

  const normalizedProduct: ScrapedAmazonProduct = {
    asin: productRecord?.asin || asin,
    name: productRecord?.title || productRecord?.name || `Amazon Product (${asin})`,
    brand: productRecord?.brand || 'Amazon',
    price: priceNumber,
    currency,
    rating: ratingNumber,
    ratingsCount: ratingsCountNumber,
    image:
      productRecord?.image ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    url: productRecord?.url || targetUrl,
    availability: productRecord?.availability,
    features: Array.isArray(productRecord?.features) ? productRecord.features : undefined,
  };

    return {
    success: true,
    source: 'amazon',
    product: normalizedProduct,
    reviews: validReviews,
    reviewCount: validReviews.length,
  };
}

/**
 * Scrapes customer reviews and product details for a Flipkart URL or product ID
 * via the Apify actor `shahidirfan/flipkart-reviews-scraper` or `apt_marble/flipkart-product-reviews-scraper`.
 */
export async function scrapeFlipkartReviews(
  targetUrl: string,
  productId: string
): Promise<ApifyAmazonScrapeResult> {
  const token = process.env.APIFY_API_TOKEN;

  if (!token || !token.trim()) {
    const error: CustomError = new Error(
      'APIFY_API_TOKEN environment variable is not configured. Please configure your Apify API token.'
    );
    error.statusCode = 500;
    throw error;
  }

  console.log(`[Apify] Starting Flipkart review extraction`);
  console.log(`[Apify] Product ID / Slug: ${productId}`);

  const client = new ApifyClient({ token: token.trim() });

  // Input schema matching shahidirfan/flipkart-reviews-scraper actor
  const input = {
    startUrl: targetUrl,
    startUrls: [{ url: targetUrl }],
    results_wanted: 10,
    max_pages: 5,
    proxyConfiguration: { useApifyProxy: false },
  };

  let run;
  try {
    run = await client.actor('shahidirfan/flipkart-reviews-scraper').call(input, {
      waitSecs: 90,
      log: null,
    });
  } catch (err: any) {
    console.error('[Apify] Flipkart Actor execution error:', err?.message || err);
    const error: CustomError = new Error(`Flipkart review scraper request failed: ${err?.message || 'Actor execution failure'}`);
    error.statusCode = 502;
    throw error;
  }

  if (!run || !run.defaultDatasetId) {
    const error: CustomError = new Error('Apify actor finished without creating a valid dataset.');
    error.statusCode = 502;
    throw error;
  }

  let items: any[] = [];
  try {
    const dataset = await client.dataset(run.defaultDatasetId).listItems();
    items = dataset.items || [];
  } catch (datasetErr: any) {
    console.error('[Apify] Failed to fetch Flipkart dataset items:', datasetErr?.message || datasetErr);
    const error: CustomError = new Error('Failed to retrieve scraped data records from Apify dataset.');
    error.statusCode = 502;
    throw error;
  }

  console.log(`[Apify] Total items in Flipkart dataset: ${items.length}`);

  let productRecord: any = null;
  const validReviews: ScrapedAmazonReview[] = [];

  for (const item of items) {
    if (!productRecord && (item.product_title || item.title || item.productName || item.product_name)) {
      productRecord = item;
    }

    const reviewText = (item.review_text || item.text || item.reviewText || item.reviewBody || item.comment || '').trim();
    if (!reviewText) continue;

    let ratingNumber = 4;
    const rawRating = item.rating || item.stars || item.review_rating;
    if (typeof rawRating === 'number') {
      ratingNumber = Math.min(Math.max(Math.round(rawRating), 1), 5);
    } else if (rawRating) {
      const parsed = parseInt(String(rawRating).replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) ratingNumber = parsed;
    }

    const reviewId =
      item.review_id ||
      item.reviewId ||
      item.id ||
      `FK_${productId}_${validReviews.length + 1}`;

    const author = (item.author || item.reviewer_name || item.name || item.customer_name || 'Flipkart Customer').trim();
    const title = (item.review_title || item.title || item.headline || '').trim();
    const date = item.date || item.review_date || item.created_at || 'Recent';
    const verified = item.verified_purchase !== false;

    validReviews.push({
      reviewId,
      rating: ratingNumber,
      title,
      text: reviewText,
      author,
      date,
      verifiedPurchase: verified,
      helpfulVotes: typeof item.helpful_count === 'number' ? item.helpful_count : 0,
      source: 'flipkart',
      platform: 'flipkart',
      reviewText,
      authorName: author,
    });
  }

  if (items.length === 0 && !productRecord) {
    const error: CustomError = new Error(
      `No product details or reviews found on Flipkart for ${productId}. Please check the product URL or try an Amazon URL.`
    );
    error.statusCode = 404;
    throw error;
  }

  let priceNumber = 0;
  if (typeof productRecord?.price === 'number') {
    priceNumber = productRecord.price;
  } else if (productRecord?.price) {
    const parsed = parseFloat(String(productRecord.price).replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) priceNumber = parsed;
  }

  const normalizedProduct: ScrapedAmazonProduct = {
    asin: productId,
    name: productRecord?.product_title || productRecord?.title || productRecord?.productName || `Flipkart Product (${productId})`,
    brand: productRecord?.brand || 'Flipkart',
    price: priceNumber,
    currency: 'INR',
    rating: typeof productRecord?.rating === 'number' ? productRecord.rating : 4.0,
    ratingsCount: typeof productRecord?.ratings_count === 'number' ? productRecord.ratings_count : 100,
    image: productRecord?.image || productRecord?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    url: targetUrl,
    availability: productRecord?.availability || 'In Stock',
  };

  return {
    success: true,
    source: 'flipkart',
    product: normalizedProduct,
    reviews: validReviews,
    reviewCount: validReviews.length,
  };
}

