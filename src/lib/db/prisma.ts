import "server-only";
import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client.
 *
 * In dev, Next.js HMR re-imports modules → multiple PrismaClient
 * instances spawn → connection pool exhaustion. Pin to globalThis
 * to share across module reloads.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
