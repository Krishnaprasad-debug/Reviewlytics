import {
  Product,
  Review,
  ProductSummary,
  DashboardAnalyticsData,
  ProductComparisonResponse,
  AspectSentiment,
  User,
} from '../types/index.js';

export interface DemoProductItem {
  id: string;
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  averageRating: number;
  reviewCount: number;
  totalReviews: number;
  image: string;
  source: string;
  description: string;
  analyzedReviews: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
    mixed?: number;
  };
  sentimentStats: {
    analyzed: number;
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
    positivePercent: number;
    neutralPercent: number;
    negativePercent: number;
    suspiciousCount: number;
  };
  ratingDistribution: {
    star: string;
    rating: number;
    count: number;
    percentage: number;
  }[];
  aspectBreakdown: {
    name: string;
    aspect: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
    score: number;
    reviewCount: number;
    mentions: number;
    positivePercentage: number;
    negativePercentage: number;
  }[];
  topPros: string[];
  topCons: string[];
  topKeywords: { keyword: string; count: number }[];
  overallSummary: string;
  executiveSummary: string;
  keyObservations: string[];
  suspiciousCount: number;
  summary: ProductSummary;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const DEMO_USER: User = {
  _id: 'user-krishna-sharma',
  name: 'Krishna Sharma',
  email: 'skpkrishna25@gmail.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  createdAt: '2025-01-15T09:00:00.000Z',
  updatedAt: '2026-09-25T00:00:00.000Z',
  settings: {
    theme: 'dark',
    emailNotifications: true,
    autoAnalyzeReviews: true,
    aiTemperature: 0.2,
  },
};

