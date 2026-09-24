import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  sqlitePragmasConfigured?: boolean;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Optimize SQLite for high concurrency (Write-Ahead Logging + 5s busy timeout)
if (!globalForPrisma.sqlitePragmasConfigured && process.env.DATABASE_URL?.includes('.db')) {
  globalForPrisma.sqlitePragmasConfigured = true;
  Promise.all([
    prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;'),
    prisma.$queryRawUnsafe('PRAGMA busy_timeout = 5000;'),
    prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;'),
  ]).catch((err) => {
    // Non-fatal if using PostgreSQL or external provider
    console.warn('SQLite PRAGMA WAL initialization notice:', err.message);
  });
}
