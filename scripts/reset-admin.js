const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await db.user.update({
    where: { id: '68d31eff-6c85-4e4f-bd26-c64344d6cb47' },
    data: {
      passwordHash: hash,
      email: 'admin@cardly.io',    // normalize to lowercase
    }
  });
  console.log('Password reset done.');
  console.log('Email: admin@cardly.io');
  console.log('Password: admin123');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
