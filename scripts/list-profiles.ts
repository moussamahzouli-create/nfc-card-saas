import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const profiles = await db.profile.findMany({ take: 3 });
  console.log('---PROFILES---');
  profiles.forEach(p => {
    console.log(`ID: ${p.id} | Name: ${p.name} | Slug: ${p.slug}`);
  });
  await db.$disconnect();
}
main();
