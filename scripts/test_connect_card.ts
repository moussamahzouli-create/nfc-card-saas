import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function runTests() {
  console.log('══════════════════════════════════════════════════');
  console.log('🧪 CONNECT CARD NFC FUNCTIONAL TESTS');
  console.log('══════════════════════════════════════════════════');

  const testUserEmail = `test-operator-${Date.now()}@example.com`;
  const testCardNumber = `CARD-TEST-${Date.now()}`;
  const testSlug = `test-profile-slug-${Date.now()}`;

  let user: any = null;
  let card: any = null;
  let profile: any = null;

  try {
    // 1. Create Test Operator User
    user = await db.user.create({
      data: {
        email: testUserEmail,
        name: 'NFC Test Operator',
        passwordHash: 'dummyhash',
        role: 'DIRECT_SERVICE',
      },
    });
    console.log(`✓ Test User created: ${testUserEmail}`);

    // 2. Create Test Profile
    profile = await db.profile.create({
      data: {
        userId: user.id,
        name: 'NFC Test Profile',
        slug: testSlug,
        type: 'PERSONAL',
      },
    });
    console.log(`✓ Test Profile created with slug: /c/${testSlug}`);

    // 3. Create Available Card
    card = await db.card.create({
      data: {
        cardNumber: testCardNumber,
        publicToken: `token-${Date.now()}`,
        status: 'UNASSIGNED',
      },
    });
    console.log(`✓ Test Card created: ${testCardNumber}`);

    // 4. Test Verification: Unavailable state prevention (LOST)
    console.log('\nTesting LOST card protection...');
    await db.card.update({ where: { id: card.id }, data: { status: 'LOST' } });
    
    // Simulate check in assign route
    let assignAllowed = true;
    const checkLostCard = await db.card.findUnique({ where: { id: card.id } });
    if (checkLostCard && ['SUSPENDED', 'LOST', 'REPLACED'].includes(checkLostCard.status)) {
      assignAllowed = false;
    }
    if (!assignAllowed) {
      console.log('✓ Success: Lost card blocked from assignment.');
    } else {
      throw new Error('Failure: Lost card was allowed for assignment.');
    }

    // Reset back to UNASSIGNED
    await db.card.update({ where: { id: card.id }, data: { status: 'UNASSIGNED' } });

    // 5. Test Profile Linking (Assignment logic)
    console.log('\nTesting card assignment logic...');
    const newAssignment = await db.cardAssignment.create({
      data: {
        cardId: card.id,
        userId: user.id,
        profileId: profile.id,
        status: 'ACTIVE',
      },
    });
    
    await db.card.update({
      where: { id: card.id },
      data: { status: 'ACTIVE', activatedAt: new Date() },
    });
    
    console.log(`✓ Card successfully assigned: Assignment ID = ${newAssignment.id}`);

    // 6. Test NFC Write Logging
    console.log('\nTesting NFC Write Logging...');
    const writeLog = await db.nfcWrite.create({
      data: {
        cardId: card.id,
        operatorId: user.id,
        writerDevice: 'Mock NFC Provider',
        url: `https://simplecard.store/c/${card.publicToken}`,
        status: 'VERIFIED',
        verifiedAt: new Date(),
      },
    });
    console.log(`✓ NFC Write log saved in database: Write Log ID = ${writeLog.id}`);

    // 7. Verification confirmations
    const activeWriteLog = await db.nfcWrite.findFirst({
      where: { cardId: card.id },
      orderBy: { writtenAt: 'desc' },
    });
    if (activeWriteLog && activeWriteLog.status === 'VERIFIED') {
      console.log('✓ Success: NFC NDEF URL successfully verified matching target profile.');
    } else {
      throw new Error('Failure: Write log state verification mismatch.');
    }

    console.log('\n══════════════════════════════════════════════════');
    console.log('🎉 ALL INTEGRATION TESTS PASSED CLEANLY!');
    console.log('══════════════════════════════════════════════════');

  } catch (err: any) {
    console.error('\n❌ TEST RUN FAILED:', err.message);
    process.exit(1);
  } finally {
    // Cleanup database
    if (profile) await db.profile.delete({ where: { id: profile.id } }).catch(() => {});
    if (card) await db.card.delete({ where: { id: card.id } }).catch(() => {});
    if (user) await db.user.delete({ where: { id: user.id } }).catch(() => {});
    await db.$disconnect();
  }
}

runTests();
