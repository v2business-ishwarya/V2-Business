import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // Create admin user if not exists
  const adminEmail = "admin@example.com";
  const adminPassword = "Admin@123";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin User",
        passwordHash: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Admin user created");
  }

  // Seed all 30 marketplace categories
  const categoriesList = [
    { name: "Grocery & Supermarkets", description: "Daily fresh vegetables, fruits, staples, organic foods & household provisions", imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" },
    { name: "Clothing & Fashion", description: "Ethnic wear, western trends, designer sarees, menswear & kidswear", imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80" },
    { name: "Jewellery & Accessories", description: "Fine gold & silver jewellery, fashion accessories, watches & gemstones", imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80" },
    { name: "Footwear", description: "Formal shoes, sneakers, comfort sandals, ethnic juttis & sports footwear", imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80" },
    { name: "Electronics & Home Appliances", description: "Smart TVs, refrigerators, audio systems, microwave ovens & home tech", imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80" },
    { name: "Mobile & Telecom", description: "Smartphones, tablets, mobile accessories, chargers, cases & wearables", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80" },
    { name: "Home & Furniture", description: "Wooden sofas, beds, ergonomic chairs, dining tables & modern decor", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80" },
    { name: "Pharmacy & Healthcare", description: "Ayurvedic remedies, vitamins, medical devices, first aid & health supplements", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80" },
    { name: "Beauty & Personal Care", description: "Organic cosmetics, skincare serums, haircare, perfumes & grooming kits", imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80" },
    { name: "Restaurants & Food", description: "Gourmet spices, snacks, sweets, ready mixes & local regional culinary delicacies", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80" },
    { name: "Automobile", description: "Car accessories, bike spare parts, helmets, riding gear & auto care essentials", imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80" },
    { name: "Education & Coaching", description: "Study modules, exam preparation materials, course guides & learning kits", imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80" },
    { name: "Kids & Baby", description: "Baby clothing, educational toys, strollers, feeding sets & nursery furniture", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80" },
    { name: "Books & Stationery", description: "Bestseller novels, academic textbooks, diaries, pens, art & craft supplies", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80" },
    { name: "Hardware & Construction", description: "Power tools, safety equipment, fasteners, plumbing, electricals & building materials", imageUrl: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=600&q=80" },
    { name: "Agriculture & Farming", description: "High-yield seeds, bio-fertilizers, drip irrigation, tools & farm equipment", imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80" },
    { name: "Religious & Pooja", description: "Brass diyas, agarbatti, pooja samagri, temple decor, idols & festive essentials", imageUrl: "https://images.unsplash.com/photo-1609803384069-1cac59463b96?auto=format&fit=crop&w=600&q=80" },
    { name: "Flowers & Gifts", description: "Fresh flower bouquets, gift hampers, personalized keepsakes & festival combos", imageUrl: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80" },
    { name: "Optical & Eyewear", description: "Polarized sunglasses, blue-light computer glasses, contact lenses & frame styles", imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80" },
    { name: "Sports & Fitness", description: "Cricket gear, gym weights, yoga mats, resistance bands & outdoor equipment", imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80" },
    { name: "Pet Shops & Animal Care", description: "Nutritious pet food, chew toys, leashes, grooming shampoo & pet bedding", imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80" },
    { name: "Travel & Transport", description: "Hard-top trolley luggage, travel backpacks, passport organizers & accessories", imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80" },
    { name: "Professional Services", description: "Accounting software tools, legal documentation packages & business assets", imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80" },
    { name: "Repair & Maintenance", description: "Spare components, soldering kits, diagnostic testers & repair accessories", imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80" },
    { name: "Printing & Business Services", description: "Custom business cards, packaging boxes, printed labels, flyers & merchandise", imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80" },
    { name: "Wedding & Events", description: "Bridal accessories, party decorations, stage lighting, invitations & favor hampers", imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80" },
    { name: "Real Estate & Property", description: "Architectural floorplans, smart door locks, security cameras & property furnishings", imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80" },
    { name: "Local & Home Services", description: "Cleaning supplies, deep clean chemicals, water purifiers & home maintenance kits", imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80" },
    { name: "Entertainment & Recreation", description: "Board games, gaming consoles, musical instruments, hobby kits & audio vinyls", imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80" },
    { name: "Other / Specialty Shops", description: "Rare collectibles, antique items, unique custom handmade artifacts & specialty crafts", imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80" },
  ];

  for (const cat of categoriesList) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description, imageUrl: cat.imageUrl },
      create: { name: cat.name, description: cat.description, imageUrl: cat.imageUrl },
    });
  }
  console.log("30 Marketplace Categories ensured with high-res photos and descriptions");

  // Seed default marketplace settings
  const defaultSettings = [
    { key: "PLATFORM_COMMISSION_RATE", value: { rate: "0.10" }, description: "Default platform commission rate (10%)" },
    { key: "MAINTENANCE_MODE", value: { enabled: false }, description: "Platform maintenance mode" },
    { key: "PLATFORM_NAME", value: { name: "V2 Business" }, description: "Marketplace platform name" },
    { key: "PLATFORM_CURRENCY", value: { code: "INR", symbol: "₹" }, description: "Primary platform currency" },
  ];
  for (const s of defaultSettings) {
    await (prisma as any).marketplaceSettings.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("Marketplace settings ensured");

  // Seed default payment providers
  const paymentProviders = [
    { name: "razorpay", isEnabled: true },
    { name: "cashfree", isEnabled: false },
    { name: "mock", isEnabled: true },
  ];
  for (const p of paymentProviders) {
    const existing = await (prisma as any).paymentProviderSettings.findFirst({ where: { name: p.name } });
    if (!existing) {
      await (prisma as any).paymentProviderSettings.create({ data: p });
    }
  }
  console.log("Payment providers ensured");

  // Seed default delivery providers
  const deliveryProviders = [
    { name: "delhivery", isEnabled: true },
    { name: "shiprocket", isEnabled: true },
    { name: "own", isEnabled: true },
    { name: "platform", isEnabled: true },
  ];
  for (const d of deliveryProviders) {
    const existing = await (prisma as any).deliveryProviderSettings.findFirst({ where: { name: d.name } });
    if (!existing) {
      await (prisma as any).deliveryProviderSettings.create({ data: d });
    }
  }
  console.log("Delivery providers ensured");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
