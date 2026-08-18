import dotenv from "dotenv";
import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

// This module is imported while Express routes are registered, before server.ts runs.
// Load the backend environment here so Prisma always receives DATABASE_URL.
dotenv.config();

// Create Prisma client instance
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
