import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Handle Vercel Serverless environment where filesystem is read-only
function initDatabaseUrl() {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL;
  }

  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (isServerless) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          try {
            fs.copyFileSync(cand, tmpDbPath);
            break;
          } catch (e) {
            console.error('Failed to copy database to /tmp:', e);
          }
        }
      }
    }
    const url = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = url;
    return url;
  }

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./prisma/dev.db';
  }
  return process.env.DATABASE_URL;
}

initDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

