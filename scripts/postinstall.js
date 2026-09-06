const { execSync } = require('child_process');

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    'postgresql://dummy:dummy@localhost:5432/dummy';
}

try {
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
} catch (e) {
  console.warn('[Postinstall] prisma generate warning:', e.message);
}
