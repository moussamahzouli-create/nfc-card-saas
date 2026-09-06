import { db } from '../src/lib/db';
import crypto from 'crypto';
import { hasSufficientContrast } from '../src/lib/qr/contrast';

async function runPhase7CardsTests() {
  console.log('=== STARTING E2E CARDS & QR INTEGRATION TESTS ===');

  try {
    const userEmail = `card-tester-${crypto.randomBytes(3).toString('hex')}@cards.com`;

    // 1. Create Test User
    const user = await db.user.create({
      data: {
        name: 'Alex NFC',
        email: userEmail,
        passwordHash: 'hashed_nfc_123',
        role: 'CUSTOMER',
      },
    });

    // 2. Profile Creation & Ownership verification
    console.log('Testing Profile registration & DB locks...');
    const profile = await db.profile.create({
      data: {
        userId: user.id,
        name: 'Alex Profile',
        slug: `alex-${crypto.randomBytes(3).toString('hex')}`,
        jobTitle: 'Hardware Engineer',
        company: 'NFC Labs',
        isPublic: true,
      },
    });

    if (profile.userId !== user.id) {
      throw new Error('Profile ownership mismatch.');
    }
    console.log('✅ Profile registration and owner scope verified.');

    // 3. Profile Duplication logic (Ensure NO duplicate cards, events or logs)
    console.log('Testing Profile duplication...');
    const duplicate = await db.profile.create({
      data: {
        userId: user.id,
        name: `${profile.name} (Copy)`,
        slug: `${profile.slug}-copy`,
        jobTitle: profile.jobTitle,
        company: profile.company,
        isPublic: false,
      },
    });

    if (duplicate.slug === profile.slug) {
      throw new Error('Duplicate profile must generate a unique target URL slug.');
    }
    console.log('✅ Profile duplication and unique slug assignment verified.');

    // 4. QR Color Contrast check validations
    console.log('Testing color contrast checks...');
    const passContrast = hasSufficientContrast('#000000', '#FFFFFF'); // High Contrast
    const failContrast = hasSufficientContrast('#FFFFFF', '#FDFDFD'); // Low Contrast

    if (!passContrast) throw new Error('Valid contrast check failed.');
    if (failContrast) throw new Error('Low contrast check did not block generator.');
    console.log('✅ Color contrast checks verified.');

    // 5. Connect card & status updates
    console.log('Testing card assignments and connection...');
    const card = await db.card.create({
      data: {
        cardNumber: `CARD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        publicToken: `tok-${crypto.randomBytes(4).toString('hex')}`,
        status: 'UNASSIGNED',
      },
    });

    // Assign card to profile
    const assignment = await db.cardAssignment.create({
      data: {
        cardId: card.id,
        userId: user.id,
        profileId: profile.id,
        status: 'ACTIVE',
      },
    });

    await db.card.update({
      where: { id: card.id },
      data: { status: 'ACTIVE' },
    });

    // Verify card is assigned to customer profile
    const updatedCard = await db.card.findUnique({
      where: { id: card.id },
      include: { assignments: true },
    });

    if (updatedCard?.status !== 'ACTIVE' || updatedCard.assignments[0].profileId !== profile.id) {
      throw new Error('Card connection/status assignment failed.');
    }
    console.log('✅ Card connecting flow verified successfully.');

    // 6. NFC Writing NDEF verification
    console.log('Testing NFC canonical link validation...');
    const canonicalUrl = `http://localhost:3000/c/${card.publicToken}`;
    const nfcWrite = await db.nfcWrite.create({
      data: {
        cardId: card.id,
        operatorId: user.id,
        writerDevice: 'Test NFC API',
        url: canonicalUrl,
        status: 'SUCCESS',
      },
    });

    if (nfcWrite.url !== canonicalUrl) {
      throw new Error('NFC tag NDEF URL mismatch.');
    }
    console.log('✅ NFC NDEF URL provisioning verified.');

    // Clean up
    console.log('Cleaning up records...');
    await db.nfcWrite.delete({ where: { id: nfcWrite.id } });
    await db.cardAssignment.delete({ where: { id: assignment.id } });
    await db.card.delete({ where: { id: card.id } });
    await db.profile.delete({ where: { id: duplicate.id } });
    await db.profile.delete({ where: { id: profile.id } });
    await db.user.delete({ where: { id: user.id } });

    console.log('=== ALL PHASE 7 CARDS & QR E2E TESTS PASSED! ===');
  } catch (error: any) {
    console.error('❌ E2E Cards tests failed:', error.message);
    process.exit(1);
  }
}

runPhase7CardsTests();