export const DEMO_PRODUCTS: DemoProductItem[] = [
  // 1. Apple MacBook Pro 16" M3 Max
  {
    id: 'prod-macbook-pro-16',
    _id: 'prod-macbook-pro-16',
    name: 'Apple MacBook Pro 16" M3 Max (36GB Unified RAM)',
    brand: 'Apple',
    category: 'Computers',
    price: 3499.0,
    rating: 4.8,
    averageRating: 4.8,
    reviewCount: 4210,
    totalReviews: 4210,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    source: 'Amazon',
    description: 'Supercharged by M3 Max chip with 14-core CPU, 30-core GPU, Liquid Retina XDR display, hardware ray-tracing, and up to 22 hours battery.',
    analyzedReviews: 250,
    sentimentBreakdown: {
      positive: 78,
      neutral: 14,
      negative: 8,
      mixed: 0,
    },
    sentimentStats: {
      analyzed: 250,
      positive: 195,
      neutral: 35,
      negative: 20,
      mixed: 0,
      positivePercent: 78,
      neutralPercent: 14,
      negativePercent: 8,
      suspiciousCount: 4,
    },
    ratingDistribution: [
      { star: '5 Stars', rating: 5, count: 145, percentage: 58 },
      { star: '4 Stars', rating: 4, count: 65, percentage: 26 },
      { star: '3 Stars', rating: 3, count: 25, percentage: 10 },
      { star: '2 Stars', rating: 2, count: 10, percentage: 4 },
      { star: '1 Star', rating: 1, count: 5, percentage: 2 },
    ],
    aspectBreakdown: [
      {
        name: 'Performance',
        aspect: 'Performance',
        sentiment: 'Positive',
        score: 0.96,
        reviewCount: 92,
        mentions: 92,
        positivePercentage: 96,
        negativePercentage: 4,
      },
      {
        name: 'Display',
        aspect: 'Display',
        sentiment: 'Positive',
        score: 0.94,
        reviewCount: 84,
        mentions: 84,
        positivePercentage: 94,
        negativePercentage: 6,
      },
      {
        name: 'Battery',
        aspect: 'Battery',
        sentiment: 'Positive',
        score: 0.91,
        reviewCount: 78,
        mentions: 78,
        positivePercentage: 91,
        negativePercentage: 9,
      },
      {
        name: 'Build Quality',
        aspect: 'Build Quality',
        sentiment: 'Positive',
        score: 0.93,
        reviewCount: 65,
        mentions: 65,
        positivePercentage: 93,
        negativePercentage: 7,
      },
      {
        name: 'Price',
        aspect: 'Price',
        sentiment: 'Negative',
        score: -0.45,
        reviewCount: 54,
        mentions: 54,
        positivePercentage: 35,
        negativePercentage: 65,
      },
      {
        name: 'Portability',
        aspect: 'Portability',
        sentiment: 'Neutral',
        score: 0.2,
        reviewCount: 38,
        mentions: 38,
        positivePercentage: 60,
        negativePercentage: 40,
      },
    ],
    topPros: [
      'Exceptional M3 Max computational speed for 4K/8K rendering and software development',
      'Gorgeous Liquid Retina XDR screen with incredible HDR contrast and brightness',
      'Class-leading 22-hour real world battery life with quiet thermal management',
      'Solid unibody aluminum chassis, excellent trackpad, and clear studio speaker system',
    ],
    topCons: [
      'Very high price tag, especially for additional unified memory configurations',
      'Noticeably heavy carry weight for frequent daily travel',
      'Non-upgradable unified memory and internal SSD storage',
    ],
    topKeywords: [
      { keyword: 'Performance', count: 92 },
      { keyword: 'Display', count: 84 },
      { keyword: 'Battery', count: 78 },
      { keyword: 'Build Quality', count: 65 },
      { keyword: 'Speed', count: 58 },
      { keyword: 'Price', count: 54 },
      { keyword: 'Thermals', count: 42 },
      { keyword: 'Speakers', count: 31 },
    ],
    overallSummary:
      'Customers overwhelmingly praise the MacBook Pro 16" for its extraordinary computational speed with the M3 Max chip, vivid Liquid Retina XDR screen, and phenomenal battery longevity. Thermal performance remains virtually silent under heavy rendering loads. The primary complaint remains the steep retail price and soldered non-upgradable memory.',
    executiveSummary:
      'Industry-leading workstation laptop designed for professionals with unmatched power-per-watt efficiency, outstanding build craftsmanship, and best-in-class display fidelity.',
    keyObservations: [
      'Performance receives near-unanimous 5-star acclaim from software engineers and video creators.',
      'Display dynamic range and 120Hz ProMotion deliver top-tier visual accuracy for photo and color grading.',
      'Battery endurance consistently outclasses comparable desktop-class Windows machines.',
      'High starting price point is the single most frequent criticism in negative reviews.',
    ],
    suspiciousCount: 4,
    summary: {
      _id: 'sum-macbook-pro-16',
      productId: 'prod-macbook-pro-16',
      overallSummary:
        'Customers overwhelmingly praise the MacBook Pro 16" for its extraordinary computational speed with the M3 Max chip, vivid Liquid Retina XDR screen, and phenomenal battery longevity. Thermal performance remains virtually silent under heavy rendering loads. The primary complaint remains the steep retail price and soldered non-upgradable memory.',
      executiveSummary:
        'Industry-leading workstation laptop designed for professionals with unmatched power-per-watt efficiency, outstanding build craftsmanship, and best-in-class display fidelity.',
      recommendation:
        'Highly recommended for software developers, video editors, and audio engineers who require workstation-level performance on battery power without thermal throttling.',
      sentimentScore: 0.82,
      positiveHighlights: [
        'Unrivaled processing power with the 14-core CPU and 30-core GPU M3 Max architecture',
        'Stunning 1600-nit peak HDR Liquid Retina XDR display with ProMotion 120Hz',
        'Consistent 18 to 22 hour battery runtime under real-world developer workflows',
        'Immersive six-speaker spatial audio system with force-cancelling woofers',
      ],
      negativeHighlights: [
        'Steep retail price tag makes it a significant capital investment',
        'At 4.7 pounds, it is heavier than thin-and-light ultrabooks',
        'Unified memory cannot be upgraded after purchase',
      ],
      keyObservations: [
        'Performance receives near-unanimous 5-star acclaim from software engineers and video creators.',
        'Display dynamic range and 120Hz ProMotion deliver top-tier visual accuracy for photo and color grading.',
        'Battery endurance consistently outclasses comparable desktop-class Windows machines.',
        'High starting price point is the single most frequent criticism in negative reviews.',
      ],
      topPros: [
        { text: 'Unbeatable M3 Max CPU and GPU computing power', count: 92 },
        { text: 'Gorgeous Liquid Retina XDR panel with true blacks', count: 84 },
        { text: 'Class-leading all-day battery efficiency', count: 78 },
      ],
      topCons: [
        { text: 'High pricing for base and upgraded configurations', count: 54 },
        { text: 'Substantial weight when commuting', count: 32 },
      ],
      topKeywords: [
        { keyword: 'Performance', count: 92 },
        { keyword: 'Display', count: 84 },
        { keyword: 'Battery', count: 78 },
        { keyword: 'Speed', count: 58 },
      ],
      sentimentBreakdown: {
        positive: 78,
        neutral: 14,
        negative: 8,
        mixed: 0,
      },
      suspiciousCount: 4,
      totalAnalyzed: 250,
      averageRating: 4.8,
      createdAt: '2025-01-18T14:15:00.000Z',
      updatedAt: '2026-09-25T00:00:00.000Z',
    },
    createdBy: 'user-krishna-sharma',
    createdAt: '2025-01-18T14:15:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
  },

  // 2. Samsung Galaxy S24 Ultra
  {
    id: 'prod-galaxy-s24-ultra',
    _id: 'prod-galaxy-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra 512GB Titanium',
    brand: 'Samsung',
    category: 'Smartphones',
    price: 1299.99,
    rating: 4.6,
    averageRating: 4.6,
    reviewCount: 12482,
    totalReviews: 12482,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    source: 'Amazon',
    description: 'Galaxy AI powered flagship phone with 200MP camera, Snapdragon 8 Gen 3 processor, flat titanium display, and built-in S Pen stylus.',
    analyzedReviews: 240,
    sentimentBreakdown: {
      positive: 72,
      neutral: 18,
      negative: 10,
      mixed: 0,
    },
    sentimentStats: {
      analyzed: 240,
      positive: 173,
      neutral: 43,
      negative: 24,
      mixed: 0,
      positivePercent: 72,
      neutralPercent: 18,
      negativePercent: 10,
      suspiciousCount: 8,
    },
    ratingDistribution: [
      { star: '5 Stars', rating: 5, count: 120, percentage: 50 },
      { star: '4 Stars', rating: 4, count: 80, percentage: 33 },
      { star: '3 Stars', rating: 3, count: 24, percentage: 10 },
      { star: '2 Stars', rating: 2, count: 10, percentage: 4 },
      { star: '1 Star', rating: 1, count: 6, percentage: 3 },
    ],
    aspectBreakdown: [
      {
        name: 'Display',
        aspect: 'Display',
        sentiment: 'Positive',
        score: 0.95,
        reviewCount: 110,
        mentions: 110,
        positivePercentage: 95,
        negativePercentage: 5,
      },
      {
        name: 'Camera',
        aspect: 'Camera',
        sentiment: 'Positive',
        score: 0.91,
        reviewCount: 98,
        mentions: 98,
        positivePercentage: 91,
        negativePercentage: 9,
      },
      {
        name: 'Performance',
        aspect: 'Performance',
        sentiment: 'Positive',
        score: 0.93,
        reviewCount: 86,
        mentions: 86,
        positivePercentage: 93,
        negativePercentage: 7,
      },
      {
        name: 'Battery',
        aspect: 'Battery',
        sentiment: 'Positive',
        score: 0.85,
        reviewCount: 75,
        mentions: 75,
        positivePercentage: 85,
        negativePercentage: 15,
      },
      {
        name: 'Price',
        aspect: 'Price',
        sentiment: 'Negative',
        score: -0.48,
        reviewCount: 64,
        mentions: 64,
        positivePercentage: 32,
        negativePercentage: 68,
      },
      {
        name: 'Design',
        aspect: 'Design',
        sentiment: 'Positive',
        score: 0.88,
        reviewCount: 52,
        mentions: 52,
        positivePercentage: 88,
        negativePercentage: 12,
      },
    ],
    topPros: [
      'Incredible flat anti-reflective AMOLED display with superior outdoor sunlight legibility',
      'Versatile 200MP camera system with sharp 5x optical telephoto and nightography',
      'Lightning-fast Snapdragon 8 Gen 3 gaming and productivity multitasking',
      'Durable titanium frame and built-in S Pen stylus utility',
    ],
    topCons: [
      'High flagship launch price tag',
      '45W wired charging is slower than competing flagship competitors',
      'Large square corners make single-handed reach slightly challenging',
    ],
    topKeywords: [
      { keyword: 'Display', count: 110 },
      { keyword: 'Camera', count: 98 },
      { keyword: 'Performance', count: 86 },
      { keyword: 'Battery', count: 75 },
      { keyword: 'Price', count: 64 },
      { keyword: 'Design', count: 52 },
      { keyword: 'S Pen', count: 44 },
      { keyword: 'Zoom', count: 38 },
    ],
    overallSummary:
      'Customers generally appreciate the Galaxy S24 Ultra for its class-leading anti-reflective display, sharp 200MP camera system, and snappy Snapdragon 8 Gen 3 performance. The flat titanium frame and integrated S Pen are strong selling points. Negative feedback centers on premium pricing, bulky form factor, and moderate 45W charging speeds.',
    executiveSummary:
      'A true all-around flagship phone that excels in outdoor screen visibility, zoom photography, and hardware longevity.',
    keyObservations: [
      'Anti-reflective Gorilla Armor glass receives glowing praise for eliminating indoor and outdoor glare.',
      'Camera zoom consistency and natural skin tone processing mark a significant upgrade over previous generations.',
      'Battery comfortably provides 7-9 hours of active screen-on time.',
      'Ergonomics and pricing are the primary detractors noted by reviewers.',
    ],
    suspiciousCount: 8,
    summary: {
      _id: 'sum-galaxy-s24-ultra',
      productId: 'prod-galaxy-s24-ultra',
      overallSummary:
        'Customers generally appreciate the Galaxy S24 Ultra for its class-leading anti-reflective display, sharp 200MP camera system, and snappy Snapdragon 8 Gen 3 performance. The flat titanium frame and integrated S Pen are strong selling points. Negative feedback centers on premium pricing, bulky form factor, and moderate 45W charging speeds.',
      executiveSummary:
        'A true all-around flagship phone that excels in outdoor screen visibility, zoom photography, and hardware longevity.',
      recommendation:
        'The best comprehensive Android flagship for mobile photography enthusiasts, digital note-takers, and power users wanting maximum display brightness.',
      sentimentScore: 0.74,
      positiveHighlights: [
        'Anti-reflective Gorilla Armor glass practically eliminates glare outdoors',
        'Sharp 200MP main camera with 5x optical telephoto lens',
        'Top-tier Snapdragon 8 Gen 3 performance with vapor chamber cooling',
        'Integrated S Pen and 7 years of committed Android OS updates',
      ],
      negativeHighlights: [
        'High price starting at $1,299',
        'Max 45W charging speed trails behind competitors',
        'Sharp square corners can feel bulky in tighter pockets',
      ],
      keyObservations: [
        'Anti-reflective Gorilla Armor glass receives glowing praise for eliminating indoor and outdoor glare.',
        'Camera zoom consistency and natural skin tone processing mark a significant upgrade over previous generations.',
        'Battery comfortably provides 7-9 hours of active screen-on time.',
        'Ergonomics and pricing are the primary detractors noted by reviewers.',
      ],
      topPros: [
        { text: 'Anti-reflective flat AMOLED screen is the best in the market', count: 110 },
        { text: 'Camera versatility from ultrawide to 100x space zoom', count: 98 },
        { text: 'Snappy Snapdragon 8 Gen 3 processing speed', count: 86 },
      ],
      topCons: [
        { text: 'High flagship retail price tag', count: 64 },
        { text: 'Wired 45W charging takes over an hour for full top-up', count: 42 },
      ],
      topKeywords: [
        { keyword: 'Display', count: 110 },
        { keyword: 'Camera', count: 98 },
        { keyword: 'Performance', count: 86 },
        { keyword: 'Battery', count: 75 },
      ],
      sentimentBreakdown: {
        positive: 72,
        neutral: 18,
        negative: 10,
        mixed: 0,
      },
      suspiciousCount: 8,
      totalAnalyzed: 240,
      averageRating: 4.6,
      createdAt: '2025-01-16T11:30:00.000Z',
      updatedAt: '2026-09-25T00:00:00.000Z',
    },
    createdBy: 'user-krishna-sharma',
    createdAt: '2025-01-16T11:30:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
  },

  // 3. Sony WH-1000XM5
  {
    id: 'prod-sony-wh1000xm5',
    _id: 'prod-sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Noise-Canceling Headphones',
    brand: 'Sony',
    category: 'Audio',
    price: 398.0,
    rating: 4.7,
    averageRating: 4.7,
    reviewCount: 18240,
    totalReviews: 18240,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    source: 'Amazon',
    description: 'Industry-leading noise canceling with Auto NC Optimizer, 8 microphones with 2 processors, crystal clear hands-free calling, and 30-hour battery life.',
    analyzedReviews: 260,
    sentimentBreakdown: {
      positive: 82,
      neutral: 12,
      negative: 6,
      mixed: 0,
    },
    sentimentStats: {
      analyzed: 260,
      positive: 213,
      neutral: 31,
      negative: 16,
      mixed: 0,
      positivePercent: 82,
      neutralPercent: 12,
      negativePercent: 6,
      suspiciousCount: 3,
    },
    ratingDistribution: [
      { star: '5 Stars', rating: 5, count: 160, percentage: 62 },
      { star: '4 Stars', rating: 4, count: 68, percentage: 26 },
      { star: '3 Stars', rating: 3, count: 18, percentage: 7 },
      { star: '2 Stars', rating: 2, count: 9, percentage: 3 },
      { star: '1 Star', rating: 1, count: 5, percentage: 2 },
    ],
    aspectBreakdown: [
      {
        name: 'Noise Cancellation',
        aspect: 'Noise Cancellation',
        sentiment: 'Positive',
        score: 0.98,
        reviewCount: 142,
        mentions: 142,
        positivePercentage: 98,
        negativePercentage: 2,
      },
      {
        name: 'Audio Quality',
        aspect: 'Audio Quality',
        sentiment: 'Positive',
        score: 0.92,
        reviewCount: 128,
        mentions: 128,
        positivePercentage: 92,
        negativePercentage: 8,
      },
      {
        name: 'Battery',
        aspect: 'Battery',
        sentiment: 'Positive',
        score: 0.94,
        reviewCount: 105,
        mentions: 105,
        positivePercentage: 94,
        negativePercentage: 6,
      },
      {
        name: 'Comfort',
        aspect: 'Comfort',
        sentiment: 'Positive',
        score: 0.86,
        reviewCount: 92,
        mentions: 92,
        positivePercentage: 86,
        negativePercentage: 14,
      },
      {
        name: 'Microphone & Calls',
        aspect: 'Microphone & Calls',
        sentiment: 'Positive',
        score: 0.89,
        reviewCount: 76,
        mentions: 76,
        positivePercentage: 89,
        negativePercentage: 11,
      },
      {
        name: 'Portability & Case',
        aspect: 'Portability',
        sentiment: 'Negative',
        score: -0.38,
        reviewCount: 65,
        mentions: 65,
        positivePercentage: 42,
        negativePercentage: 58,
      },
    ],
    topPros: [
      'Unsurpassed active noise cancellation that silences airplane hum and office chatter',
      'Crisp, detailed sound profile with warm punchy bass and LDAC codec support',
      'Dependable 30-hour battery life with fast 3-minute charge for 3 hours of playback',
      'Significantly improved microphone background noise reduction for work conference calls',
    ],
    topCons: [
      'Headband does not fold into a compact hinge footprint unlike the predecessor XM4',
      'Carrying case is larger and occupies more backpack space',
      'Slightly looser clamping force during physical workout activity',
    ],
    topKeywords: [
      { keyword: 'Noise Cancellation', count: 142 },
      { keyword: 'Sound Quality', count: 128 },
      { keyword: 'Battery Life', count: 105 },
      { keyword: 'Comfort', count: 92 },
      { keyword: 'Microphone', count: 76 },
      { keyword: 'Case', count: 65 },
      { keyword: 'Bass', count: 54 },
      { keyword: 'Bluetooth', count: 48 },
    ],
    overallSummary:
      'Customers overwhelmingly praise the Sony WH-1000XM5 for its benchmark active noise cancellation, balanced soundstage, and crystal-clear voice call pickup. The 30-hour battery life and soft leather ear cushions make it ideal for long flights. Minor criticisms focus on the non-collapsible headband and larger carrying case.',
    executiveSummary:
      'The definitive active noise-cancelling wireless headphones for commuters, remote corporate professionals, and frequent flyers.',
    keyObservations: [
      'Active Noise Cancellation is universally recognized as the market benchmark.',
      'Call quality represents a drastic leap forward with beamforming microphone processing.',
      'Battery performance easily exceeds advertised figures under mixed ANC usage.',
      'Inability to fold the earcups inward is the single most frequent buyer gripe.',
    ],
    suspiciousCount: 3,
    summary: {
      _id: 'sum-sony-wh1000xm5',
      productId: 'prod-sony-wh1000xm5',
      overallSummary:
        'Customers overwhelmingly praise the Sony WH-1000XM5 for its benchmark active noise cancellation, balanced soundstage, and crystal-clear voice call pickup. The 30-hour battery life and soft leather ear cushions make it ideal for long flights. Minor criticisms focus on the non-collapsible headband and larger carrying case.',
      executiveSummary:
        'The definitive active noise-cancelling wireless headphones for commuters, remote corporate professionals, and frequent flyers.',
      recommendation:
        'Must-buy choice for frequent travelers, open-office employees, and audio lovers seeking maximum acoustic isolation.',
      sentimentScore: 0.85,
      positiveHighlights: [
        'Industry-leading active noise cancellation powered by Auto NC Optimizer',
        'Refined high-resolution audio with 30mm carbon fiber driver units',
        'Exceptional 30-hour battery life with 3-minute rapid top-up',
        '8-microphone array completely isolates your voice on Zoom and cellular calls',
      ],
      negativeHighlights: [
        'Earcups swivel flat but headband does not collapse inward',
        'Included protective travel case is bulkier than previous generation',
        'Premium price point compared to older XM4 models',
      ],
      keyObservations: [
        'Active Noise Cancellation is universally recognized as the market benchmark.',
        'Call quality represents a drastic leap forward with beamforming microphone processing.',
        'Battery performance easily exceeds advertised figures under mixed ANC usage.',
        'Inability to fold the earcups inward is the single most frequent buyer gripe.',
      ],
      topPros: [
        { text: 'Unmatched active noise cancellation isolation', count: 142 },
        { text: 'Refined sound with punchy bass and expansive mids', count: 128 },
        { text: 'Exceptional 30-hour battery life with fast charging', count: 105 },
      ],
      topCons: [
        { text: 'Non-folding headband makes travel case bulkier', count: 65 },
        { text: 'Slightly loose tension during brisk running', count: 28 },
      ],
      topKeywords: [
        { keyword: 'Noise Cancellation', count: 142 },
        { keyword: 'Sound Quality', count: 128 },
        { keyword: 'Battery Life', count: 105 },
        { keyword: 'Comfort', count: 92 },
      ],
      sentimentBreakdown: {
        positive: 82,
        neutral: 12,
        negative: 6,
        mixed: 0,
      },
      suspiciousCount: 3,
      totalAnalyzed: 260,
      averageRating: 4.7,
      createdAt: '2025-01-15T09:00:00.000Z',
      updatedAt: '2026-09-25T00:00:00.000Z',
    },
    createdBy: 'user-krishna-sharma',
    createdAt: '2025-01-15T09:00:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
  },

  // 4. Garmin Fenix 7X Sapphire Solar
  {
    id: 'prod-garmin-fenix-7x',
    _id: 'prod-garmin-fenix-7x',
    name: 'Garmin Fenix 7X Sapphire Solar Multisport Watch',
    brand: 'Garmin',
    category: 'Wearables',
    price: 899.99,
    rating: 4.7,
    averageRating: 4.7,
    reviewCount: 6450,
    totalReviews: 6450,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    source: 'Amazon',
    description: 'Rugged GPS smartwatch with Power Sapphire solar charging lens, built-in LED flashlight, multi-band GNSS, preloaded TopoActive maps, and up to 37 days battery.',
    analyzedReviews: 220,
    sentimentBreakdown: {
      positive: 79,
      neutral: 15,
      negative: 6,
      mixed: 0,
    },
    sentimentStats: {
      analyzed: 220,
      positive: 174,
      neutral: 33,
      negative: 13,
      mixed: 0,
      positivePercent: 79,
      neutralPercent: 15,
      negativePercent: 6,
      suspiciousCount: 2,
    },
    ratingDistribution: [
      { star: '5 Stars', rating: 5, count: 140, percentage: 64 },
      { star: '4 Stars', rating: 4, count: 52, percentage: 24 },
      { star: '3 Stars', rating: 3, count: 18, percentage: 8 },
      { star: '2 Stars', rating: 2, count: 6, percentage: 3 },
      { star: '1 Star', rating: 1, count: 4, percentage: 1 },
    ],
    aspectBreakdown: [
      {
        name: 'Battery Life',
        aspect: 'Battery',
        sentiment: 'Positive',
        score: 0.97,
        reviewCount: 112,
        mentions: 112,
        positivePercentage: 97,
        negativePercentage: 3,
      },
      {
        name: 'GPS Accuracy',
        aspect: 'GPS',
        sentiment: 'Positive',
        score: 0.95,
        reviewCount: 96,
        mentions: 96,
        positivePercentage: 95,
        negativePercentage: 5,
      },
      {
        name: 'Build Quality & Durability',
        aspect: 'Durability',
        sentiment: 'Positive',
        score: 0.94,
        reviewCount: 88,
        mentions: 88,
        positivePercentage: 94,
        negativePercentage: 6,
      },
      {
        name: 'Flashlight Feature',
        aspect: 'Flashlight',
        sentiment: 'Positive',
        score: 0.96,
        reviewCount: 75,
        mentions: 75,
        positivePercentage: 96,
        negativePercentage: 4,
      },
      {
        name: 'Software Learning Curve',
        aspect: 'Interface',
        sentiment: 'Neutral',
        score: 0.25,
        reviewCount: 62,
        mentions: 62,
        positivePercentage: 58,
        negativePercentage: 42,
      },
      {
        name: 'Price Point',
        aspect: 'Price',
        sentiment: 'Negative',
        score: -0.42,
        reviewCount: 48,
        mentions: 48,
        positivePercentage: 36,
        negativePercentage: 64,
      },
    ],
    topPros: [
      'Astounding 28 to 37 days of battery life with solar harvesting glass',
      'Dual-frequency Multi-Band GPS locks satellites instantly in dense forests and canyons',
      'Brilliant integrated LED flashlight is surprisingly useful in daily life and trail runs',
      'Titanium bezel and scratch-resistant Sapphire lens withstand intense outdoor abuse',
    ],
    topCons: [
      'Substantial 51mm watch body is chunky on smaller wrists',
      'Garmin Connect interface has a steep menu learning curve for beginners',
      'Memory-in-Pixel display prioritizes battery and sunlight visibility over vibrant OLED colors',
    ],
    topKeywords: [
      { keyword: 'Battery', count: 112 },
      { keyword: 'GPS', count: 96 },
      { keyword: 'Durability', count: 88 },
      { keyword: 'Flashlight', count: 75 },
      { keyword: 'Hiking', count: 58 },
      { keyword: 'Solar', count: 52 },
      { keyword: 'Price', count: 48 },
      { keyword: 'Mapping', count: 40 },
    ],
    overallSummary:
      'Customers consistently praise the Garmin Fenix 7X Sapphire Solar for its near-immortal battery life, rock-solid multi-band GPS tracking, and indestructible sapphire/titanium construction. The built-in LED flashlight is a beloved standout feature. Primary downsides noted are the hefty 51mm wrist footprint and the complex feature-dense software.',
    executiveSummary:
      'The premier expedition and endurance smartwatch designed for ultramarathoners, mountaineers, and outdoor athletes demanding unrivaled reliability.',
    keyObservations: [
      'Solar battery life allows weeks between wall charges even with continuous daily GPS recording.',
      'Integrated LED flashlight is hailed as an indispensable everyday outdoor tool.',
      'Sapphire screen remains completely unscratched after rock scrambles and trail accidents.',
      'Size and weight make it better suited for medium-to-large wrists.',
    ],
    suspiciousCount: 2,
    summary: {
      _id: 'sum-garmin-fenix-7x',
      productId: 'prod-garmin-fenix-7x',
      overallSummary:
        'Customers consistently praise the Garmin Fenix 7X Sapphire Solar for its near-immortal battery life, rock-solid multi-band GPS tracking, and indestructible sapphire/titanium construction. The built-in LED flashlight is a beloved standout feature. Primary downsides noted are the hefty 51mm wrist footprint and the complex feature-dense software.',
      executiveSummary:
        'The premier expedition and endurance smartwatch designed for ultramarathoners, mountaineers, and outdoor athletes demanding unrivaled reliability.',
      recommendation:
        'Unbeatable choice for hikers, triathletes, and survivalists who prioritize week-long battery endurance and durability over smartwatch app store bells and whistles.',
      sentimentScore: 0.81,
      positiveHighlights: [
        'Multi-week battery longevity with solar harvesting lens',
        'Pinpoint Multi-Band GNSS tracking with preloaded topography maps',
        'Super bright multi-stage LED flashlight built directly into watch casing',
        'Scratch-resistant Sapphire crystal with DLC titanium bezel',
      ],
      negativeHighlights: [
        'Large 51mm case size can feel heavy when sleeping',
        'Garmin Connect ecosystem takes time to configure properly',
        'Transflective display looks muted compared to Apple Watch AMOLED screens',
      ],
      keyObservations: [
        'Solar battery life allows weeks between wall charges even with continuous daily GPS recording.',
        'Integrated LED flashlight is hailed as an indispensable everyday outdoor tool.',
        'Sapphire screen remains completely unscratched after rock scrambles and trail accidents.',
        'Size and weight make it better suited for medium-to-large wrists.',
      ],
      topPros: [
        { text: 'Unrivaled 30+ day battery life with solar charging', count: 112 },
        { text: 'Flawless GPS accuracy on mountain trails and city streets', count: 96 },
        { text: 'Indestructible titanium and sapphire glass construction', count: 88 },
      ],
      topCons: [
        { text: 'Heavy and oversized for smaller wrists', count: 48 },
        { text: 'Steep software settings learning curve', count: 35 },
      ],
      topKeywords: [
        { keyword: 'Battery', count: 112 },
        { keyword: 'GPS', count: 96 },
        { keyword: 'Durability', count: 88 },
        { keyword: 'Flashlight', count: 75 },
      ],
      sentimentBreakdown: {
        positive: 79,
        neutral: 15,
        negative: 6,
        mixed: 0,
      },
      suspiciousCount: 2,
      totalAnalyzed: 220,
      averageRating: 4.7,
      createdAt: '2025-01-20T16:45:00.000Z',
      updatedAt: '2026-09-25T00:00:00.000Z',
    },
    createdBy: 'user-krishna-sharma',
    createdAt: '2025-01-20T16:45:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
  },

  // 5. Breville Barista Express / Touch
  {
    id: 'prod-breville-barista',
    _id: 'prod-breville-barista',
    name: 'Breville Barista Touch Espresso Machine Stainless',
    brand: 'Breville',
    category: 'Appliances',
    price: 999.95,
    rating: 4.5,
    averageRating: 4.5,
    reviewCount: 5120,
    totalReviews: 5120,
    image: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&auto=format&fit=crop&q=80',
    source: 'Amazon',
    description: 'Automated touchscreen bean-to-cup espresso maker with integrated precision conical burr grinder and automatic microfoam milk texturing.',
    analyzedReviews: 210,
    sentimentBreakdown: {
      positive: 74,
      neutral: 17,
      negative: 9,
      mixed: 0,
    },
    sentimentStats: {
      analyzed: 210,
      positive: 155,
      neutral: 36,
      negative: 19,
      mixed: 0,
      positivePercent: 74,
      neutralPercent: 17,
      negativePercent: 9,
      suspiciousCount: 5,
    },
    ratingDistribution: [
      { star: '5 Stars', rating: 5, count: 115, percentage: 55 },
      { star: '4 Stars', rating: 4, count: 62, percentage: 30 },
      { star: '3 Stars', rating: 3, count: 18, percentage: 8 },
      { star: '2 Stars', rating: 2, count: 10, percentage: 5 },
      { star: '1 Star', rating: 1, count: 5, percentage: 2 },
    ],
    aspectBreakdown: [
      {
        name: 'Coffee Quality & Taste',
        aspect: 'Coffee Quality',
        sentiment: 'Positive',
        score: 0.94,
        reviewCount: 96,
        mentions: 96,
        positivePercentage: 94,
        negativePercentage: 6,
      },
      {
        name: 'Milk Texturing',
        aspect: 'Milk Texturing',
        sentiment: 'Positive',
        score: 0.92,
        reviewCount: 88,
        mentions: 88,
        positivePercentage: 92,
        negativePercentage: 8,
      },
      {
        name: 'Ease of Use & Touchscreen',
        aspect: 'Ease of Use',
        sentiment: 'Positive',
        score: 0.88,
        reviewCount: 82,
        mentions: 82,
        positivePercentage: 88,
        negativePercentage: 12,
      },
      {
        name: 'Heat-up Speed',
        aspect: 'Speed',
        sentiment: 'Positive',
        score: 0.95,
        reviewCount: 70,
        mentions: 70,
        positivePercentage: 95,
        negativePercentage: 5,
      },
      {
        name: 'Cleaning & Maintenance',
        aspect: 'Cleaning',
        sentiment: 'Neutral',
        score: 0.22,
        reviewCount: 58,
        mentions: 58,
        positivePercentage: 56,
        negativePercentage: 44,
      },
      {
        name: 'Price & Value',
        aspect: 'Price',
        sentiment: 'Negative',
        score: -0.4,
        reviewCount: 46,
        mentions: 46,
        positivePercentage: 38,
        negativePercentage: 62,
      },
    ],
    topPros: [
      'ThermoJet heating system reaches optimum brewing temperature in an astonishing 3 seconds',
      'Automatic steam wand creates silky cafe-quality microfoam milk for latte art effortlessly',
      'Intuitive color touchscreen simplifies pre-programmed cafe favorites and custom profiles',
      'Integrated hardened stainless steel conical burr grinder ensures fresh bean-to-cup extraction',
    ],
    topCons: [
      'Requires frequent daily drip tray emptying and steam wand wiping maintenance',
      'Water filter replacement and regular descaling cycles add ongoing maintenance steps',
      'Large kitchen counter space footprint',
    ],
    topKeywords: [
      { keyword: 'Coffee Quality', count: 96 },
      { keyword: 'Milk Frother', count: 88 },
      { keyword: 'Touchscreen', count: 82 },
      { keyword: 'Grinder', count: 74 },
      { keyword: 'Heat Speed', count: 70 },
      { keyword: 'Cleaning', count: 58 },
      { keyword: 'Espresso', count: 52 },
      { keyword: 'Price', count: 46 },
    ],
    overallSummary:
      'Customers rave about the Breville Barista Touch for delivering authentic cafe-quality espresso and automatic silky microfoam with foolproof touchscreen guidance. The 3-second ThermoJet heat up time is a favorite morning convenience. Criticisms are limited to frequent drip tray maintenance and regular descaling rituals.',
    executiveSummary:
      'An approachable, high-performance home espresso station bridging the gap between automated pod convenience and manual barista craftsmanship.',
    keyObservations: [
      'Espresso crema consistency and flavor depth rival commercial coffeehouse standards.',
      'Auto-frothing steam wand allows complete beginners to produce professional milk texture.',
      'Three-second ready time eliminates long preheating delays.',
      'Regular cleaning cycles and water tank refills are necessary for optimal longevity.',
    ],
    suspiciousCount: 5,
    summary: {
      _id: 'sum-breville-barista',
      productId: 'prod-breville-barista',
      overallSummary:
        'Customers rave about the Breville Barista Touch for delivering authentic cafe-quality espresso and automatic silky microfoam with foolproof touchscreen guidance. The 3-second ThermoJet heat up time is a favorite morning convenience. Criticisms are limited to frequent drip tray maintenance and regular descaling rituals.',
      executiveSummary:
        'An approachable, high-performance home espresso station bridging the gap between automated pod convenience and manual barista craftsmanship.',
      recommendation:
        'Ideal investment for coffee enthusiasts who want third-wave cafe quality espresso and lattes at home without complex manual barista training.',
      sentimentScore: 0.77,
      positiveHighlights: [
        'ThermoJet 3-second rapid temperature readiness',
        'Automatic steam wand texturing for silky microfoam',
        'Color touchscreen with 8 customizable drink profiles',
        'Built-in precision conical burr grinder with dose control',
      ],
      negativeHighlights: [
        'Drip tray is shallow and fills quickly with auto-purge cycles',
        'Requires regular maintenance and descaling with water filters',
        'Substantial countertop footprint in compact kitchens',
      ],
      keyObservations: [
        'Espresso crema consistency and flavor depth rival commercial coffeehouse standards.',
        'Auto-frothing steam wand allows complete beginners to produce professional milk texture.',
        'Three-second ready time eliminates long preheating delays.',
        'Regular cleaning cycles and water tank refills are necessary for optimal longevity.',
      ],
      topPros: [
        { text: 'Instant 3-second ThermoJet heat-up system', count: 96 },
        { text: 'Automated microfoam steam wand creates cafe quality milk', count: 88 },
        { text: 'Simple touchscreen walkthrough for all drinks', count: 82 },
      ],
      topCons: [
        { text: 'Daily drip tray and wand cleaning required', count: 58 },
        { text: 'Higher upfront price than manual entry machines', count: 46 },
      ],
      topKeywords: [
        { keyword: 'Coffee Quality', count: 96 },
        { keyword: 'Milk Frother', count: 88 },
        { keyword: 'Touchscreen', count: 82 },
        { keyword: 'Grinder', count: 74 },
      ],
      sentimentBreakdown: {
        positive: 74,
        neutral: 17,
        negative: 9,
        mixed: 0,
      },
      suspiciousCount: 5,
      totalAnalyzed: 210,
      averageRating: 4.5,
      createdAt: '2025-01-22T08:20:00.000Z',
      updatedAt: '2026-09-25T00:00:00.000Z',
    },
    createdBy: 'user-krishna-sharma',
    createdAt: '2025-01-22T08:20:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
  },
];

