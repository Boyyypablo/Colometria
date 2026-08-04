import { PrismaClient } from "@prisma/client";

/**
 * Neon / Vercel Marketplace às vezes injeta POSTGRES_* em vez de DATABASE_URL.
 * Normaliza antes de instanciar o Prisma Client.
 */
function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) return;
  const fallback =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (fallback) {
    process.env.DATABASE_URL = fallback;
  }
}

ensureDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
