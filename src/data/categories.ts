export function slugify(text: string): string {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  itemCount: string;
  popularTags?: string[];
  featured?: boolean;
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    "id": "cat_grocery",
    "name": "Grocery & Supermarkets",
    "slug": "grocery-supermarkets",
    "description": "Daily fresh vegetables, fruits, staples, organic foods & household provisions",
    "imageUrl": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    "itemCount": "4,500+ items",
    "popularTags": [
      "Fresh Veggies",
      "Organic Pulses",
      "Spices",
      "Dairy"
    ],
    "featured": true
  },
  {
    "id": "cat_clothing",
    "name": "Clothing & Fashion",
    "slug": "clothing-fashion",
    "description": "Ethnic wear, western trends, designer sarees, menswear & kidswear",
    "imageUrl": "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
    "itemCount": "8,200+ items",
    "popularTags": [
      "Ethnic Wear",
      "Western Styles",
      "Cotton Kurtis",
      "Denims"
    ],
    "featured": true
  },
  {
    "id": "cat_jewellery",
    "name": "Jewellery & Accessories",
    "slug": "jewellery-accessories",
    "description": "Fine gold & silver jewellery, fashion accessories, watches & gemstones",
    "imageUrl": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    "itemCount": "3,100+ items",
    "popularTags": [
      "Gold Plated",
      "Silver 925",
      "Temple Jewellery",
      "Handmade Necklaces"
    ],
    "featured": true
  },
  {
    "id": "cat_footwear",
    "name": "Footwear",
    "slug": "footwear",
    "description": "Formal shoes, sneakers, comfort sandals, ethnic juttis & sports footwear",
    "imageUrl": "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
    "itemCount": "2,400+ items",
    "popularTags": [
      "Sneakers",
      "Leather Shoes",
      "Ethnic Juttis",
      "Sandals"
    ],
    "featured": true
  },
  {
    "id": "cat_electronics",
    "name": "Electronics & Home Appliances",
    "slug": "electronics-home-appliances",
    "description": "Smart TVs, refrigerators, audio systems, microwave ovens & home tech",
    "imageUrl": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80",
    "itemCount": "3,800+ items",
    "popularTags": [
      "Smart Home",
      "Kitchen Tech",
      "Audio Soundbars",
      "Appliances"
    ],
    "featured": true
  },
  {
    "id": "cat_mobile",
    "name": "Mobile & Telecom",
    "slug": "mobile-telecom",
    "description": "Smartphones, tablets, mobile accessories, chargers, cases & wearables",
    "imageUrl": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    "itemCount": "5,100+ items",
    "popularTags": [
      "5G Mobiles",
      "Earbuds",
      "Fast Chargers",
      "Smartwatches"
    ],
    "featured": true
  },
  {
    "id": "cat_home_furniture",
    "name": "Home & Furniture",
    "slug": "home-furniture",
    "description": "Wooden sofas, beds, ergonomic chairs, dining tables & modern decor",
    "imageUrl": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    "itemCount": "2,900+ items",
    "popularTags": [
      "Solid Wood",
      "Living Room",
      "Ergonomic Chairs",
      "Beds"
    ],
    "featured": true
  },
  {
    "id": "cat_pharmacy",
    "name": "Pharmacy & Healthcare",
    "slug": "pharmacy-healthcare",
    "description": "Ayurvedic remedies, vitamins, medical devices, first aid & health supplements",
    "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    "itemCount": "1,900+ items",
    "popularTags": [
      "Ayurveda",
      "Vitamins",
      "BP Monitors",
      "Supplements"
    ],
    "featured": true
  },
  {
    "id": "cat_beauty",
    "name": "Beauty & Personal Care",
    "slug": "beauty-personal-care",
    "description": "Organic cosmetics, skincare serums, haircare, perfumes & grooming kits",
    "imageUrl": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
    "itemCount": "4,200+ items",
    "popularTags": [
      "Natural Skincare",
      "Makeup",
      "Haircare",
      "Fragrances"
    ],
    "featured": true
  },
  {
    "id": "cat_restaurants",
    "name": "Restaurants & Food",
    "slug": "restaurants-food",
    "description": "Gourmet spices, snacks, sweets, ready mixes & local regional culinary delicacies",
    "imageUrl": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    "itemCount": "1,700+ items",
    "popularTags": [
      "Artisanal Snacks",
      "Desi Sweets",
      "Gourmet Coffee",
      "Pickles"
    ],
    "featured": true
  },
  {
    "id": "cat_automobile",
    "name": "Automobile",
    "slug": "automobile",
    "description": "Car accessories, bike spare parts, helmets, riding gear & auto care essentials",
    "imageUrl": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
    "itemCount": "1,400+ items",
    "popularTags": [
      "Helmets",
      "Car Cleaners",
      "LED Headlights",
      "Bike Spares"
    ],
    "featured": false
  },
  {
    "id": "cat_education",
    "name": "Education & Coaching",
    "slug": "education-coaching",
    "description": "Study modules, exam preparation materials, course guides & learning kits",
    "imageUrl": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    "itemCount": "950+ items",
    "popularTags": [
      "Exam Prep",
      "Online Courses",
      "STEM Kits",
      "Study Guides"
    ],
    "featured": false
  },
  {
    "id": "cat_kids_baby",
    "name": "Kids & Baby",
    "slug": "kids-baby",
    "description": "Baby clothing, educational toys, strollers, feeding sets & nursery furniture",
    "imageUrl": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80",
    "itemCount": "2,300+ items",
    "popularTags": [
      "Wooden Toys",
      "Baby Care",
      "Cotton Onesies",
      "Learning Games"
    ],
    "featured": false
  },
  {
    "id": "cat_books",
    "name": "Books & Stationery",
    "slug": "books-stationery",
    "description": "Bestseller novels, academic textbooks, diaries, pens, art & craft supplies",
    "imageUrl": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
    "itemCount": "3,600+ items",
    "popularTags": [
      "Bestsellers",
      "Art Supplies",
      "Handmade Diaries",
      "Office Pens"
    ],
    "featured": false
  },
  {
    "id": "cat_hardware",
    "name": "Hardware & Construction",
    "slug": "hardware-construction",
    "description": "Power tools, safety equipment, fasteners, plumbing, electricals & building materials",
    "imageUrl": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
    "itemCount": "1,800+ items",
    "popularTags": [
      "Power Drills",
      "Hand Tools",
      "Electrical Fittings",
      "Safety Helmets"
    ],
    "featured": false
  },
  {
    "id": "cat_agriculture",
    "name": "Agriculture & Farming",
    "slug": "agriculture-farming",
    "description": "High-yield seeds, bio-fertilizers, drip irrigation, tools & farm equipment",
    "imageUrl": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
    "itemCount": "1,100+ items",
    "popularTags": [
      "Hybrid Seeds",
      "Bio Fertilizers",
      "Gardening Tools",
      "Drip Pipes"
    ],
    "featured": false
  },
  {
    "id": "cat_religious",
    "name": "Religious & Pooja",
    "slug": "religious-pooja",
    "description": "Brass diyas, agarbatti, pooja samagri, temple decor, idols & festive essentials",
    "imageUrl": "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=600&q=80",
    "itemCount": "1,650+ items",
    "popularTags": [
      "Brass Diyas",
      "Pure Agarbatti",
      "Pooja Kits",
      "Marble Idols"
    ],
    "featured": false
  },
  {
    "id": "cat_flowers",
    "name": "Flowers & Gifts",
    "slug": "flowers-gifts",
    "description": "Fresh flower bouquets, gift hampers, personalized keepsakes & festival combos",
    "imageUrl": "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80",
    "itemCount": "1,500+ items",
    "popularTags": [
      "Rose Bouquets",
      "Custom Hampers",
      "Dry Fruit Boxes",
      "Greetings"
    ],
    "featured": false
  },
  {
    "id": "cat_optical",
    "name": "Optical & Eyewear",
    "slug": "optical-eyewear",
    "description": "Polarized sunglasses, blue-light computer glasses, contact lenses & frame styles",
    "imageUrl": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",
    "itemCount": "1,350+ items",
    "popularTags": [
      "Blue Light Glasses",
      "Sunglasses",
      "Aviators",
      "Contact Lenses"
    ],
    "featured": false
  },
  {
    "id": "cat_sports",
    "name": "Sports & Fitness",
    "slug": "sports-fitness",
    "description": "Cricket gear, gym weights, yoga mats, resistance bands & outdoor equipment",
    "imageUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    "itemCount": "2,100+ items",
    "popularTags": [
      "Yoga Mats",
      "Dumbbells",
      "Cricket Bats",
      "Activewear"
    ],
    "featured": false
  },
  {
    "id": "cat_pet_shops",
    "name": "Pet Shops & Animal Care",
    "slug": "pet-shops-animal-care",
    "description": "Nutritious pet food, chew toys, leashes, grooming shampoo & pet bedding",
    "imageUrl": "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
    "itemCount": "1,250+ items",
    "popularTags": [
      "Dog Food",
      "Cat Treats",
      "Pet Toys",
      "Grooming Comb"
    ],
    "featured": false
  },
  {
    "id": "cat_travel",
    "name": "Travel & Transport",
    "slug": "travel-transport",
    "description": "Hard-top trolley luggage, travel backpacks, passport organizers & accessories",
    "imageUrl": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=600&q=80",
    "itemCount": "890+ items",
    "popularTags": [
      "Trolley Bags",
      "Travel Backpacks",
      "Neck Pillows",
      "Duffel Bags"
    ],
    "featured": false
  },
  {
    "id": "cat_professional",
    "name": "Professional Services",
    "slug": "professional-services",
    "description": "Accounting software tools, legal documentation packages & business assets",
    "imageUrl": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    "itemCount": "420+ items",
    "popularTags": [
      "GST Billing",
      "Legal Kits",
      "Digital Signatures",
      "Compliance"
    ],
    "featured": false
  },
  {
    "id": "cat_repair",
    "name": "Repair & Maintenance",
    "slug": "repair-maintenance",
    "description": "Spare components, soldering kits, diagnostic testers & repair accessories",
    "imageUrl": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "itemCount": "740+ items",
    "popularTags": [
      "Soldering Guns",
      "Multimeters",
      "Mobile Screwdrivers",
      "Lubricants"
    ],
    "featured": false
  },
  {
    "id": "cat_printing",
    "name": "Printing & Business Services",
    "slug": "printing-business-services",
    "description": "Custom business cards, packaging boxes, printed labels, flyers & merchandise",
    "imageUrl": "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=600&q=80",
    "itemCount": "1,600+ items",
    "popularTags": [
      "Custom Boxes",
      "Shipping Labels",
      "Business Cards",
      "Brand Packaging"
    ],
    "featured": false
  },
  {
    "id": "cat_wedding",
    "name": "Wedding & Events",
    "slug": "wedding-events",
    "description": "Bridal accessories, party decorations, stage lighting, invitations & favor hampers",
    "imageUrl": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    "itemCount": "1,850+ items",
    "popularTags": [
      "Bridal Lehengas",
      "Party Lights",
      "Wedding Cards",
      "Return Gifts"
    ],
    "featured": false
  },
  {
    "id": "cat_real_estate",
    "name": "Real Estate & Property",
    "slug": "real-estate-property",
    "description": "Architectural floorplans, smart door locks, security cameras & property furnishings",
    "imageUrl": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
    "itemCount": "630+ items",
    "popularTags": [
      "Smart Locks",
      "CCTV Cameras",
      "Modular Fixtures",
      "Interior Plans"
    ],
    "featured": false
  },
  {
    "id": "cat_local_services",
    "name": "Local & Home Services",
    "slug": "local-home-services",
    "description": "Cleaning supplies, deep clean chemicals, water purifiers & home maintenance kits",
    "imageUrl": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    "itemCount": "910+ items",
    "popularTags": [
      "Water Filters",
      "Organic Cleaners",
      "Pest Repellents",
      "Home Kits"
    ],
    "featured": false
  },
  {
    "id": "cat_entertainment",
    "name": "Entertainment & Recreation",
    "slug": "entertainment-recreation",
    "description": "Board games, gaming consoles, musical instruments, hobby kits & audio vinyls",
    "imageUrl": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    "itemCount": "1,150+ items",
    "popularTags": [
      "Acoustic Guitars",
      "Gaming Headsets",
      "Board Games",
      "Hobby Kits"
    ],
    "featured": false
  },
  {
    "id": "cat_other",
    "name": "Other / Specialty Shops",
    "slug": "other-specialty-shops",
    "description": "Rare collectibles, antique items, unique custom handmade artifacts & specialty crafts",
    "imageUrl": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
    "itemCount": "1,450+ items",
    "popularTags": [
      "Antiques",
      "Handicrafts",
      "Custom Gifts",
      "Rare Finds"
    ],
    "featured": false
  }
];

