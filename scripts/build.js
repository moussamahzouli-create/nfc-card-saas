const { execSync } = require('child_process');

// Ensure DATABASE_URL is available from any Vercel Postgres / Neon alias
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
}

console.log('[Build] Using DATABASE_URL:', process.env.DATABASE_URL ? 'Configured' : 'NOT FOUND');

try {
  console.log('[Build] Running prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
    console.log('[Build] Pushing database schema to PostgreSQL...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: process.env });
  } else {
    console.log('[Build] Skipping prisma db push (no postgresql DATABASE_URL found at build time)');
  }

  console.log('[Build] Running next build...');
  execSync('npx next build', { stdio: 'inherit', env: process.env });
  console.log('[Build] Successfully completed!');
} catch (error) {
  console.error('[Build] Error during build process:', error);
  process.exit(1);
}
