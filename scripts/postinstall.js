const { execSync } = require('child_process');

const NEON_DEFAULT_URL =
  'postgresql://neondb_owner:npg_ha53JFEDUYKy@ep-misty-shape-awowluq4-pooler.c-12.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

const pgUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')
    ? process.env.DATABASE_URL
    : (process.env.POSTGRES_PRISMA_URL ||
       process.env.POSTGRES_URL ||
       NEON_DEFAULT_URL);

process.env.DATABASE_URL = pgUrl;

try {
  execSync('node node_modules/prisma/build/index.js generate', { stdio: 'inherit', env: process.env });
} catch (e) {
  console.warn('[Postinstall] prisma generate warning:', e.message);
}


