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

console.log('[Build] Using DATABASE_URL:', process.env.DATABASE_URL ? 'Configured (PostgreSQL)' : 'NOT FOUND');

try {
  console.log('[Build] Running prisma generate...');
  execSync('node node_modules/prisma/build/index.js generate', { stdio: 'inherit', env: process.env });

  console.log('[Build] Running next build...');
  execSync('npx next build', { stdio: 'inherit', env: process.env });
  console.log('[Build] Successfully completed!');
} catch (error) {
  console.error('[Build] Error during build process:', error);
  process.exit(1);
}


