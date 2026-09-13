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
    "imageUrl": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
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
    "imageUrl": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
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
    "imageUrl": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
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
    "imageUrl": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80",
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
    "imageUrl": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
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
    "imageUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
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
    "imageUrl": "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=600&q=80",
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
    "featured": false,
    "name": "Agriculture & Farming"
  },
  {
    "id": "cat_religious",
    "name": "Religious & Pooja",
    "slug": "religious-pooja",
    "description": "Brass diyas, agarbatti, pooja samagri, temple decor, idols & festive essentials",
    "imageUrl": "https://images.unsplash.com/photo-1609803384069-1cac59463b96?auto=format&fit=crop&w=600&q=80",
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
    "imageUrl": "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80",
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
    "imageUrl": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80",
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
    "imageUrl": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80",
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
    "description": "Spare components, soldering kits, diagnostic testers & repair accessories",
    "imageUrl": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "itemCount": "740+ items",
    "popularTags": [
      "Soldering Guns",
      "Multimeters",
      "Mobile Screwdrivers",
      "Lubricants"
    ],
    "featured": false,
    "slug": "repair-maintenance"
  },
  {
    "id": "cat_printing",
    "name": "Printing & Business Services",
    "slug": "printing-business-services",
    "description": "Custom business cards, packaging boxes, printed labels, flyers & merchandise",
    "imageUrl": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
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
    "imageUrl": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
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
    "imageUrl": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
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
