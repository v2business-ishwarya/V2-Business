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
  tagline?: string;
  description?: string;
  businessType?: "physical_shop" | "home_cloud";
  gstNumber?: string;
  isGstExempt?: boolean;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  shopPhotos?: string[];
  categories?: string[];
  rating?: number;
  reviewCount?: number;
  joinedYear?: number;
}

export function getVendorsForCategory(categorySlugOrName: string): CategoryVendor[] {
  const query = (categorySlugOrName || "").toLowerCase().replace(/-/g, " ").trim();
  const matches: CategoryVendor[] = [];

  // Look up actual registered vendors from local store profiles
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
              const cNorm = (c || "").toLowerCase().replace(/-/g, " ").trim();
              return cNorm === query || cNorm.includes(query) || query.includes(cNorm);
            });

            if (isMatch && !matches.some((m) => m.id === vData.id || m.slug === vData.slug)) {
              matches.push({
                id: vData.id || key.replace("vendor_store_", ""),
                name: vData.name || "Registered Seller Store",
                slug: vData.slug || slugify(vData.name || "store"),
                tagline: vData.tagline || "",
                description: vData.description || "",
                businessType: vData.businessType || "physical_shop",
                gstNumber: vData.gstNumber || "",
                isGstExempt: vData.isGstExempt,
                address: vData.address || "",
                city: vData.city || "",
                state: vData.state || "",
                pincode: vData.pincode || "",
                shopPhotos: vData.shopPhotos || [],
                categories: vCats,
                rating: 5.0,
                reviewCount: 0,
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

  return matches;
}

export function getVendorByIdOrSlug(idOrSlug: string): CategoryVendor | undefined {
  if (!idOrSlug) return undefined;

  // Check actual registered vendor in localStorage
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const direct = localStorage.getItem(`vendor_store_${idOrSlug}`);
      if (direct) {
        const vData = JSON.parse(direct);
        return {
          id: idOrSlug,
          name: vData.name || "Seller Store",
          slug: vData.slug || idOrSlug,
          tagline: vData.tagline || "",
          description: vData.description || "",
          businessType: vData.businessType || "physical_shop",
          gstNumber: vData.gstNumber || "",
          isGstExempt: vData.isGstExempt,
          address: vData.address || "",
          city: vData.city || "",
          state: vData.state || "",
          pincode: vData.pincode || "",
          shopPhotos: vData.shopPhotos || [],
          categories: Array.isArray(vData.categories) ? vData.categories : vData.category ? [vData.category] : [],
          rating: 5.0,
          reviewCount: 0,
          joinedYear: 2026,
        };
      }

      // Check all registered stores for matching slug
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("vendor_store_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const vData = JSON.parse(raw);
            if (vData.slug === idOrSlug || vData.id === idOrSlug) {
              return {
                id: vData.id || key.replace("vendor_store_", ""),
                name: vData.name || "Seller Store",
                slug: vData.slug || idOrSlug,
                tagline: vData.tagline || "",
                description: vData.description || "",
                businessType: vData.businessType || "physical_shop",
                gstNumber: vData.gstNumber || "",
                isGstExempt: vData.isGstExempt,
                address: vData.address || "",
                city: vData.city || "",
                state: vData.state || "",
                pincode: vData.pincode || "",
                shopPhotos: vData.shopPhotos || [],
                categories: Array.isArray(vData.categories) ? vData.categories : vData.category ? [vData.category] : [],
                rating: 5.0,
                reviewCount: 0,
                joinedYear: 2026,
              };
            }
          }
        }
      }
    }
  } catch {}

  return undefined;
}
