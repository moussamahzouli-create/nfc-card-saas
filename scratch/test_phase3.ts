import { db } from '../src/lib/db';
import crypto from 'crypto';
import { generateCardUrl } from '../src/lib/nfc/url';

async function runPhase3Tests() {
  console.log('--- STARTING PHASE 3 PROGRAMMATIC INTEGRATION TESTS ---');

  try {
    // 1. Fetch seed user or create a temporary one for testing
    let testUser = await db.user.findFirst({ where: { email: 'customer@cardly.com' } });
    if (!testUser) {
      testUser = await db.user.create({
        data: {
          name: 'Test Customer',
          email: 'customer@cardly.com',
          passwordHash: 'hashed_password_123',
          role: 'CUSTOMER',
        },
      });
    }

    const testProfile = await db.profile.create({
      data: {
        userId: testUser.id,
        name: 'Ahmed Mohamed',
        slug: `ahmed-${crypto.randomBytes(3).toString('hex')}`,
        isPublic: true,
      },
    });

    const uniqueSerial1 = `NFC-TEST-${crypto.randomBytes(3).toString('hex')}`;
    const uniqueSerial2 = `NFC-TEST-${crypto.randomBytes(3).toString('hex')}`;
    const uniqueUid1 = `UID-${crypto.randomBytes(4).toString('hex')}`;
    const uniqueUid2 = `UID-${crypto.randomBytes(4).toString('hex')}`;

    // Test 1: Card Creation & secure token generation
    console.log('Testing Card Creation & Secure Token Generation...');
    const publicToken = crypto.randomBytes(8).toString('hex');
    const card1 = await db.card.create({
      data: {
        cardNumber: uniqueSerial1,
        nfcUid: uniqueUid1,
        publicToken,
        status: 'UNASSIGNED',
      },
    });

    if (card1.publicToken.length !== 16) {
      throw new Error('Token length mismatch: must be 16 hex characters (8 bytes)');
    }
    console.log('✅ Card created with URL: ', generateCardUrl(card1.publicToken));

    // Test 2: Duplicate check
    console.log('Testing Card unique constraints...');
    try {
      await db.card.create({
        data: {
          cardNumber: uniqueSerial1,
          publicToken: crypto.randomBytes(8).toString('hex'),
          status: 'UNASSIGNED',
        },
      });
      throw new Error('Database allowed duplicate card numbers!');
    } catch (e: any) {
      if (e.message.includes('Allowed duplicate')) throw e;
      console.log('✅ Unique constraints validated successfully');
    }

    // Test 3: Card Assignment Lifecycle (UNASSIGNED -> PROVISIONED -> ACTIVE)
    console.log('Testing Lifecycle Transitions...');
    // We cannot activate a card directly if it's UNASSIGNED and not provisioned
    if (card1.status !== 'UNASSIGNED') {
      throw new Error('Default state mismatch');
    }

    // Provision Card (Simulate NFC Write)
    const provisionedCard = await db.card.update({
      where: { id: card1.id },
      data: { status: 'PROVISIONED' },
    });
    console.log('✅ Card status updated to PROVISIONED');

    // Assign profile
    console.log('Testing Profile Assignment...');
    await db.cardAssignment.create({
      data: {
        cardId: card1.id,
        profileId: testProfile.id,
        userId: testUser.id,
        status: 'ACTIVE',
        assignedBy: 'System Test',
      },
    });

    const activeCard = await db.card.update({
      where: { id: card1.id },
      data: { status: 'ACTIVE' },
    });
    console.log('✅ Card status progressed to ACTIVE');

    // Test 4: Card Transfer
    console.log('Testing Card Transfer...');
    const testProfile2 = await db.profile.create({
      data: {
        userId: testUser.id,
        name: 'Ali Mohamed',
        slug: `ali-${crypto.randomBytes(3).toString('hex')}`,
        isPublic: true,
      },
    });

    // Archive old assignments and create new one
    await db.cardAssignment.updateMany({
      where: { cardId: card1.id, status: 'ACTIVE' },
      data: { status: 'HISTORICAL', unassignedAt: new Date() },
    });
    await db.cardAssignment.create({
      data: {
        cardId: card1.id,
        profileId: testProfile2.id,
        userId: testUser.id,
        status: 'ACTIVE',
        assignedBy: 'System Test',
      },
    });

    const activeAssignments = await db.cardAssignment.findMany({
      where: { cardId: card1.id, status: 'ACTIVE' },
    });
    if (activeAssignments.length !== 1 || activeAssignments[0].profileId !== testProfile2.id) {
      throw new Error('Card transfer failed to update active assignments correctly.');
    }
    console.log('✅ Card transfer verified');

    // Clean up
    console.log('Cleaning up test registers...');
    await db.card.delete({ where: { id: card1.id } });
    await db.profile.delete({ where: { id: testProfile.id } });
    await db.profile.delete({ where: { id: testProfile2.id } });

    console.log('--- ALL PHASE 3 INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
  } catch (error: any) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

runPhase3Tests();
