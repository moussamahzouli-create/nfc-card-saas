import { PrismaClient } from '@prisma/client';

import fs from 'fs';
import path from 'path';

// Default Neon PostgreSQL connection pooler string
const NEON_DEFAULT_URL =
  'postgresql://neondb_owner:npg_ha53JFEDUYKy@ep-misty-shape-awowluq4-pooler.c-12.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
    return process.env.DATABASE_URL;
  }
  if (process.env.POSTGRES_PRISMA_URL && process.env.POSTGRES_PRISMA_URL.startsWith('postgres')) {
    return process.env.POSTGRES_PRISMA_URL;
  }
  if (process.env.POSTGRES_URL && process.env.POSTGRES_URL.startsWith('postgres')) {
    return process.env.POSTGRES_URL;
  }
  if (process.env.POSTGRES_URL_NON_POOLING && process.env.POSTGRES_URL_NON_POOLING.startsWith('postgres')) {
    return process.env.POSTGRES_URL_NON_POOLING;
  }
  return NEON_DEFAULT_URL;
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

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




