const { execSync } = require('child_process');

process.env.DATABASE_URL = 'file:./prisma/dev.db';

try {
  execSync('node node_modules/prisma/build/index.js generate', { stdio: 'inherit', env: process.env });
} catch (e) {
  console.warn('[Postinstall] prisma generate warning:', e.message);
}

