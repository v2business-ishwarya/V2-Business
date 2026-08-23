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

  // Create some sample categories
  const categories = ["Electronics", "Fashion", "Home & Kitchen", "Books"];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat },
    });
  }
  console.log("Categories ensured");

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
