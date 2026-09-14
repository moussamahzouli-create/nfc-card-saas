const { execSync } = require('child_process');

process.env.DATABASE_URL = 'file:./prisma/dev.db';

console.log('[Build] Using DATABASE_URL:', process.env.DATABASE_URL);

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