export function getCategoryBySlug(slug: string): MarketplaceCategory | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  return MARKETPLACE_CATEGORIES.find(
    (c) => c.slug === normalized || c.slug.replace(/-/g, '') === normalized.replace(/-/g, '')
  );
}

export function getCategoryByName(name: string): MarketplaceCategory | undefined {
  if (!name) return undefined;
  const normalized = name.toLowerCase().trim();
  return MARKETPLACE_CATEGORIES.find(
    (c) => c.name.toLowerCase() === normalized || c.slug === normalized
  );
}

export function resolveCategoryInfo(nameOrSlug: string): MarketplaceCategory {
  const match = getCategoryByName(nameOrSlug) || getCategoryBySlug(nameOrSlug);
  if (match) return match;
  return {
    id: 'cat_general',
    name: nameOrSlug || 'General Products',
    slug: (nameOrSlug || 'general').toLowerCase().replace(/\s+/g, '-'),
    description: 'Explore curated products and independent stores',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    itemCount: 'Active',
    popularTags: ['Verified Stores']
  };
}

export interface CategoryVendor {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  coverUrl?: string;
  tagline: string;
  description: string;
  businessType: "physical_shop" | "home_cloud";
  gstNumber: string;
  isGstExempt?: boolean;
  address: string;
  city: string;
  state: string;
  pincode: string;
  shopPhotos: string[];
  categories: string[];
  rating: number;
  reviewCount: number;
  joinedYear: number;
  featuredProducts?: {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    category: string;
    stock: number;
  }[];
}

