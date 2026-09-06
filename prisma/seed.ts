import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Hash passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Plans
  console.log('Creating plans...');
  const freePlan = await prisma.plan.upsert({
    where: { id: 'plan-free' },
    update: {},
    create: {
      id: 'plan-free',
      name: 'FREE',
      maxCards: 1,
      maxStorage: 10,
      analytics: false,
      customDomain: false,
      removeBranding: false,
      teamMembers: 0,
      apiAccess: false,
      price: 0.0,
      currency: 'USD',
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { id: 'plan-pro' },
    update: {},
    create: {
      id: 'plan-pro',
      name: 'PRO',
      maxCards: 5,
      maxStorage: 100,
      analytics: true,
      customDomain: true,
      removeBranding: true,
      teamMembers: 2,
      apiAccess: false,
      price: 9.99,
      currency: 'USD',
    },
  });

  const businessPlan = await prisma.plan.upsert({
    where: { id: 'plan-business' },
    update: {},
    create: {
      id: 'plan-business',
      name: 'BUSINESS',
      maxCards: 50,
      maxStorage: 1000,
      analytics: true,
      customDomain: true,
      removeBranding: true,
      teamMembers: 10,
      apiAccess: true,
      price: 29.99,
      currency: 'USD',
    },
  });

  // 3. Create Products
  console.log('Creating products...');
  const pvcCard = await prisma.product.upsert({
    where: { slug: 'pvc-card' },
    update: {},
    create: {
      name: 'PVC NFC Card',
      slug: 'pvc-card',
      sku: 'PROD-NFC-PVC-01',
      description: 'Durable plastic NFC business card with custom matte print.',
      price: 15.00,
      currency: 'USD',
      image: '/images/pvc-card.jpg',
      nfcType: 'NTAG213',
    },
  });

  const metalCard = await prisma.product.upsert({
    where: { slug: 'metal-card' },
    update: {},
    create: {
      name: 'Metal NFC Card',
      slug: 'metal-card',
      sku: 'PROD-NFC-MTL-02',
      description: 'Ultra-premium stainless steel NFC card with matte black finishing.',
      price: 45.00,
      currency: 'USD',
      image: '/images/metal-card.jpg',
      nfcType: 'NTAG215',
    },
  });

  // 4. Create Templates
  console.log('Creating templates...');
  const modernTemplate = await prisma.template.upsert({
    where: { slug: 'modern' },
    update: {},
    create: {
      name: 'Modern Executive',
      slug: 'modern',
      colorsJson: JSON.stringify({
        primary: '#3B82F6',
        secondary: '#1E293B',
        background: '#F8FAFC',
        text: '#0F172A',
        buttonBg: '#3B82F6',
        buttonText: '#FFFFFF',
      }),
      fontsJson: JSON.stringify({
        fontFamily: 'Inter, sans-serif',
      }),
      stylesJson: JSON.stringify({
        borderRadius: '12px',
        shadow: 'sm',
      }),
    },
  });

  // 5. Create Users
  console.log('Creating users...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cardly.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@cardly.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@cardly.com' },
    update: {},
    create: {
      name: 'Demo Customer',
      email: 'customer@cardly.com',
      passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });

  // 6. Create Demo Organization
  console.log('Creating organization...');
  const organization = await prisma.organization.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme',
      ownerId: customer.id,
      members: {
        create: {
          userId: customer.id,
          role: 'OWNER',
        },
      },
    },
  });

  // 7. Create Demo Profile
  console.log('Creating profile...');
  const profile = await prisma.profile.upsert({
    where: { slug: 'jane-doe' },
    update: {},
    create: {
      userId: customer.id,
      organizationId: organization.id,
      type: 'PROFESSIONAL',
      name: 'Jane Doe',
      slug: 'jane-doe',
      jobTitle: 'VP of Sales',
      company: 'Acme Corporation',
      bio: 'Helping teams close more deals and scale operations globally.',
      email: 'jane@acme.com',
      phone: '+1234567890',
      website: 'https://acme.com',
      templateId: modernTemplate.id,
      components: {
        createMany: {
          data: [
            {
              type: 'Phone',
              title: 'Mobile Phone',
              value: '+1234567890',
              sortOrder: 0,
            },
            {
              type: 'Email',
              title: 'Work Email',
              value: 'jane@acme.com',
              sortOrder: 1,
            },
            {
              type: 'Website',
              title: 'Acme Website',
              url: 'https://acme.com',
              sortOrder: 2,
            },
          ],
        },
      },
      socialLinks: {
        createMany: {
          data: [
            {
              platform: 'LinkedIn',
              username: 'janedoe',
              url: 'https://linkedin.com/in/janedoe',
              sortOrder: 0,
            },
            {
              platform: 'X',
              username: 'janedoe',
              url: 'https://x.com/janedoe',
              sortOrder: 1,
            },
          ],
        },
      },
    },
  });

  // 8. Create Card Batch
  console.log('Creating card batch...');
  const batch = await prisma.cardBatch.upsert({
    where: { batchNumber: 'BATCH-2026-001' },
    update: {},
    create: {
      batchNumber: 'BATCH-2026-001',
      quantity: 100,
      productName: 'Metal NFC Card',
    },
  });

  // 9. Create NFC Cards
  console.log('Creating NFC cards...');
  const card1 = await prisma.card.upsert({
    where: { publicToken: '8fK29Lm' },
    update: {},
    create: {
      cardNumber: 'CARD-NFC-001',
      publicToken: '8fK29Lm',
      nfcUid: '04:7A:B2:8F:D1:4C:80',
      productId: metalCard.id,
      batchId: batch.id,
      status: 'ACTIVE',
      activatedAt: new Date(),
      assignments: {
        create: {
          userId: customer.id,
          profileId: profile.id,
        },
      },
    },
  });

  // Create an unassigned card
  await prisma.card.upsert({
    where: { publicToken: 't5G9mP1' },
    update: {},
    create: {
      cardNumber: 'CARD-NFC-002',
      publicToken: 't5G9mP1',
      nfcUid: '04:8F:C3:9D:E2:5E:81',
      productId: pvcCard.id,
      batchId: batch.id,
      status: 'UNASSIGNED',
    },
  });

  // 10. Subscriptions
  console.log('Creating subscription...');
  await prisma.subscription.upsert({
    where: { providerSubscriptionId: 'sub_test_01' },
    update: {},
    create: {
      userId: customer.id,
      planId: proPlan.id,
      provider: 'stripe',
      providerSubscriptionId: 'sub_test_01',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
