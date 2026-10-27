import bcrypt from 'bcryptjs';
import { db, UserDoc, ProductDoc, ReviewDoc, AnalysisDoc, ProductSummaryDoc } from '../config/db.js';

export async function seedInitialDataIfNeeded(): Promise<void> {
  if (db.users.size > 0 && db.products.size > 0) {
    return; // Already seeded
  }

  console.log('Seeding initial demo data for REVIEWLYTICS...');

  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('password123', salt);

  // 1. Seed Demo User
  const demoUser: UserDoc = {
    _id: 'user-demo-001',
    name: 'Krishna Sharma',
    email: 'skpkrishna25@gmail.com',
    password: defaultPassword,
    role: 'admin',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    settings: {
      theme: 'dark',
      emailNotifications: true,
      autoAnalyzeReviews: true,
      aiTemperature: 0.7,
    },
    createdAt: new Date('2025-01-10T10:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const analystUser: UserDoc = {
    _id: 'user-analyst-002',
    name: 'Alex Rivera',
    email: 'alex@reviewlytics.io',
    password: defaultPassword,
    role: 'user',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    settings: {
      theme: 'dark',
      emailNotifications: true,
      autoAnalyzeReviews: true,
      aiTemperature: 0.7,
    },
    createdAt: new Date('2025-01-12T12:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.set(demoUser._id, demoUser);
  db.users.set(analystUser._id, analystUser);

  // 2. Seed Products
  const products: ProductDoc[] = [
    {
      _id: 'prod-sony-wh1000xm5',
      name: 'Sony WH-1000XM5 Noise-Canceling Headphones',
      brand: 'Sony',
      category: 'Audio',
      description: 'Industry-leading noise canceling with Auto NC Optimizer, crystal clear hands-free calling, and 30-hour battery life.',
      price: 398.0,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      createdBy: demoUser._id,
      createdAt: new Date('2025-01-15T09:00:00Z').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'prod-galaxy-s24-ultra',
      name: 'Samsung Galaxy S24 Ultra 512GB Titanium',
      brand: 'Samsung',
      category: 'Smartphones',
      description: 'Galaxy AI powered flagship phone with 200MP camera, Snapdragon 8 Gen 3 processor, and built-in S Pen.',
      price: 1299.99,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      createdBy: demoUser._id,
      createdAt: new Date('2025-01-16T11:30:00Z').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'prod-macbook-pro-16',
      name: 'Apple MacBook Pro 16" M3 Max (36GB Unified RAM)',
      brand: 'Apple',
      category: 'Computers',
      description: 'Supercharged by M3 Max chip with 14-core CPU, 30-core GPU, Liquid Retina XDR display, and up to 22 hours of battery.',
      price: 3499.0,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      createdBy: demoUser._id,
      createdAt: new Date('2025-01-18T14:15:00Z').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'prod-garmin-fenix-7x',
      name: 'Garmin Fenix 7X Sapphire Solar Multisport Watch',
      brand: 'Garmin',
      category: 'Wearables',
      description: 'Rugged GPS smartwatch with solar charging lens, built-in LED flashlight, topo maps, and up to 37 days of battery life.',
      price: 899.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      createdBy: demoUser._id,
      createdAt: new Date('2025-01-20T16:45:00Z').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'prod-breville-barista',
      name: 'Breville Barista Touch Espresso Machine Stainless',
      brand: 'Breville',
      category: 'Appliances',
      description: 'Automated touchscreen bean-to-cup espresso maker with integrated precision conical burr grinder and automatic microfoam milk.',
      price: 999.95,
      image: 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?w=800&auto=format&fit=crop&q=80',
      createdBy: demoUser._id,
      createdAt: new Date('2025-01-22T08:20:00Z').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  products.forEach(p => db.products.set(p._id, p));

  // 3. Seed Reviews & Analyses
  const reviewsData: {
    productId: string;
    rating: number;
    title: string;
    text: string;
    author: string;
    date: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
    confidence: number;
    aspects: { name: string; sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed' }[];
    pros: string[];
    cons: string[];
    keywords: string[];
    suspicious: 'Genuine' | 'Suspicious' | 'Uncertain';
    reason: string;
  }[] = [
    // Sony XM5 Reviews
    {
      productId: 'prod-sony-wh1000xm5',
      rating: 5,
      title: 'Incredible noise cancellation and unmatched audio clarity',
      text: 'The active noise canceling on the XM5 is absolutely top-tier. Commuting on the subway is dead silent now. The soundstage is spacious, and bass response is punchy without distorting vocals. The battery lasts through a full week of heavy work use.',
      author: 'Marcus Chen',
      date: '2025-02-01T10:00:00Z',
      sentiment: 'Positive',
      confidence: 0.98,
      aspects: [
        { name: 'Noise Cancellation', sentiment: 'Positive' },
        { name: 'Audio Quality', sentiment: 'Positive' },
        { name: 'Battery Life', sentiment: 'Positive' },
      ],
      pros: ['Class-leading ANC', 'Punchy and clear soundstage', '30-hour battery life'],
      cons: ['Cannot fold into a compact ball like XM4'],
      keywords: ['noise canceling', 'subway', 'soundstage', 'battery', 'comfort'],
      suspicious: 'Genuine',
      reason: 'Natural descriptive usage context with realistic impressions.',
    },
    {
      productId: 'prod-sony-wh1000xm5',
      rating: 4,
      title: 'Great sound, but headband design feels slightly loose',
      text: 'Audio quality and microphone call clarity are vastly improved over previous generations. However, during workouts or looking down, the new cylindrical headband slides around on my head.',
      author: 'Sarah Jenkins',
      date: '2025-02-03T14:30:00Z',
      sentiment: 'Mixed',
      confidence: 0.91,
      aspects: [
        { name: 'Audio Quality', sentiment: 'Positive' },
        { name: 'Microphone', sentiment: 'Positive' },
        { name: 'Comfort & Fit', sentiment: 'Negative' },
      ],
      pros: ['Crisp voice mic', 'High resolution audio codecs'],
      cons: ['Looser headband clamp pressure'],
      keywords: ['microphone', 'fit', 'clamp', 'clarity'],
      suspicious: 'Genuine',
      reason: 'Balanced critique highlighting specific physical ergonomics.',
    },
    {
      productId: 'prod-sony-wh1000xm5',
      rating: 1,
      title: 'Hinge broke within 3 months of gentle office use',
      text: 'Disappointed with the durability. The swivel mechanism on the left ear cup developed a hairline crack despite keeping it in the official hard case. Sony support refused to cover it under warranty.',
      author: 'David Wright',
      date: '2025-02-06T18:00:00Z',
      sentiment: 'Negative',
      confidence: 0.96,
      aspects: [
        { name: 'Build Quality', sentiment: 'Negative' },
        { name: 'Customer Service', sentiment: 'Negative' },
        { name: 'Durability', sentiment: 'Negative' },
      ],
      pros: [],
      cons: ['Fragile hinge plastic', 'Unhelpful warranty support'],
      keywords: ['hinge', 'durability', 'swivel', 'support', 'warranty'],
      suspicious: 'Genuine',
      reason: 'Specific failure scenario with customer service interaction details.',
    },
    {
      productId: 'prod-sony-wh1000xm5',
      rating: 5,
      title: 'BEST PRODUCT EVER MUST BUY 100% GREAT SELLER!!!!',
      text: 'BEST HEADPHONES EVER BUY NOW BEST QUALITY AMAZING AMAZING PERFECT SUPER FAST SHIPPING LOVE IT 5 STARS!!',
      author: 'User994829',
      date: '2025-02-08T09:12:00Z',
      sentiment: 'Positive',
      confidence: 0.94,
      aspects: [{ name: 'Build Quality', sentiment: 'Positive' }],
      pros: ['Excited buyer'],
      cons: [],
      keywords: ['best', 'amazing', 'perfect', 'shipping'],
      suspicious: 'Suspicious',
      reason: 'Contains extreme generic praise, repetitive all-caps words, and lack of product-specific technical observations.',
    },

    // Samsung Galaxy S24 Ultra Reviews
    {
      productId: 'prod-galaxy-s24-ultra',
      rating: 5,
      title: 'The flat titanium display and 200MP zoom are phenomenal',
      text: 'Moving to the completely flat display with anti-reflective glass makes reading under direct sunlight effortless. The Snapdragon 8 Gen 3 runs Genshin Impact and editing 4K HDR video without thermal throttling. S Pen latency is virtually zero.',
      author: 'Priya Patel',
      date: '2025-02-05T11:20:00Z',
      sentiment: 'Positive',
      confidence: 0.97,
      aspects: [
        { name: 'Display', sentiment: 'Positive' },
        { name: 'Camera', sentiment: 'Positive' },
        { name: 'Performance', sentiment: 'Positive' },
        { name: 'S Pen', sentiment: 'Positive' },
      ],
      pros: ['Anti-reflective glass', '200MP telephoto zoom', 'Sustained peak gaming performance'],
      cons: ['Heavy weight at 232 grams'],
      keywords: ['anti-reflective', 'snapdragon', 's pen', 'display', 'camera', 'gaming'],
      suspicious: 'Genuine',
      reason: 'Highly technical and specific hardware feedback.',
    },
    {
      productId: 'prod-galaxy-s24-ultra',
      rating: 3,
      title: 'AI features are cool, but shutter lag still exists in low light',
      text: 'The Circle to Search and live translation features are actually useful everyday tools. However, taking photos of moving pets indoors still shows slight motion blur. For $1300, camera sensor capture speed should be instantaneous.',
      author: 'Lucas Meyer',
      date: '2025-02-09T16:40:00Z',
      sentiment: 'Mixed',
      confidence: 0.93,
      aspects: [
        { name: 'AI Features', sentiment: 'Positive' },
        { name: 'Camera', sentiment: 'Mixed' },
        { name: 'Value for Money', sentiment: 'Negative' },
      ],
      pros: ['Circle to Search integration', 'Premium titanium chassis'],
      cons: ['Indoor low-light shutter delay', 'High premium MSRP'],
      keywords: ['circle to search', 'shutter lag', 'camera', 'low light', 'price'],
      suspicious: 'Genuine',
      reason: 'In-depth real-world photography assessment.',
    },
    {
      productId: 'prod-galaxy-s24-ultra',
      rating: 2,
      title: 'Battery drain after recent February software patch',
      text: 'Before the update, I had 8 hours of screen on time. Now the phone gets warm near the camera bump and battery drops 25% overnight in standby mode. Hoping Samsung pushes a hotfix quickly.',
      author: 'Daniel Ross',
      date: '2025-02-14T20:10:00Z',
      sentiment: 'Negative',
      confidence: 0.92,
      aspects: [
        { name: 'Battery Life', sentiment: 'Negative' },
        { name: 'Software', sentiment: 'Negative' },
        { name: 'Thermals', sentiment: 'Negative' },
      ],
      pros: [],
      cons: ['Overnight standby battery drain', 'Warm thermal hotspots'],
      keywords: ['battery drain', 'software update', 'standby', 'thermals'],
      suspicious: 'Genuine',
      reason: 'Consistent technical bug report on OS build behavior.',
    },

    // Apple MacBook Pro 16 M3 Max
    {
      productId: 'prod-macbook-pro-16',
      rating: 5,
      title: 'Blazing fast for 8K video editing and 3D Blender renders',
      text: 'The M3 Max renders complex Blender cycles and After Effects timelines 3x faster than my previous M1. The Liquid Retina XDR screen achieves stunning 1600 nits HDR peaks. Fan noise is almost non-existent even under heavy compilation workloads.',
      author: 'Elena Rostova',
      date: '2025-02-04T13:15:00Z',
      sentiment: 'Positive',
      confidence: 0.99,
      aspects: [
        { name: 'Performance', sentiment: 'Positive' },
        { name: 'Display', sentiment: 'Positive' },
        { name: 'Acoustics & Fans', sentiment: 'Positive' },
        { name: 'Battery Life', sentiment: 'Positive' },
      ],
      pros: ['Unmatched raw export speeds', 'Silent fan acoustics', 'True HDR Liquid Retina XDR'],
      cons: ['Steep price tag'],
      keywords: ['blender', 'after effects', 'm3 max', 'display', 'rendering', 'fans'],
      suspicious: 'Genuine',
      reason: 'Professional creative workflow details with quantitative benchmarks.',
    },
    {
      productId: 'prod-macbook-pro-16',
      rating: 4,
      title: 'Incredible workstation machine, heavy in a backpack',
      text: 'Performance is truly desktop-class. Battery lasts through an entire transatlantic flight of coding. My only complaint is the substantial weight and brick-like charger when traveling frequently.',
      author: 'Jonathan Cole',
      date: '2025-02-11T17:00:00Z',
      sentiment: 'Positive',
      confidence: 0.90,
      aspects: [
        { name: 'Performance', sentiment: 'Positive' },
        { name: 'Battery Life', sentiment: 'Positive' },
        { name: 'Portability', sentiment: 'Negative' },
      ],
      pros: ['18+ hours real world battery', 'Best-in-class trackpad and keyboard'],
      cons: ['Chassis weight and bulky 140W power brick'],
      keywords: ['travel', 'battery', 'weight', 'charger', 'coding'],
      suspicious: 'Genuine',
      reason: 'Practical travel usability feedback.',
    },

    // Garmin Fenix 7X Reviews
    {
      productId: 'prod-garmin-fenix-7x',
      rating: 5,
      title: 'Ultimate backcountry watch. Flashlight is a game changer',
      text: 'I completed a 100-mile ultramarathon with GPS tracking, heart rate, and offline maps enabled, and finished with 42% battery remaining! The built-in LED flashlight is surprisingly bright and indispensable for night trail runs.',
      author: 'Cody Miller',
      date: '2025-02-02T08:00:00Z',
      sentiment: 'Positive',
      confidence: 0.98,
      aspects: [
        { name: 'Battery Life', sentiment: 'Positive' },
        { name: 'GPS & Navigation', sentiment: 'Positive' },
        { name: 'Build Quality', sentiment: 'Positive' },
        { name: 'Flashlight', sentiment: 'Positive' },
      ],
      pros: ['Weeks of battery life with solar charging', 'Multi-band GNSS accuracy', 'Built-in LED strobe'],
      cons: ['MIP screen is not as vibrant as AMOLED'],
      keywords: ['ultramarathon', 'battery', 'gps', 'flashlight', 'solar'],
      suspicious: 'Genuine',
      reason: 'Detailed athletic endurance test report.',
    },

    // Breville Barista Touch Reviews
    {
      productId: 'prod-breville-barista',
      rating: 5,
      title: 'Cafe quality flat whites and lattes right from the kitchen',
      text: 'The touchscreen walkthrough makes dialing in fresh espresso beans seamless. Automatic milk texturing produces silky latte art microfoam consistently. Heats up in just 3 seconds with the ThermoJet system.',
      author: 'Hannah Brooks',
      date: '2025-02-07T09:45:00Z',
      sentiment: 'Positive',
      confidence: 0.97,
      aspects: [
        { name: 'Ease of Use', sentiment: 'Positive' },
        { name: 'Coffee Quality', sentiment: 'Positive' },
        { name: 'Milk Frother', sentiment: 'Positive' },
        { name: 'Heating Speed', sentiment: 'Positive' },
      ],
      pros: ['3-second ThermoJet warm-up', 'Auto milk temperature & texture sensors', 'Touchscreen custom presets'],
      cons: ['Drip tray fills quickly'],
      keywords: ['espresso', 'microfoam', 'thermojet', 'touchscreen', 'latte art'],
      suspicious: 'Genuine',
      reason: 'Clear specialty coffee brewing review.',
    },
  ];

  let reviewIdx = 1;
  reviewsData.forEach(r => {
    const revId = `rev-${String(reviewIdx).padStart(3, '0')}`;
    const analysisId = `analysis-${String(reviewIdx).padStart(3, '0')}`;

    const reviewDoc: ReviewDoc = {
      _id: revId,
      productId: r.productId,
      userId: demoUser._id,
      authorName: r.author,
      rating: r.rating,
      title: r.title,
      reviewText: r.text,
      source: 'manual',
      verifiedPurchase: true,
      createdAt: r.date,
      updatedAt: r.date,
    };

    const analysisDoc: AnalysisDoc = {
      _id: analysisId,
      reviewId: revId,
      productId: r.productId,
      sentiment: r.sentiment,
      confidence: r.confidence,
      aspects: r.aspects,
      pros: r.pros,
      cons: r.cons,
      keywords: r.keywords,
      suspiciousStatus: r.suspicious,
      suspiciousReason: r.reason,
      suspiciousScore: r.suspicious === 'Suspicious' ? 88 : r.suspicious === 'Uncertain' ? 55 : 12,
      createdAt: r.date,
      updatedAt: r.date,
    };

    db.reviews.set(revId, reviewDoc);
    db.analyses.set(analysisId, analysisDoc);
    reviewIdx++;
  });

  // 4. Pre-seed Product Summaries for rich dashboard & detail views
  const sonySummary: ProductSummaryDoc = {
    _id: 'prod-sony-wh1000xm5',
    productId: 'prod-sony-wh1000xm5',
    overallSummary: 'Customers overwhelmingly praise the Sony WH-1000XM5 for its exceptional active noise cancellation and balanced soundstage. Minor concerns center around the non-folding headband fit and swivel durability.',
    positiveHighlights: [
      'Industry-leading active noise cancellation for travel and busy office environments.',
      'Refined audio profile with punchy bass and expansive mid-range clarity.',
      'Outstanding 30-hour battery performance and fast charging.',
    ],
    negativeHighlights: [
      'Loose headband tension reported during workouts.',
      'Non-foldable carry case is bulkier than previous generation XM4.',
      'Single report of swivel mechanism hairline fracture.',
    ],
    keyObservations: [
      'Best suited for frequent commuters and remote professionals prioritizing noise blocking and microphone clarity.',
      'Strongest sentiment scores in Audio Quality and Active Noise Cancellation.',
    ],
    aspectBreakdown: [
      { name: 'Noise Cancellation', sentiment: 'Positive', mentions: 4 },
      { name: 'Audio Quality', sentiment: 'Positive', mentions: 4 },
      { name: 'Battery Life', sentiment: 'Positive', mentions: 3 },
      { name: 'Comfort & Fit', sentiment: 'Mixed', mentions: 2 },
      { name: 'Build Quality', sentiment: 'Mixed', mentions: 2 },
    ],
    sentimentBreakdown: { positive: 2, negative: 1, neutral: 0, mixed: 1 },
    topPros: [
      { text: 'Unmatched active noise cancellation', count: 3 },
      { text: '30-hour battery longevity', count: 2 },
      { text: 'Spacious soundstage & clear mics', count: 2 },
    ],
    topCons: [
      { text: 'Loose fit when tilting head', count: 1 },
      { text: 'Non-collapsible travel footprint', count: 1 },
    ],
    topKeywords: [
      { keyword: 'noise canceling', count: 4 },
      { keyword: 'battery', count: 3 },
      { keyword: 'soundstage', count: 3 },
      { keyword: 'comfort', count: 2 },
      { keyword: 'microphone', count: 2 },
    ],
    suspiciousCount: 1,
    totalAnalyzed: 4,
    averageRating: 3.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.summaries.set(sonySummary.productId, sonySummary);

  // Save all to JSON files
  db.saveUsers();
  db.saveProducts();
  db.saveReviews();
  db.saveAnalyses();
  db.saveSummaries();

  console.log('Demo dataset successfully seeded!');
}