export const MASTER_VENDORS: CategoryVendor[] = [
  // 1. Grocery & Supermarkets
  {
    id: "vnd_organic_harvest",
    name: "Green Earth Organics & Supermarket",
    slug: "green-earth-organics",
    tagline: "Farm-fresh daily groceries, organic millets & cold-pressed oils",
    description: "Certified organic provisions, fresh local farm produce, pulses, spices, and daily kitchen essentials sourced directly from Karnataka organic farmers.",
    businessType: "physical_shop",
    gstNumber: "29AABCG1234F1Z1",
    address: "Shop #14, 100 Feet Rd, Indiranagar",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560038",
    shopPhotos: [
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Grocery & Supermarkets", "Agriculture & Farming", "Pharmacy & Healthcare"],
    rating: 4.8,
    reviewCount: 142,
    joinedYear: 2023,
    featuredProducts: [
      {
        id: "prod_org_1",
        name: "Cold-Pressed Wood Churned Groundnut Oil (1 Litre)",
        price: 349,
        compareAtPrice: 420,
        images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80"],
        category: "Grocery & Supermarkets",
        stock: 45
      },
      {
        id: "prod_org_2",
        name: "Unpolished High-Protein Foxtail Millet (1kg)",
        price: 180,
        compareAtPrice: 220,
        images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"],
        category: "Grocery & Supermarkets",
        stock: 60
      },
      {
        id: "prod_org_3",
        name: "A2 Desi Cow Cultured Ghee (500ml)",
        price: 850,
        compareAtPrice: 999,
        images: ["https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80"],
        category: "Grocery & Supermarkets",
        stock: 30
      }
    ]
  },
  {
    id: "vnd_daily_fresh_supermart",
    name: "Sri Lakshmi Supermarket & Provisioners",
    slug: "sri-lakshmi-supermarket",
    tagline: "Trusted neighborhood supermarket with 10,000+ daily essentials",
    description: "Serving families for over 15 years with premium packaged foods, personal care, dry fruits, and kitchen staples at wholesale rates.",
    businessType: "physical_shop",
    gstNumber: "29AADCS9876Q1Z9",
    address: "24/1, 4th Block, Jayanagar",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560011",
    shopPhotos: [
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Grocery & Supermarkets"],
    rating: 4.6,
    reviewCount: 98,
    joinedYear: 2022,
    featuredProducts: [
      {
        id: "prod_lak_1",
        name: "Royal Kashmiri Walnut Kernels (500g Vacuum Pack)",
        price: 699,
        compareAtPrice: 850,
        images: ["https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80"],
        category: "Grocery & Supermarkets",
        stock: 25
      }
    ]
  },

  // 2. Clothing & Fashion
  {
    id: "vnd_royal_silk_sarees",
    name: "Royal Heritage Silks & Handlooms",
    slug: "royal-heritage-silks",
    tagline: "Authentic Pure Kanjeevaram & Banarasi Handloom Sarees",
    description: "Direct-from-weaver pure silk sarees with Silk Mark certification, bridal collections, hand-embroidered lehengas, and festive ethnic fashion.",
    businessType: "physical_shop",
    gstNumber: "33AABCR5432H1Z5",
    address: "Shop 12, Gandhi Bazaar Main Road",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600017",
    shopPhotos: [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Clothing & Fashion", "Wedding & Events", "Jewellery & Accessories"],
    rating: 4.9,
    reviewCount: 310,
    joinedYear: 2021,
    featuredProducts: [
      {
        id: "prod_silk_1",
        name: "Pure Kanchipuram Gold Zari Bridal Silk Saree",
        price: 14500,
        compareAtPrice: 18900,
        images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"],
        category: "Clothing & Fashion",
        stock: 8
      },
      {
        id: "prod_silk_2",
        name: "Handwoven Banarasi Georgette Suit Set with Dupatta",
        price: 4999,
        compareAtPrice: 6500,
        images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"],
        category: "Clothing & Fashion",
        stock: 15
      }
    ]
  },
  {
    id: "vnd_cloud_stitch_studio",
    name: "Urban Stitch & Craft Studio",
    slug: "urban-stitch-studio",
    tagline: "Sustainable handmade linen shirts & contemporary streetwear",
    description: "Independent designer boutique crafting small-batch breathable linen apparel and everyday modern staples.",
    businessType: "home_cloud",
    gstNumber: "",
    isGstExempt: true,
    address: "Design Loft #3, Koramangala 5th Block",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560095",
    shopPhotos: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Clothing & Fashion"],
    rating: 4.7,
    reviewCount: 76,
    joinedYear: 2024,
    featuredProducts: [
      {
        id: "prod_urb_1",
        name: "Pure French Linen Relaxed Cuban Collar Shirt",
        price: 1899,
        compareAtPrice: 2499,
        images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80"],
        category: "Clothing & Fashion",
        stock: 20
      }
    ]
  },

  // 3. Jewellery & Accessories
  {
    id: "vnd_jaipur_gem_craft",
    name: "Jaipur Gem Palace & Silver Studio",
    slug: "jaipur-gem-palace",
    tagline: "925 Sterling Silver, Kundan & Handcrafted Gemstone Jewellery",
    description: "Traditional Rajasthani Kundan sets, authentic 925 sterling silver rings, earrings, temple pendants, and astrological gemstones.",
    businessType: "physical_shop",
    gstNumber: "08AABCG7890J1Z4",
    address: "Johari Bazaar, Near Hawa Mahal",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302003",
    shopPhotos: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Jewellery & Accessories", "Wedding & Events"],
    rating: 4.9,
    reviewCount: 220,
    joinedYear: 2022,
    featuredProducts: [
      {
        id: "prod_jpr_1",
        name: "925 Hallmarked Sterling Silver Peacock Choker Necklace",
        price: 5499,
        compareAtPrice: 6999,
        images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"],
        category: "Jewellery & Accessories",
        stock: 12
      },
      {
        id: "prod_jpr_2",
        name: "Handmade Jadau Kundan Drop Earrings with Pearl Danglers",
        price: 2899,
        compareAtPrice: 3800,
        images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"],
        category: "Jewellery & Accessories",
        stock: 18
      }
    ]
  },

  // 4. Footwear
  {
    id: "vnd_leather_craft_hub",
    name: "Agra Heritage Footwear & Leather Works",
    slug: "agra-heritage-footwear",
    tagline: "Handcrafted pure leather formal shoes, boots & ethnic Kolhapuris",
    description: "Artisanal full-grain leather oxfords, brogues, comfort driving loafers, and authentic Kolhapuri chappals made with genuine leather soles.",
    businessType: "physical_shop",
    gstNumber: "09AABCL6543A1Z8",
    address: "Sadar Bazaar, Cantt Road",
    city: "Agra",
    state: "Uttar Pradesh",
    pincode: "282001",
    shopPhotos: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Footwear", "Clothing & Fashion"],
    rating: 4.8,
    reviewCount: 165,
    joinedYear: 2023,
    featuredProducts: [
      {
        id: "prod_ft_1",
        name: "Handcrafted Full-Grain Leather Oxford Formal Shoes (Tan)",
        price: 3299,
        compareAtPrice: 4999,
        images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"],
        category: "Footwear",
        stock: 22
      }
    ]
  },

  // 5. Electronics & Home Appliances
  {
    id: "vnd_apex_digital_appliances",
    name: "Apex Electronics & Smart Home Solutions",
    slug: "apex-electronics",
    tagline: "Authorized home electronics, 4K Smart TVs, kitchen mixers & audio",
    description: "Official brand warranties on home appliances, sound systems, microwaves, refrigerators, and smart home automation gadgets.",
    businessType: "physical_shop",
    gstNumber: "27AABCA3322D1Z2",
    address: "Lamington Road, Grant Road East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400007",
    shopPhotos: [
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Electronics & Home Appliances", "Mobile & Telecom", "Repair & Maintenance"],
    rating: 4.7,
    reviewCount: 410,
    joinedYear: 2020,
    featuredProducts: [
      {
        id: "prod_el_1",
        name: "100W Dolby Atmos Cinematic Soundbar with Wireless Subwoofer",
        price: 6999,
        compareAtPrice: 9999,
        images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80"],
        category: "Electronics & Home Appliances",
        stock: 14
      }
    ]
  },

  // 6. Mobile & Telecom
  {
    id: "vnd_spark_telecom_store",
    name: "Spark Mobile Hub & Accessories",
    slug: "spark-mobile-hub",
    tagline: "Smartphones, fast chargers, wireless ANC buds & smart wearables",
    description: "Genuine mobile handsets, premium cases, tempered protectors, high-speed 65W GaN fast chargers, and smart wearable accessories.",
    businessType: "physical_shop",
    gstNumber: "29AABCS1199K1Z6",
    address: "National Market, 5th Main, Gandhinagar",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560009",
    shopPhotos: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Mobile & Telecom", "Electronics & Home Appliances", "Repair & Maintenance"],
    rating: 4.8,
    reviewCount: 290,
    joinedYear: 2022,
    featuredProducts: [
      {
        id: "prod_mob_1",
        name: "Active Noise Cancelling True Wireless Earbuds (40h Battery)",
        price: 2499,
        compareAtPrice: 3999,
        images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"],
        category: "Mobile & Telecom",
        stock: 35
      }
    ]
  },

  // 7. Home & Furniture
  {
    id: "vnd_teak_wood_crafts",
    name: "Sheesham & Teak Heritage Woodworks",
    slug: "sheesham-teak-woodworks",
    tagline: "Solid Sheesham wood dining tables, sofas, beds & custom interior furniture",
    description: "Master carpenters offering handcrafted solid wood furniture with lifetime termite resistance warranty.",
    businessType: "physical_shop",
    gstNumber: "07AABCT8844P1Z3",
    address: "Kirti Nagar Furniture Market",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110015",
    shopPhotos: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Home & Furniture", "Hardware & Construction"],
    rating: 4.9,
    reviewCount: 180,
    joinedYear: 2021,
    featuredProducts: [
      {
        id: "prod_furn_1",
        name: "Solid Teak Wood 6-Seater Dining Table Set with Cushioned Chairs",
        price: 28999,
        compareAtPrice: 36000,
        images: ["https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80"],
        category: "Home & Furniture",
        stock: 5
      }
    ]
  },

  // 8. Pharmacy & Healthcare
  {
    id: "vnd_ayur_wellness_pharmacy",
    name: "Sanjeevani Ayurveda & Wellness Pharmacy",
    slug: "sanjeevani-ayurveda",
    tagline: "Authentic herbal remedies, Ayurvedic tonics & daily wellness supplements",
    description: "Ayush certified formulations, pure Shilajit resin, herbal immunity boosters, Chyawanprash, and pain relief oils.",
    businessType: "physical_shop",
    gstNumber: "29AABCS6622M1Z0",
    address: "Malleshwaram 8th Cross",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560003",
    shopPhotos: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Pharmacy & Healthcare", "Beauty & Personal Care"],
    rating: 4.9,
    reviewCount: 340,
    joinedYear: 2020,
    featuredProducts: [
      {
        id: "prod_med_1",
        name: "Pure Himalayan Shilajit Resin with Fulvic Acid (20g)",
        price: 999,
        compareAtPrice: 1499,
        images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"],
        category: "Pharmacy & Healthcare",
        stock: 50
      }
    ]
  },

  // 9. Beauty & Personal Care
  {
    id: "vnd_vedic_glow_botanicals",
    name: "Vedic Glow Artisan Botanicals",
    slug: "vedic-glow-botanicals",
    tagline: "Handcrafted cold-processed soaps, Kumkumadi oils & organic hair care",
    description: "Zero-chemical personal care made in small artisan batches with saffron, rosewater, sandalwood, and virgin coconut oil.",
    businessType: "home_cloud",
    gstNumber: "",
    isGstExempt: true,
    address: "Artisan Studio #4, Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500033",
    shopPhotos: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Beauty & Personal Care", "Pharmacy & Healthcare"],
    rating: 4.8,
    reviewCount: 112,
    joinedYear: 2023,
    featuredProducts: [
      {
        id: "prod_bt_1",
        name: "Pure Kashmiri Saffron & Kumkumadi Miraculous Night Glow Oil (30ml)",
        price: 799,
        compareAtPrice: 1199,
        images: ["https://images.unsplash.com/photo-1608248597359-00f7e49ebcb6?auto=format&fit=crop&w=600&q=80"],
        category: "Beauty & Personal Care",
        stock: 40
      }
    ]
  },

  // 10. Restaurants & Food
  {
    id: "vnd_royal_spice_kitchen",
    name: "Dilli Darbar Spices & Gourmet Sweets",
    slug: "dilli-darbar-gourmet",
    tagline: "Handcrafted artisan sweets, gourmet dry fruit barfis & roasted snacks",
    description: "Famous gourmet delicacies, authentic Kaju Katli, Motichoor Laddoos, and roasted namkeens packed fresh for doorstep delivery.",
    businessType: "physical_shop",
    gstNumber: "07AABCD4433E1Z7",
    address: "Chandni Chowk",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110006",
    shopPhotos: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Restaurants & Food", "Grocery & Supermarkets"],
    rating: 4.9,
    reviewCount: 520,
    joinedYear: 2021,
    featuredProducts: [
      {
        id: "prod_fd_1",
        name: "Artisan Kaju Katli Box with Pure Silver Vark (500g)",
        price: 550,
        compareAtPrice: 650,
        images: ["https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80"],
        category: "Restaurants & Food",
        stock: 30
      }
    ]
  },

  // 11. Religious & Pooja
  {
    id: "vnd_vedic_pooja_bhandar",
    name: "Sri Balaji Pooja Samagri & Brass Bhandar",
    slug: "sri-balaji-pooja-samagri",
    tagline: "Pure brass idols, temple diyas, havan samagri, natural dhoop & camphor",
    description: "Complete sacred ritual provisions, brass Panchamrit sets, pure Bhimseni camphor, organic cow dung dhoop, and Ganga jal.",
    businessType: "physical_shop",
    gstNumber: "29AABCS8877L1Z9",
    address: "Temple Street, Basavanagudi",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560004",
    shopPhotos: [
      "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Religious & Pooja", "Home & Furniture"],
    rating: 4.9,
    reviewCount: 195,
    joinedYear: 2021,
    featuredProducts: [
      {
        id: "prod_pj_1",
        name: "Handcrafted Pure Brass Deepam Lamp Diya (Pair - 12 Inch)",
        price: 1899,
        compareAtPrice: 2400,
        images: ["https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=600&q=80"],
        category: "Religious & Pooja",
        stock: 25
      }
    ]
  },

  // 12. Sports & Fitness
  {
    id: "vnd_power_pro_sports",
    name: "Olympia Sports & Fitness Gear",
    slug: "olympia-sports-gear",
    tagline: "Professional cricket bats, badminton racquets, gym weights & activewear",
    description: "Authorized dealer for Kashmir & English willow cricket bats, high-tension badminton racquets, dumbbells, yoga mats, and resistance bands.",
    businessType: "physical_shop",
    gstNumber: "29AABCO9944F1Z8",
    address: "Brigade Road Commercial Complex",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    shopPhotos: [
      "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80"
    ],
    categories: ["Sports & Fitness", "Footwear", "Clothing & Fashion"],
    rating: 4.8,
    reviewCount: 160,
    joinedYear: 2022,
    featuredProducts: [
      {
        id: "prod_sp_1",
        name: "Grade 1 Kashmir Willow Cricket Bat with Full Grain Protection",
        price: 2899,
        compareAtPrice: 3800,
        images: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80"],
        category: "Sports & Fitness",
        stock: 18
      }
    ]
  }
];

export function getVendorsForCategory(categorySlugOrName: string): CategoryVendor[] {
  const query = categorySlugOrName.toLowerCase().replace(/-/g, " ");
  
  const matches = MASTER_VENDORS.filter((v) => {
    return v.categories.some((c) => {
      const cNorm = c.toLowerCase().replace(/-/g, " ");
      return cNorm === query || cNorm.includes(query) || query.includes(cNorm);
    });
  });

  // Also search dynamic localStorage vendors registered by users on this device
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("vendor_store_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const vData = JSON.parse(raw);
            const vCats: string[] = Array.isArray(vData.categories)
              ? vData.categories
              : vData.category
              ? [vData.category]
              : [];
            
            const isMatch = vCats.some((c) => {
              const cNorm = c.toLowerCase().replace(/-/g, " ");
              return cNorm === query || cNorm.includes(query) || query.includes(cNorm);
            });

            if (isMatch && !matches.some((m) => m.id === vData.id || m.slug === vData.slug)) {
              matches.push({
                id: vData.id || key.replace("vendor_store_", ""),
                name: vData.name || "Verified Seller Store",
                slug: vData.slug || slugify(vData.name || "store"),
                tagline: vData.tagline || `Specialist in ${vCats.join(", ")}`,
                description: vData.description || "Verified independent seller store on V2 Business Marketplace.",
                businessType: vData.businessType || "physical_shop",
                gstNumber: vData.gstNumber || "",
                isGstExempt: vData.isGstExempt,
                address: vData.address || "Commercial Storefront",
                city: vData.city || "Bangalore",
                state: vData.state || "Karnataka",
                pincode: vData.pincode || "560001",
                shopPhotos: vData.shopPhotos || [],
                categories: vCats,
                rating: 5.0,
                reviewCount: 1,
                joinedYear: 2026,
              });
            }
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }

  // If still empty, synthesize an active verified merchant for realistic discovery
  if (matches.length === 0) {
    const matchedCategory = MARKETPLACE_CATEGORIES.find(
      (c) => c.slug === categorySlugOrName || c.name.toLowerCase() === query
    );
    if (matchedCategory) {
      matches.push({
        id: `vnd_${matchedCategory.slug}`,
        name: `Prime ${matchedCategory.name} Merchants`,
        slug: `prime-${matchedCategory.slug}`,
        tagline: `Authentic, verified sellers & specialists in ${matchedCategory.name}`,
        description: `Offering premier catalog items and certified authentic merchandise under ${matchedCategory.name}.`,
        businessType: "physical_shop",
        gstNumber: "29AABCP1122D1Z5",
        address: "Commercial Hub, Main Market",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        shopPhotos: [matchedCategory.imageUrl],
        categories: [matchedCategory.name],
        rating: 4.8,
        reviewCount: 88,
        joinedYear: 2023,
        featuredProducts: []
      });
    }
  }

  return matches;
}

export function getVendorByIdOrSlug(idOrSlug: string): CategoryVendor | undefined {
  if (!idOrSlug) return undefined;
  
  // 1. Check master vendors list
  const found = MASTER_VENDORS.find(
    (v) => v.id.toLowerCase() === idOrSlug.toLowerCase() || v.slug.toLowerCase() === idOrSlug.toLowerCase()
  );
  if (found) return found;

  // 2. Check localStorage custom registered vendor
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const direct = localStorage.getItem(`vendor_store_${idOrSlug}`);
      if (direct) {
        const vData = JSON.parse(direct);
        return {
          id: idOrSlug,
          name: vData.name || "Custom Seller Store",
          slug: vData.slug || idOrSlug,
          tagline: vData.tagline || "Verified Seller Storefront",
          description: vData.description || "",
          businessType: vData.businessType || "physical_shop",
          gstNumber: vData.gstNumber || "",
          isGstExempt: vData.isGstExempt,
          address: vData.address || "Official Storefront",
          city: vData.city || "Bangalore",
          state: vData.state || "Karnataka",
          pincode: vData.pincode || "560001",
          shopPhotos: vData.shopPhotos || [],
          categories: Array.isArray(vData.categories) ? vData.categories : [vData.category || "General"],
          rating: 5.0,
          reviewCount: 1,
          joinedYear: 2026,
        };
      }
    }
  } catch {}

  return undefined;
}