export interface DemoReviewItem extends Review {
  id: string;
  userName: string;
  text: string;
  date: string;
  verified: boolean;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  sentimentScore: number;
  aspects: { aspect: string; sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed'; score: number }[];
  pros: string[];
  cons: string[];
  keywords: string[];
  suspicious: boolean;
  suspiciousScore: number;
  suspiciousReason: string | null;
}

export const DEMO_REVIEWS: DemoReviewItem[] = [
  // 1. MacBook Pro 16 Reviews
  {
    id: 'rev-mbp-01',
    _id: 'rev-mbp-01',
    productId: 'prod-macbook-pro-16',
    productName: 'Apple MacBook Pro 16" M3 Max',
    productBrand: 'Apple',
    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    userName: 'David Miller',
    authorName: 'David Miller',
    rating: 5,
    title: 'An absolute beast for 8K video editing and Docker stacks',
    text: 'I upgraded from an older Intel MacBook Pro and the performance gulf is staggering. Xcode compilations that previously took 8 minutes now finish in under 90 seconds. The Liquid Retina XDR screen is color-accurate right out of the box, and the battery easily lasts a full 14-hour workday without me ever plugging in.',
    reviewText:
      'I upgraded from an older Intel MacBook Pro and the performance gulf is staggering. Xcode compilations that previously took 8 minutes now finish in under 90 seconds. The Liquid Retina XDR screen is color-accurate right out of the box, and the battery easily lasts a full 14-hour workday without me ever plugging in.',
    date: '2025-01-22T10:15:00.000Z',
    createdAt: '2025-01-22T10:15:00.000Z',
    updatedAt: '2025-01-22T10:15:00.000Z',
    source: 'api',
    verified: true,
    verifiedPurchase: true,
    sentiment: 'Positive',
    sentimentScore: 0.98,
    aspects: [
      { aspect: 'Performance', sentiment: 'Positive', score: 0.99 },
      { aspect: 'Display', sentiment: 'Positive', score: 0.96 },
      { aspect: 'Battery', sentiment: 'Positive', score: 0.97 },
    ],
    pros: ['Incredible M3 Max speed', 'Silent fan acoustics', '14+ hour battery'],
    cons: ['Heavy weight'],
    keywords: ['Performance', 'Battery', 'Display', 'Xcode'],
    suspicious: false,
    suspiciousScore: 0.04,
    suspiciousReason: null,
    analysis: {
      _id: 'ana-mbp-01',
      reviewId: 'rev-mbp-01',
      productId: 'prod-macbook-pro-16',
      sentiment: 'Positive',
      confidence: 0.98,
      aspects: [
        { aspect: 'Performance', sentiment: 'Positive', score: 0.99 },
        { aspect: 'Display', sentiment: 'Positive', score: 0.96 },
        { aspect: 'Battery', sentiment: 'Positive', score: 0.97 },
      ],
      pros: ['Incredible M3 Max speed', 'Silent fan acoustics', '14+ hour battery'],
      cons: ['Heavy weight'],
      keywords: ['Performance', 'Battery', 'Display', 'Xcode'],
      suspiciousStatus: 'Genuine',
      suspiciousScore: 0.04,
      createdAt: '2025-01-22T10:15:00.000Z',
      updatedAt: '2025-01-22T10:15:00.000Z',
    },
  },
  {
    id: 'rev-mbp-02',
    _id: 'rev-mbp-02',
    productId: 'prod-macbook-pro-16',
    productName: 'Apple MacBook Pro 16" M3 Max',
    productBrand: 'Apple',
    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    userName: 'Elena Rostova',
    authorName: 'Elena Rostova',
    rating: 4,
    title: 'Top-tier workstation, but very heavy in a backpack',
    text: 'There is no questioning the sheer computational power of the M3 Max chip. Running multiple local LLMs and Blender scenes without frame drops feels like science fiction. However, at nearly 5 pounds, carrying this machine every day along with the charger does strain your shoulder. Also, the base configuration price is steep.',
    reviewText:
      'There is no questioning the sheer computational power of the M3 Max chip. Running multiple local LLMs and Blender scenes without frame drops feels like science fiction. However, at nearly 5 pounds, carrying this machine every day along with the charger does strain your shoulder. Also, the base configuration price is steep.',
    date: '2025-01-25T14:30:00.000Z',
    createdAt: '2025-01-25T14:30:00.000Z',
    updatedAt: '2025-01-25T14:30:00.000Z',
    source: 'api',
    verified: true,
    verifiedPurchase: true,
    sentiment: 'Positive',
    sentimentScore: 0.82,
    aspects: [
      { aspect: 'Performance', sentiment: 'Positive', score: 0.95 },
      { aspect: 'Portability', sentiment: 'Negative', score: -0.65 },
      { aspect: 'Price', sentiment: 'Negative', score: -0.5 },
    ],
    pros: ['Blender and LLM local compute', 'Thermals never overheat'],
    cons: ['Heavy in travel bag', 'High price'],
    keywords: ['Performance', 'Portability', 'Price', 'Blender'],
    suspicious: false,
    suspiciousScore: 0.08,
    suspiciousReason: null,
    analysis: {
      _id: 'ana-mbp-02',
      reviewId: 'rev-mbp-02',
      productId: 'prod-macbook-pro-16',
      sentiment: 'Positive',
      confidence: 0.88,
      aspects: [
        { aspect: 'Performance', sentiment: 'Positive', score: 0.95 },
        { aspect: 'Portability', sentiment: 'Negative', score: -0.65 },
        { aspect: 'Price', sentiment: 'Negative', score: -0.5 },
      ],
      pros: ['Blender and LLM local compute', 'Thermals never overheat'],
      cons: ['Heavy in travel bag', 'High price'],
      keywords: ['Performance', 'Portability', 'Price', 'Blender'],
      suspiciousStatus: 'Genuine',
      suspiciousScore: 0.08,
      createdAt: '2025-01-25T14:30:00.000Z',
      updatedAt: '2025-01-25T14:30:00.000Z',
    },
  },
  {
    id: 'rev-mbp-03',
    _id: 'rev-mbp-03',
    productId: 'prod-macbook-pro-16',
    productName: 'Apple MacBook Pro 16" M3 Max',
    productBrand: 'Apple',
    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    userName: 'TechPromoter_99',
    authorName: 'TechPromoter_99',
    rating: 5,
    title: 'BUY THIS NOW BEST LAPTOP EVER IN HISTORY BUY FAST AMAZING',
    text: 'BEST LAPTOP IN THE WORLD 10/10 BUY TODAY FAST SHIPPING PERFECT PRODUCT AMAZING AMAZING AMAZING NEVER REGRET BUY TODAY CLICK HERE.',
    reviewText:
      'BEST LAPTOP IN THE WORLD 10/10 BUY TODAY FAST SHIPPING PERFECT PRODUCT AMAZING AMAZING AMAZING NEVER REGRET BUY TODAY CLICK HERE.',
    date: '2025-01-28T04:12:00.000Z',
    createdAt: '2025-01-28T04:12:00.000Z',
    updatedAt: '2025-01-28T04:12:00.000Z',
    source: 'manual',
    verified: false,
    verifiedPurchase: false,
    sentiment: 'Positive',
    sentimentScore: 0.99,
    aspects: [{ aspect: 'Quality', sentiment: 'Positive', score: 0.9 }],
    pros: ['Everything'],
    cons: ['None'],
    keywords: ['Best', 'Fast', 'Perfect'],
    suspicious: true,
    suspiciousScore: 0.94,
    suspiciousReason: 'Repetitive superlative marketing phrasing with unverified purchase and spam patterns.',
    analysis: {
      _id: 'ana-mbp-03',
      reviewId: 'rev-mbp-03',
      productId: 'prod-macbook-pro-16',
      sentiment: 'Positive',
      confidence: 0.92,
      aspects: [{ aspect: 'Quality', sentiment: 'Positive', score: 0.9 }],
      pros: ['Everything'],
      cons: ['None'],
      keywords: ['Best', 'Fast', 'Perfect'],
      suspiciousStatus: 'Suspicious',
      suspiciousScore: 0.94,
      suspiciousReason: 'Repetitive superlative marketing phrasing with unverified purchase and spam patterns.',
      createdAt: '2025-01-28T04:12:00.000Z',
      updatedAt: '2025-01-28T04:12:00.000Z',
    },
  },

  // 2. Samsung Galaxy S24 Ultra Reviews
  {
    id: 'rev-s24-01',
    _id: 'rev-s24-01',
    productId: 'prod-galaxy-s24-ultra',
    productName: 'Samsung Galaxy S24 Ultra 512GB',
    productBrand: 'Samsung',
    productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    userName: 'Marcus Vance',
    authorName: 'Marcus Vance',
    rating: 5,
    title: 'The anti-glare display is a game changer in direct sunlight',
    text: 'I was skeptical about Samsung switching to a flat screen, but the Gorilla Armor anti-reflective coating is genuinely revolutionary. I can read emails at noon on the beach without cupping my hand. The battery lasts through a full day of navigation and photos with 35% remaining at bedtime.',
    reviewText:
      'I was skeptical about Samsung switching to a flat screen, but the Gorilla Armor anti-reflective coating is genuinely revolutionary. I can read emails at noon on the beach without cupping my hand. The battery lasts through a full day of navigation and photos with 35% remaining at bedtime.',
    date: '2025-01-23T11:45:00.000Z',
    createdAt: '2025-01-23T11:45:00.000Z',
    updatedAt: '2025-01-23T11:45:00.000Z',
    source: 'api',
    verified: true,
    verifiedPurchase: true,
    sentiment: 'Positive',
    sentimentScore: 0.94,
    aspects: [
      { aspect: 'Display', sentiment: 'Positive', score: 0.98 },
      { aspect: 'Battery', sentiment: 'Positive', score: 0.91 },
    ],
    pros: ['Zero glare screen', 'Excellent battery life', 'S Pen convenience'],
    cons: ['Expensive'],
    keywords: ['Display', 'Battery', 'Screen', 'S Pen'],
    suspicious: false,
    suspiciousScore: 0.05,
    suspiciousReason: null,
    analysis: {
      _id: 'ana-s24-01',
      reviewId: 'rev-s24-01',
      productId: 'prod-galaxy-s24-ultra',
      sentiment: 'Positive',
      confidence: 0.96,
      aspects: [
        { aspect: 'Display', sentiment: 'Positive', score: 0.98 },
        { aspect: 'Battery', sentiment: 'Positive', score: 0.91 },
      ],
      pros: ['Zero glare screen', 'Excellent battery life', 'S Pen convenience'],
      cons: ['Expensive'],
      keywords: ['Display', 'Battery', 'Screen', 'S Pen'],
      suspiciousStatus: 'Genuine',
      suspiciousScore: 0.05,
      createdAt: '2025-01-23T11:45:00.000Z',
      updatedAt: '2025-01-23T11:45:00.000Z',
    },
  },
  {
    id: 'rev-s24-02',
    _id: 'rev-s24-02',
    productId: 'prod-galaxy-s24-ultra',
    productName: 'Samsung Galaxy S24 Ultra 512GB',
    productBrand: 'Samsung',
    productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    userName: 'Samantha Lee',
    authorName: 'Samantha Lee',
    rating: 3,
    title: 'Outstanding camera, but 45W charging is dated in 2025',
    text: 'The 200MP sensor and new 5x telephoto produce crisp portraits and concert videos. However, at $1,300, Samsung still limiting charging to 45W while rivals offer 80W+ is disappointing. It takes over an hour to reach 100%. The phone is also quite sharp and heavy in smaller hands.',
    reviewText:
      'The 200MP sensor and new 5x telephoto produce crisp portraits and concert videos. However, at $1,300, Samsung still limiting charging to 45W while rivals offer 80W+ is disappointing. It takes over an hour to reach 100%. The phone is also quite sharp and heavy in smaller hands.',
    date: '2025-01-26T09:20:00.000Z',
    createdAt: '2025-01-26T09:20:00.000Z',
    updatedAt: '2025-01-26T09:20:00.000Z',
    source: 'api',
    verified: true,
    verifiedPurchase: true,
    sentiment: 'Neutral',
    sentimentScore: 0.52,
    aspects: [
      { aspect: 'Camera', sentiment: 'Positive', score: 0.92 },
      { aspect: 'Charging', sentiment: 'Negative', score: -0.7 },
      { aspect: 'Price', sentiment: 'Negative', score: -0.45 },
    ],
    pros: ['Crisp 200MP camera', 'Sharp optical zoom'],
    cons: ['45W slow charging', 'Heavier in hand'],
    keywords: ['Camera', 'Charging', 'Price', 'Heavy'],
    suspicious: false,
    suspiciousScore: 0.06,
    suspiciousReason: null,
    analysis: {
      _id: 'ana-s24-02',
      reviewId: 'rev-s24-02',
      productId: 'prod-galaxy-s24-ultra',
      sentiment: 'Neutral',
      confidence: 0.84,
      aspects: [
        { aspect: 'Camera', sentiment: 'Positive', score: 0.92 },
        { aspect: 'Charging', sentiment: 'Negative', score: -0.7 },
        { aspect: 'Price', sentiment: 'Negative', score: -0.45 },
      ],
      pros: ['Crisp 200MP camera', 'Sharp optical zoom'],
      cons: ['45W slow charging', 'Heavier in hand'],
      keywords: ['Camera', 'Charging', 'Price', 'Heavy'],
      suspiciousStatus: 'Genuine',
      suspiciousScore: 0.06,
      createdAt: '2025-01-26T09:20:00.000Z',
      updatedAt: '2025-01-26T09:20:00.000Z',
    },
  },

  // 3. Sony WH-1000XM5 Reviews
  {
    id: 'rev-xm5-01',
    _id: 'rev-xm5-01',
    productId: 'prod-sony-wh1000xm5',
    productName: 'Sony WH-1000XM5 Headphones',
    productBrand: 'Sony',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    userName: 'Jonathan Brooks',
    authorName: 'Jonathan Brooks',
    rating: 5,
    title: 'The gold standard for transcontinental flights and busy offices',
    text: 'I commute on the train daily and fly cross-country twice a month. The XM5 noise cancellation completely silences jet engines and coffee shop rumble. Battery life is stellar—I charged it once over a three-week period. The microphones are vastly better than the XM4 for Microsoft Teams calls.',
    reviewText:
      'I commute on the train daily and fly cross-country twice a month. The XM5 noise cancellation completely silences jet engines and coffee shop rumble. Battery life is stellar—I charged it once over a three-week period. The microphones are vastly better than the XM4 for Microsoft Teams calls.',
    date: '2025-01-21T16:00:00.000Z',
    createdAt: '2025-01-21T16:00:00.000Z',
    updatedAt: '2025-01-21T16:00:00.000Z',
    source: 'api',
    verified: true,
    verifiedPurchase: true,
    sentiment: 'Positive',
    sentimentScore: 0.97,
    aspects: [
      { aspect: 'Noise Cancellation', sentiment: 'Positive', score: 0.99 },
      { aspect: 'Battery', sentiment: 'Positive', score: 0.96 },
      { aspect: 'Microphone & Calls', sentiment: 'Positive', score: 0.91 },
    ],
    pros: ['Supreme ANC', '30-hour battery', 'Crystal clear mic'],
    cons: ['Large case'],
    keywords: ['Noise Cancellation', 'Battery', 'Microphone', 'ANC'],
    suspicious: false,
    suspiciousScore: 0.03,
    suspiciousReason: null,
    analysis: {
      _id: 'ana-xm5-01',
      reviewId: 'rev-xm5-01',
      productId: 'prod-sony-wh1000xm5',
      sentiment: 'Positive',
      confidence: 0.97,
      aspects: [
        { aspect: 'Noise Cancellation', sentiment: 'Positive', score: 0.99 },
        { aspect: 'Battery', sentiment: 'Positive', score: 0.96 },
        { aspect: 'Microphone & Calls', sentiment: 'Positive', score: 0.91 },
      ],
      pros: ['Supreme ANC', '30-hour battery', 'Crystal clear mic'],
      cons: ['Large case'],
      keywords: ['Noise Cancellation', 'Battery', 'Microphone', 'ANC'],
      suspiciousStatus: 'Genuine',
      suspiciousScore: 0.03,
      createdAt: '2025-01-21T16:00:00.000Z',
      updatedAt: '2025-01-21T16:00:00.000Z',
    },
  },
  {
    id: 'rev-xm5-02',
    _id: 'rev-xm5-02',
    productId: 'prod-sony-wh1000xm5',
    productName: 'Sony WH-1000XM5 Headphones',
    productBrand: 'Sony',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    userName: 'Claire Dupont',
    authorName: 'Claire Dupont',
    rating: 4,
    title: 'Sounds amazing, but I really miss the folding design of XM4',
    text: 'Acoustically these are the most refined headphones Sony has built. The mids are clearer and the bass is tight without bleeding into vocals. My only real disappointment is that the headband no longer folds inward into a small crescent. The case is noticeably larger in my purse.',
    reviewText:
      'Acoustically these are the most refined headphones Sony has built. The mids are clearer and the bass is tight without bleeding into vocals. My only real disappointment is that the headband no longer folds inward into a small crescent. The case is noticeably larger in my purse.',
    date: '2025-01-24T18:40:00.000Z',
    createdAt: '2025-01-24T18:40:00.000Z',
    updatedAt: '2025-01-24T18:40:00.000Z',
    source: 'api',
    verified: true,
    verifiedPurchase: true,
    sentiment: 'Positive',
    sentimentScore: 0.79,
    aspects: [
      { aspect: 'Audio Quality', sentiment: 'Positive', score: 0.94 },
      { aspect: 'Portability & Case', sentiment: 'Negative', score: -0.6 },
    ],
    pros: ['Detailed high-res audio', 'Soft fit synthetic leather'],
    cons: ['Case is bulky', 'Does not fold compact'],
    keywords: ['Audio Quality', 'Case', 'Bass', 'Design'],
    suspicious: false,
    suspiciousScore: 0.05,
    suspiciousReason: null,
    analysis: {
      _id: 'ana-xm5-02',
      reviewId: 'rev-xm5-02',
      productId: 'prod-sony-wh1000xm5',
      sentiment: 'Positive',
      confidence: 0.89,
      aspects: [
        { aspect: 'Audio Quality', sentiment: 'Positive', score: 0.94 },
        { aspect: 'Portability & Case', sentiment: 'Negative', score: -0.6 },
      ],
      pros: ['Detailed high-res audio', 'Soft fit synthetic leather'],
      cons: ['Case is bulky', 'Does not fold compact'],
      keywords: ['Audio Quality', 'Case', 'Bass', 'Design'],
      suspiciousStatus: 'Genuine',
      suspiciousScore: 0.05,
      createdAt: '2025-01-24T18:40:00.000Z',
      updatedAt: '2025-01-24T18:40:00.000Z',
    },
  },

  // 4. Garmin Fenix 7X Reviews
  {
    id: 'rev-fenix-01',
    _id: 'rev-fenix-01',
    productId: 'prod-garmin-fenix-7x',
    productName: 'Garmin Fenix 7X Sapphire Solar',
    productBrand: 'Garmin',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    userName: 'Brian Hayes',
    authorName: 'Brian Hayes',
    rating: 5,
    title: 'Surviving a 100-mile ultra without a single recharge',
    text: 'Completed a 100-mile mountain ultramarathon over 28 hours with continuous multi-band GPS tracking, heart rate, and elevation profiling. I finished the race with 62% battery remaining! The titanium bezel took direct hits on granite rocks with zero scratches on the sapphire lens. Worth every single cent.',
    reviewText:
      'Completed a 100-mile mountain ultramarathon over 28 hours with continuous multi-band GPS tracking, heart rate, and elevation profiling. I finished the race with 62% battery remaining! The titanium bezel took direct hits on granite rocks with zero scratches on the sapphire lens. Worth every single cent.',
    date: '2025-01-27T12:00:00.000Z',
    createdAt: '2025-01-27T12:00:00.000Z',
    updatedAt: '2025-01-27T12:00:00.000Z',
    source: 'api',
    verified: true,
    verifiedPurchase: true,
    sentiment: 'Positive',
    sentimentScore: 0.98,
    aspects: [
      { aspect: 'Battery', sentiment: 'Positive', score: 0.99 },
      { aspect: 'GPS', sentiment: 'Positive', score: 0.97 },
      { aspect: 'Durability', sentiment: 'Positive', score: 0.98 },
    ],
    pros: ['Month-long battery life', 'Flawless satellite lock', 'Indestructible sapphire'],
    cons: ['Bulky 51mm frame'],
    keywords: ['Battery', 'GPS', 'Durability', 'Ultramarathon'],
    suspicious: false,
    suspiciousScore: 0.04,
    suspiciousReason: null,
    analysis: {
      _id: 'ana-fenix-01',
      reviewId: 'rev-fenix-01',
      productId: 'prod-garmin-fenix-7x',
      sentiment: 'Positive',
      confidence: 0.99,
      aspects: [
        { aspect: 'Battery', sentiment: 'Positive', score: 0.99 },
        { aspect: 'GPS', sentiment: 'Positive', score: 0.97 },
        { aspect: 'Durability', sentiment: 'Positive', score: 0.98 },
      ],
      pros: ['Month-long battery life', 'Flawless satellite lock', 'Indestructible sapphire'],
      cons: ['Bulky 51mm frame'],
      keywords: ['Battery', 'GPS', 'Durability', 'Ultramarathon'],
      suspiciousStatus: 'Genuine',
      suspiciousScore: 0.04,
      createdAt: '2025-01-27T12:00:00.000Z',
      updatedAt: '2025-01-27T12:00:00.000Z',
    },
  },

  // 5. Breville Barista Touch Reviews
  {
    id: 'rev-brev-01',
    _id: 'rev-brev-01',
    productId: 'prod-breville-barista',
    productName: 'Breville Barista Touch Espresso Machine',
    productBrand: 'Breville',
    productImage: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&auto=format&fit=crop&q=80',
    userName: 'Rachel Green',
    authorName: 'Rachel Green',
    rating: 5,
    title: 'Cafe quality flat whites in under 60 seconds at home',
    text: 'The 3-second ThermoJet heat up time is pure magic on groggy Monday mornings. I love that the auto steam wand creates silky microfoam automatically while I dose and tamp. My morning latte now tastes significantly better than Starbucks, and the machine has already paid for itself in coffee shop savings.',
    reviewText:
      'The 3-second ThermoJet heat up time is pure magic on groggy Monday mornings. I love that the auto steam wand creates silky microfoam automatically while I dose and tamp. My morning latte now tastes significantly better than Starbucks, and the machine has already paid for itself in coffee shop savings.',
    date: '2025-01-26T08:15:00.000Z',
    createdAt: '2025-01-26T08:15:00.000Z',
    updatedAt: '2025-01-26T08:15:00.000Z',
    source: 'api',
    verified: true,
    verifiedPurchase: true,
    sentiment: 'Positive',
    sentimentScore: 0.95,
    aspects: [
      { aspect: 'Speed', sentiment: 'Positive', score: 0.98 },
      { aspect: 'Milk Texturing', sentiment: 'Positive', score: 0.94 },
      { aspect: 'Coffee Quality', sentiment: 'Positive', score: 0.95 },
    ],
    pros: ['3s ThermoJet heat up', 'Auto milk frothing', 'Touchscreen simplicity'],
    cons: ['Needs daily tray emptying'],
    keywords: ['Coffee Quality', 'Milk Frother', 'Heat Speed', 'Touchscreen'],
    suspicious: false,
    suspiciousScore: 0.03,
    suspiciousReason: null,
    analysis: {
      _id: 'ana-brev-01',
      reviewId: 'rev-brev-01',
      productId: 'prod-breville-barista',
      sentiment: 'Positive',
      confidence: 0.96,
      aspects: [
        { aspect: 'Speed', sentiment: 'Positive', score: 0.98 },
        { aspect: 'Milk Texturing', sentiment: 'Positive', score: 0.94 },
        { aspect: 'Coffee Quality', sentiment: 'Positive', score: 0.95 },
      ],
      pros: ['3s ThermoJet heat up', 'Auto milk frothing', 'Touchscreen simplicity'],
      cons: ['Needs daily tray emptying'],
      keywords: ['Coffee Quality', 'Milk Frother', 'Heat Speed', 'Touchscreen'],
      suspiciousStatus: 'Genuine',
      suspiciousScore: 0.03,
      createdAt: '2025-01-26T08:15:00.000Z',
      updatedAt: '2025-01-26T08:15:00.000Z',
    },
  },
  {
    id: 'rev-brev-02',
    _id: 'rev-brev-02',
    productId: 'prod-breville-barista',
    productName: 'Breville Barista Touch Espresso Machine',
    productBrand: 'Breville',
    productImage: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&auto=format&fit=crop&q=80',
    userName: 'Mark Stevenson',
    authorName: 'Mark Stevenson',
    rating: 2,
    title: 'Drip tray fills up too quickly and requires constant cleaning',
    text: 'While the espresso shot extraction is delicious, the machine auto-purges water into the drip tray constantly. If you make 3 drinks in the morning, the tray is completely full and spills easily when walking to the sink. The maintenance warnings pop up almost every other week.',
    reviewText:
      'While the espresso shot extraction is delicious, the machine auto-purges water into the drip tray constantly. If you make 3 drinks in the morning, the tray is completely full and spills easily when walking to the sink. The maintenance warnings pop up almost every other week.',
    date: '2025-01-28T10:30:00.000Z',
    createdAt: '2025-01-28T10:30:00.000Z',
    updatedAt: '2025-01-28T10:30:00.000Z',
    source: 'api',
    verified: true,
    verifiedPurchase: true,
    sentiment: 'Negative',
    sentimentScore: 0.25,
    aspects: [
      { aspect: 'Cleaning', sentiment: 'Negative', score: -0.75 },
      { aspect: 'Coffee Quality', sentiment: 'Positive', score: 0.8 },
    ],
    pros: ['Great espresso crema'],
    cons: ['Shallow drip tray', 'Too much auto-purge water', 'Frequent maintenance alerts'],
    keywords: ['Cleaning', 'Drip Tray', 'Maintenance'],
    suspicious: false,
    suspiciousScore: 0.05,
    suspiciousReason: null,
    analysis: {
      _id: 'ana-brev-02',
      reviewId: 'rev-brev-02',
      productId: 'prod-breville-barista',
      sentiment: 'Negative',
      confidence: 0.86,
      aspects: [
        { aspect: 'Cleaning', sentiment: 'Negative', score: -0.75 },
        { aspect: 'Coffee Quality', sentiment: 'Positive', score: 0.8 },
      ],
      pros: ['Great espresso crema'],
      cons: ['Shallow drip tray', 'Too much auto-purge water', 'Frequent maintenance alerts'],
      keywords: ['Cleaning', 'Drip Tray', 'Maintenance'],
      suspiciousStatus: 'Genuine',
      suspiciousScore: 0.05,
      createdAt: '2025-01-28T10:30:00.000Z',
      updatedAt: '2025-01-28T10:30:00.000Z',
    },
  },
];

export const DEMO_DASHBOARD_DATA: DashboardAnalyticsData = {
  metrics: {
    totalProducts: 5,
    totalReviews: 250,
    totalAnalyzed: 250,
    averageRating: 4.6,
    positiveCount: 180,
    negativeCount: 25,
    neutralCount: 35,
    mixedCount: 10,
    positivePercentage: 72,
    suspiciousCount: 12,
    uncertainCount: 6,
    suspiciousPercentage: 5,
  },
  sentimentDistribution: [
    { name: 'Positive', value: 180, color: '#10B981', percentage: 72 },
    { name: 'Neutral', value: 45, color: '#6B7280', percentage: 18 },
    { name: 'Negative', value: 25, color: '#EF4444', percentage: 10 },
  ],
  ratingDistribution: [
    { star: '5 Stars', rating: 5, count: 120, percentage: 48 },
    { star: '4 Stars', rating: 4, count: 80, percentage: 32 },
    { star: '3 Stars', rating: 3, count: 30, percentage: 12 },
    { star: '2 Stars', rating: 2, count: 12, percentage: 5 },
    { star: '1 Star', rating: 1, count: 8, percentage: 3 },
  ],
  reviewTrends: [
    { month: 'Oct 24', reviews: 28, positive: 21, negative: 3, avgRating: 4.5 },
    { month: 'Nov 24', reviews: 36, positive: 27, negative: 4, avgRating: 4.6 },
    { month: 'Dec 24', reviews: 54, positive: 40, negative: 6, avgRating: 4.6 },
    { month: 'Jan 25', reviews: 48, positive: 35, negative: 5, avgRating: 4.7 },
    { month: 'Feb 25', reviews: 42, positive: 30, negative: 4, avgRating: 4.6 },
    { month: 'Mar 25', reviews: 42, positive: 27, negative: 3, avgRating: 4.8 },
  ],
  aspectAnalytics: [
    { name: 'Performance', positive: 88, negative: 4, neutral: 8, total: 100, positiveRatio: 88 },
    { name: 'Display', positive: 82, negative: 6, neutral: 12, total: 100, positiveRatio: 82 },
    { name: 'Battery', positive: 79, negative: 9, neutral: 12, total: 100, positiveRatio: 79 },
    { name: 'Build Quality', positive: 85, negative: 5, neutral: 10, total: 100, positiveRatio: 85 },
    { name: 'Audio & Sound', positive: 86, negative: 6, neutral: 8, total: 100, positiveRatio: 86 },
    { name: 'Price & Value', positive: 36, negative: 52, neutral: 12, total: 100, positiveRatio: 36 },
  ],
  topProducts: [
    {
      _id: 'prod-macbook-pro-16',
      name: 'Apple MacBook Pro 16" M3 Max',
      brand: 'Apple',
      category: 'Computers',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      price: 3499.0,
      reviewCount: 4210,
      avgRating: 4.8,
      positiveSentimentPercent: 78,
    },
    {
      _id: 'prod-galaxy-s24-ultra',
      name: 'Samsung Galaxy S24 Ultra 512GB',
      brand: 'Samsung',
      category: 'Smartphones',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      price: 1299.99,
      reviewCount: 12482,
      avgRating: 4.6,
      positiveSentimentPercent: 72,
    },
    {
      _id: 'prod-sony-wh1000xm5',
      name: 'Sony WH-1000XM5 Headphones',
      brand: 'Sony',
      category: 'Audio',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      price: 398.0,
      reviewCount: 18240,
      avgRating: 4.7,
      positiveSentimentPercent: 82,
    },
    {
      _id: 'prod-garmin-fenix-7x',
      name: 'Garmin Fenix 7X Sapphire Solar',
      brand: 'Garmin',
      category: 'Wearables',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      price: 899.99,
      reviewCount: 6450,
      avgRating: 4.7,
      positiveSentimentPercent: 79,
    },
    {
      _id: 'prod-breville-barista',
      name: 'Breville Barista Touch Espresso Machine',
      brand: 'Breville',
      category: 'Appliances',
      image: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&auto=format&fit=crop&q=80',
      price: 999.95,
      reviewCount: 5120,
      avgRating: 4.5,
      positiveSentimentPercent: 74,
    },
  ],
  recentReviews: DEMO_REVIEWS,
};

export const DEMO_COMPARISON_DATA: ProductComparisonResponse = {
  products: [
    {
      productId: 'prod-macbook-pro-16',
      name: 'Apple MacBook Pro 16" M3 Max',
      brand: 'Apple',
      category: 'Computers',
      price: 3499.0,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      totalReviews: 4210,
      avgRating: 4.8,
      sentimentBreakdown: {
        positive: 195,
        negative: 20,
        neutral: 35,
        positivePercent: 78,
        negativePercent: 8,
      },
      topAspects: [
        { aspect: 'Performance', sentiment: 'Positive', mentions: 92 },
        { aspect: 'Display', sentiment: 'Positive', mentions: 84 },
        { aspect: 'Battery', sentiment: 'Positive', mentions: 78 },
      ],
      pros: ['Unmatched M3 Max CPU/GPU computing power', '120Hz Liquid Retina XDR screen', '22-hour battery efficiency'],
      cons: ['High price point', 'Heavy carrying weight'],
      suspiciousReviews: 4,
    },
    {
      productId: 'prod-galaxy-s24-ultra',
      name: 'Samsung Galaxy S24 Ultra 512GB',
      brand: 'Samsung',
      category: 'Smartphones',
      price: 1299.99,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      totalReviews: 12482,
      avgRating: 4.6,
      sentimentBreakdown: {
        positive: 173,
        negative: 24,
        neutral: 43,
        positivePercent: 72,
        negativePercent: 10,
      },
      topAspects: [
        { aspect: 'Display', sentiment: 'Positive', mentions: 110 },
        { aspect: 'Camera', sentiment: 'Positive', mentions: 98 },
        { aspect: 'Performance', sentiment: 'Positive', mentions: 86 },
      ],
      pros: ['Anti-reflective Gorilla Armor screen', '200MP zoom optics', 'Integrated S Pen'],
      cons: ['Substantial flagship price', 'Slow 45W charging'],
      suspiciousReviews: 8,
    },
    {
      productId: 'prod-sony-wh1000xm5',
      name: 'Sony WH-1000XM5 Headphones',
      brand: 'Sony',
      category: 'Audio',
      price: 398.0,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      totalReviews: 18240,
      avgRating: 4.7,
      sentimentBreakdown: {
        positive: 213,
        negative: 16,
        neutral: 31,
        positivePercent: 82,
        negativePercent: 6,
      },
      topAspects: [
        { aspect: 'Noise Cancellation', sentiment: 'Positive', mentions: 142 },
        { aspect: 'Audio Quality', sentiment: 'Positive', mentions: 128 },
        { aspect: 'Battery', sentiment: 'Positive', mentions: 105 },
      ],
      pros: ['Class-leading active noise cancellation', 'Warm high-resolution sound', '30-hour battery'],
      cons: ['Non-folding headband', 'Bulky travel case'],
      suspiciousReviews: 3,
    },
    {
      productId: 'prod-garmin-fenix-7x',
      name: 'Garmin Fenix 7X Sapphire Solar',
      brand: 'Garmin',
      category: 'Wearables',
      price: 899.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      totalReviews: 6450,
      avgRating: 4.7,
      sentimentBreakdown: {
        positive: 174,
        negative: 13,
        neutral: 33,
        positivePercent: 79,
        negativePercent: 6,
      },
      topAspects: [
        { aspect: 'Battery', sentiment: 'Positive', mentions: 112 },
        { aspect: 'GPS', sentiment: 'Positive', mentions: 96 },
        { aspect: 'Durability', sentiment: 'Positive', mentions: 88 },
      ],
      pros: ['30+ day solar battery endurance', 'Dual-frequency GPS lock', 'Built-in LED flashlight'],
      cons: ['Large 51mm wrist size', 'Steep software learning curve'],
      suspiciousReviews: 2,
    },
  ],
  aiComparison: {
    overallComparison:
      'Across all four flagship devices, customer satisfaction is exceptionally high, hovering between 72% and 82% positive sentiment. The Sony WH-1000XM5 leads in absolute sentiment ratio (82%) due to its benchmark-setting acoustic isolation, while the Apple MacBook Pro 16" commands the highest average star rating (4.8 ★) based on unrivaled M3 Max computational speed and battery longevity.',
    recommendation:
      'For creative productivity and computational heavy-lifting, the MacBook Pro 16" M3 Max is the definitive category winner. For mobile connectivity and outdoor visibility, the Galaxy S24 Ultra excels, while the Sony WH-1000XM5 delivers the best price-to-performance ratio for everyday commuters.',
    valueAnalysis:
      'The Sony WH-1000XM5 represents the highest day-to-day value per dollar spent ($398 for 82% satisfaction). The MacBook Pro 16" and Garmin Fenix 7X are specialized high-investment tools for power users who require zero thermal throttling and multi-week expedition battery endurance.',
  },
};

// Central helper functions
export function getDemoProducts(): DemoProductItem[] {
  return DEMO_PRODUCTS;
}

export function getDemoProductById(id: string): DemoProductItem | undefined {
  return DEMO_PRODUCTS.find(p => p.id === id || p._id === id);
}

export function getDemoReviews(params?: {
  productId?: string;
  sentiment?: string;
  rating?: number;
  isSuspicious?: boolean;
  search?: string;
}): DemoReviewItem[] {
  let list = [...DEMO_REVIEWS];

  if (params?.productId && params.productId !== 'All' && params.productId !== 'all') {
    list = list.filter(r => r.productId === params.productId);
  }

  if (params?.sentiment && params.sentiment !== 'All') {
    list = list.filter(r => r.sentiment.toLowerCase() === params.sentiment!.toLowerCase());
  }

  if (params?.rating && params.rating > 0) {
    list = list.filter(r => Math.round(r.rating) === params.rating);
  }

  if (params?.isSuspicious !== undefined) {
    list = list.filter(r => r.suspicious === params.isSuspicious);
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      r =>
        r.title.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        (r.productName && r.productName.toLowerCase().includes(q))
    );
  }

  return list;
}

export function getDemoSummary(productId: string): ProductSummary | null {
  const prod = getDemoProductById(productId);
  return prod ? prod.summary : DEMO_PRODUCTS[0].summary;
}

export function getDemoAnalytics(): DashboardAnalyticsData {
  return DEMO_DASHBOARD_DATA;
}

export function getDemoComparison(productIds: string[]): ProductComparisonResponse {
  if (!productIds || productIds.length === 0) {
    return DEMO_COMPARISON_DATA;
  }
  const filtered = DEMO_COMPARISON_DATA.products.filter(p => productIds.includes(p.productId));
  if (filtered.length >= 2) {
    return {
      ...DEMO_COMPARISON_DATA,
      products: filtered,
    };
  }
  return DEMO_COMPARISON_DATA;
}

export function getDemoUser(): User {
  return DEMO_USER;
}
