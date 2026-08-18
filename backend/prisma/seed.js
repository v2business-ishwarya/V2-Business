"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
  // Create admin user if not exists
  const adminEmail = "admin@example.com";
  const adminPassword = "Admin@123";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 10);
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
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map
