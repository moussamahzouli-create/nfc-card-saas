import { PrismaClient } from '@prisma/client';

import fs from 'fs';
import path from 'path';

// Handle Vercel Serverless environment where filesystem is read-only
function getDatabaseUrl(): string {
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (isServerless) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    if (!fs.existsSync(tmpDbPath)) {
      const sourceDb = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(sourceDb)) {
        try {
          fs.copyFileSync(sourceDb, tmpDbPath);
          console.log(`[DB] Successfully copied SQLite database to ${tmpDbPath}`);
        } catch (e) {
          console.error(`[DB] Error copying database:`, e);
        }
      } else {
        console.warn('[DB] Warning: prisma/dev.db not found at', sourceDb);
      }
    }
    const url = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = url;
    return url;
  }

  const localDb = path.join(process.cwd(), 'prisma', 'dev.db');
  const url = `file:${localDb}`;
  process.env.DATABASE_URL = url;
  return url;
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}



