export interface MockMarketplaceProduct {
  id: string;
  source: 'amazon' | 'flipkart';
  name: string;
  brand: string;
  price: number;
  formattedPrice: string;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  productUrl: string;
  category: 'Smartphones' | 'Audio' | 'Computers' | 'Wearables' | 'Appliances';
  targetSeededProductId: string;
  badge?: string;
  availability: string;
  aspectsSummary: { name: string; rating: number; sentiment: 'Positive' | 'Neutral' | 'Negative' }[];
}

export const MOCK_MARKETPLACE_PRODUCTS: MockMarketplaceProduct[] = [
  // 1. Samsung Galaxy S24 / S24 Ultra
  {
    id: 'amazon-s24-ultra',
    source: 'amazon',
    name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 512GB)',
    brand: 'Samsung',
    price: 74999,
    formattedPrice: '₹74,999',
    rating: 4.5,
    reviewCount: 12482,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    description: 'Galaxy AI powered flagship phone with 200MP Quad-Tele camera, Snapdragon 8 Gen 3 for Galaxy, and flat titanium display with built-in S Pen.',
    productUrl: '#',
    category: 'Smartphones',
    targetSeededProductId: 'prod-galaxy-s24-ultra',
    badge: 'Amazon Choice',
    availability: 'In Stock - Prime 1-Day Delivery',
    aspectsSummary: [
      { name: 'Display & Brightness', rating: 4.9, sentiment: 'Positive' },
      { name: 'Camera Quality', rating: 4.8, sentiment: 'Positive' },
      { name: 'Battery Endurance', rating: 4.6, sentiment: 'Positive' },
      { name: 'Performance & Gaming', rating: 4.9, sentiment: 'Positive' },
      { name: 'Pricing & Value', rating: 3.4, sentiment: 'Negative' },
    ],
  },
  {
    id: 'flipkart-s24',
    source: 'flipkart',
    name: 'Samsung Galaxy S24 5G (Amber Yellow, 256GB)',
    brand: 'Samsung',
    price: 75499,
    formattedPrice: '₹75,499',
    rating: 4.4,
    reviewCount: 8931,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
    description: 'Compact AI flagship with Dynamic AMOLED 2X 120Hz display, ProVisual Engine for night photography, and all-day intelligent battery.',
    productUrl: '#',
    category: 'Smartphones',
    targetSeededProductId: 'prod-galaxy-s24-ultra',
    badge: 'Flipkart Assured',
    availability: 'Fast Delivery by Tomorrow',
    aspectsSummary: [
      { name: 'Compact Form Factor', rating: 4.8, sentiment: 'Positive' },
      { name: 'Display', rating: 4.7, sentiment: 'Positive' },
      { name: 'Camera Speed', rating: 4.4, sentiment: 'Positive' },
      { name: 'Charging Speed', rating: 3.6, sentiment: 'Neutral' },
      { name: 'Price', rating: 3.5, sentiment: 'Negative' },
    ],
  },

  // 2. Apple iPhone 16 / 16 Pro
  {
    id: 'amazon-iphone-16-pro',
    source: 'amazon',
    name: 'Apple iPhone 16 Pro (128 GB) - Natural Titanium',
    brand: 'Apple',
    price: 119900,
    formattedPrice: '₹1,19,900',
    rating: 4.7,
    reviewCount: 9842,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    description: 'Built for Apple Intelligence with A18 Pro chip, 48MP Fusion camera system with 5x Telephoto, and Camera Control physical tactile slider.',
    productUrl: '#',
    category: 'Smartphones',
    targetSeededProductId: 'prod-galaxy-s24-ultra',
    badge: 'Best Seller',
    availability: 'In Stock - Free Express Shipping',
    aspectsSummary: [
      { name: 'Camera Control Button', rating: 4.6, sentiment: 'Positive' },
      { name: 'Build Quality & Weight', rating: 4.9, sentiment: 'Positive' },
      { name: 'Video Capabilities', rating: 4.9, sentiment: 'Positive' },
      { name: 'Battery', rating: 4.3, sentiment: 'Positive' },
      { name: 'Base Storage Value', rating: 3.2, sentiment: 'Negative' },
    ],
  },
  {
    id: 'flipkart-iphone-16',
    source: 'flipkart',
    name: 'Apple iPhone 16 (128 GB) - Ultramarine',
    brand: 'Apple',
    price: 79900,
    formattedPrice: '₹79,900',
    rating: 4.6,
    reviewCount: 14120,
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
    description: 'New infused colour-through back glass, Action button, 48MP Fusion camera with 2x Telephoto, and macro photography versatility.',
    productUrl: '#',
    category: 'Smartphones',
    targetSeededProductId: 'prod-galaxy-s24-ultra',
    badge: 'Flipkart Assured',
    availability: 'In Stock - 5% Cashback with Flipkart Axis Bank',
    aspectsSummary: [
      { name: 'Ultramarine Color Finish', rating: 4.9, sentiment: 'Positive' },
      { name: 'Action Button', rating: 4.5, sentiment: 'Positive' },
      { name: 'Speaker Audio', rating: 4.7, sentiment: 'Positive' },
      { name: '60Hz Screen Refresh', rating: 3.3, sentiment: 'Negative' },
    ],
  },

  // 3. Sony WH-1000XM5
  {
    id: 'amazon-sony-xm5',
    source: 'amazon',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    brand: 'Sony',
    price: 29990,
    formattedPrice: '₹29,990',
    rating: 4.6,
    reviewCount: 18240,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    description: 'Industry-leading noise canceling with Auto NC Optimizer, 8 microphones with 2 processors, crystal clear hands-free calling, and 30-hour battery.',
    productUrl: '#',
    category: 'Audio',
    targetSeededProductId: 'prod-sony-wh1000xm5',
    badge: 'Amazon Choice',
    availability: 'In Stock - Prime 1-Day Delivery',
    aspectsSummary: [
      { name: 'Active Noise Cancellation', rating: 4.9, sentiment: 'Positive' },
      { name: 'Audio Soundstage', rating: 4.7, sentiment: 'Positive' },
      { name: 'Battery Longevity', rating: 4.8, sentiment: 'Positive' },
      { name: 'Microphone & Calls', rating: 4.5, sentiment: 'Positive' },
      { name: 'Non-folding Headband', rating: 3.4, sentiment: 'Negative' },
    ],
  },
  {
    id: 'flipkart-sony-xm5',
    source: 'flipkart',
    name: 'Sony WH-1000XM5 Bluetooth Headset with Precision Mic',
    brand: 'Sony',
    price: 30490,
    formattedPrice: '₹30,490',
    rating: 4.5,
    reviewCount: 11415,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    description: 'Precision engineered 30mm carbon fiber driver units, lightweight soft fit leather headband, and quick 3-minute charge for 3 hours playback.',
    productUrl: '#',
    category: 'Audio',
    targetSeededProductId: 'prod-sony-wh1000xm5',
    badge: 'Flipkart Assured',
    availability: 'Express Delivery in 24 Hours',
    aspectsSummary: [
      { name: 'Active Noise Cancellation', rating: 4.9, sentiment: 'Positive' },
      { name: 'Bass Response', rating: 4.6, sentiment: 'Positive' },
      { name: 'Touch Controls', rating: 4.3, sentiment: 'Positive' },
      { name: 'Case Bulkiness', rating: 3.5, sentiment: 'Neutral' },
    ],
  },

  // 4. Apple MacBook Pro
  {
    id: 'amazon-macbook-pro-16',
    source: 'amazon',
    name: 'Apple MacBook Pro 16" M3 Max (36GB RAM, 1TB SSD)',
    brand: 'Apple',
    price: 349900,
    formattedPrice: '₹3,49,900',
    rating: 4.9,
    reviewCount: 4210,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    description: 'Supercharged by M3 Max chip with 14-core CPU, 30-core GPU, Liquid Retina XDR display, hardware ray-tracing, and up to 22 hours battery.',
    productUrl: '#',
    category: 'Computers',
    targetSeededProductId: 'prod-macbook-pro-16',
    badge: 'Top Rated Pro Gear',
    availability: 'In Stock - Free Standard Delivery',
    aspectsSummary: [
      { name: 'Raw Compute & GPU Speed', rating: 5.0, sentiment: 'Positive' },
      { name: 'Liquid Retina XDR Screen', rating: 4.9, sentiment: 'Positive' },
      { name: 'Thermal Management & Fan Noise', rating: 4.8, sentiment: 'Positive' },
      { name: 'Battery Endurance', rating: 4.8, sentiment: 'Positive' },
      { name: 'Price & Weight', rating: 3.1, sentiment: 'Negative' },
    ],
  },
  {
    id: 'flipkart-macbook-pro-14',
    source: 'flipkart',
    name: 'Apple MacBook Pro 14" M3 Pro (18GB Unified RAM, 512GB SSD)',
    brand: 'Apple',
    price: 199900,
    formattedPrice: '₹1,99,900',
    rating: 4.8,
    reviewCount: 2810,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
    description: 'Space Black anodization preventing fingerprints, studio-grade 3-mic array, 6-speaker spatial audio, and MagSafe 3 fast charging.',
    productUrl: '#',
    category: 'Computers',
    targetSeededProductId: 'prod-macbook-pro-16',
    badge: 'Flipkart Assured',
    availability: 'Delivery by Thursday',
    aspectsSummary: [
      { name: 'Display Clarity', rating: 4.9, sentiment: 'Positive' },
      { name: 'Port Selection (HDMI/SD)', rating: 4.7, sentiment: 'Positive' },
      { name: 'Space Black Coating', rating: 4.6, sentiment: 'Positive' },
      { name: 'Upgradeability', rating: 2.8, sentiment: 'Negative' },
    ],
  },

  // 5. Garmin Fenix 7 / 7X
  {
    id: 'amazon-garmin-fenix-7x',
    source: 'amazon',
    name: 'Garmin Fenix 7X Sapphire Solar Multisport Watch',
    brand: 'Garmin',
    price: 89990,
    formattedPrice: '₹89,990',
    rating: 4.6,
    reviewCount: 6450,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    description: 'Rugged GPS smartwatch with Power Sapphire solar charging lens, built-in LED flashlight, multi-band GNSS, preloaded TopoActive maps, and 37-day battery.',
    productUrl: '#',
    category: 'Wearables',
    targetSeededProductId: 'prod-garmin-fenix-7x',
    badge: 'Amazon Choice',
    availability: 'In Stock - Prime 1-Day Delivery',
    aspectsSummary: [
      { name: 'Solar Battery Life', rating: 4.9, sentiment: 'Positive' },
      { name: 'GPS Accuracy & Mapping', rating: 4.8, sentiment: 'Positive' },
      { name: 'Integrated LED Flashlight', rating: 4.9, sentiment: 'Positive' },
      { name: 'Durability & Sapphire Glass', rating: 4.9, sentiment: 'Positive' },
      { name: 'UI Learning Curve', rating: 3.5, sentiment: 'Neutral' },
    ],
  },
  {
    id: 'flipkart-garmin-fenix-7',
    source: 'flipkart',
    name: 'Garmin Fenix 7 Solar Smartwatch (Slate Gray with Black Band)',
    brand: 'Garmin',
    price: 74990,
    formattedPrice: '₹74,990',
    rating: 4.5,
    reviewCount: 3290,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
    description: '47mm fiber-reinforced polymer case with stainless steel bezel, pulse ox sensor, heart rate variability, training readiness telemetry.',
    productUrl: '#',
    category: 'Wearables',
    targetSeededProductId: 'prod-garmin-fenix-7x',
    badge: 'Flipkart Assured',
    availability: 'Fast Dispatch',
    aspectsSummary: [
      { name: 'Health Metrics & HRV', rating: 4.7, sentiment: 'Positive' },
      { name: 'Battery Life', rating: 4.8, sentiment: 'Positive' },
      { name: 'Outdoor Readability', rating: 4.6, sentiment: 'Positive' },
      { name: 'App Sync Speed', rating: 3.8, sentiment: 'Neutral' },
    ],
  },

  // 6. Breville Barista Touch Espresso Machine
  {
    id: 'amazon-breville-barista',
    source: 'amazon',
    name: 'Breville Barista Touch Espresso Machine Stainless',
    brand: 'Breville',
    price: 99990,
    formattedPrice: '₹99,990',
    rating: 4.5,
    reviewCount: 5120,
    image: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&auto=format&fit=crop&q=80',
    description: 'Automated touchscreen bean-to-cup espresso maker with integrated precision conical burr grinder and automatic microfoam milk texturing.',
    productUrl: '#',
    category: 'Appliances',
    targetSeededProductId: 'prod-breville-barista',
    badge: 'Amazon Choice',
    availability: 'In Stock - Scheduled Free Installation',
    aspectsSummary: [
      { name: 'Automated Milk Microfoam', rating: 4.8, sentiment: 'Positive' },
      { name: 'Espresso Extraction Taste', rating: 4.7, sentiment: 'Positive' },
      { name: 'Touchscreen Usability', rating: 4.6, sentiment: 'Positive' },
      { name: 'Daily Cleaning Routine', rating: 3.6, sentiment: 'Neutral' },
      { name: 'Price Point', rating: 3.3, sentiment: 'Negative' },
    ],
  },
  {
    id: 'flipkart-breville-touch',
    source: 'flipkart',
    name: 'Breville Barista Touch Automatic Coffee Maker (Brushed Steel)',
    brand: 'Breville',
    price: 102400,
    formattedPrice: '₹1,02,400',
    rating: 4.4,
    reviewCount: 2980,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
    description: 'ThermoJet heating system reaches optimum extraction temperature in 3 seconds. Pre-programmed cafe drinks menu with customizable user profiles.',
    productUrl: '#',
    category: 'Appliances',
    targetSeededProductId: 'prod-breville-barista',
    badge: 'Flipkart Assured',
    availability: 'Express Delivery by Friday',
    aspectsSummary: [
      { name: 'Fast 3s Heat Up', rating: 4.9, sentiment: 'Positive' },
      { name: 'Coffee Consistency', rating: 4.6, sentiment: 'Positive' },
      { name: 'Steam Wand Pressure', rating: 4.5, sentiment: 'Positive' },
      { name: 'Descaling Frequency', rating: 3.4, sentiment: 'Negative' },
    ],
  },
];

/**
 * Filter mock products by query search and marketplace source
 */
export function searchMockMarketplaceProducts(
  query: string = '',
  sourceFilter: 'all' | 'amazon' | 'flipkart' = 'all',
  categoryFilter: string = 'All'
): MockMarketplaceProduct[] {
  const normalizedQuery = query.toLowerCase().trim();

  return MOCK_MARKETPLACE_PRODUCTS.filter(product => {
    // Marketplace filter
    if (sourceFilter !== 'all' && product.source !== sourceFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'All' && product.category !== categoryFilter) {
      return false;
    }

    // Query filter
    if (!normalizedQuery) {
      return true;
    }

    const matchesName = product.name.toLowerCase().includes(normalizedQuery);
    const matchesBrand = product.brand.toLowerCase().includes(normalizedQuery);
    const matchesDesc = product.description.toLowerCase().includes(normalizedQuery);
    const matchesCategory = product.category.toLowerCase().includes(normalizedQuery);

    return matchesName || matchesBrand || matchesDesc || matchesCategory;
  });
}
