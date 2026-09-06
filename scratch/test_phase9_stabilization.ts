import { db } from '../src/lib/db';
import crypto from 'crypto';
import { getUserUsage } from '../src/lib/billing/limits';

async function runPhase9Tests() {
  console.log('=== STARTING PHASE 9 PLATFORM STABILIZATION TESTS ===');

  try {
    const userEmail = `p9-tester-${crypto.randomBytes(3).toString('hex')}@cards.com`;

    // 1. Create Test User
    const user = await db.user.create({
      data: {
        name: 'Moussa Tester',
        email: userEmail,
        passwordHash: 'hashed_moussa_123',
        role: 'CUSTOMER',
        accessType: 'SUBSCRIPTION',
      },
    });

    // 2. Create Profile (with a specific slug)
    const profileSlug = `moussa-${crypto.randomBytes(3).toString('hex')}`;
    const profile = await db.profile.create({
      data: {
        userId: user.id,
        name: 'Moussa Origin',
        slug: profileSlug,
        jobTitle: 'Developer',
        isPublic: true,
      },
    });

    console.log(`✅ Profile created with permanent slug: /c/${profile.slug}`);

    // Verify updating profile details does NOT alter or regenerate slug
    const updatedProfile = await db.profile.update({
      where: { id: profile.id },
      data: {
        name: 'Moussa Ahmed',
        jobTitle: 'Senior Developer'
      }
    });

    if (updatedProfile.slug !== profileSlug) {
      throw new Error('Profile update incorrectly regenerated or altered slug!');
    }
    console.log('✅ Profile update verified (slug remained unchanged).');

    // 3. Test Super Admin limits bypass
    console.log('Testing SUPER_ADMIN limits bypass...');
    await db.user.update({
      where: { id: user.id },
      data: { role: 'SUPER_ADMIN' }
    });

    const superAdminUsage = await getUserUsage(user.id);
    if (superAdminUsage.maxProfiles !== -1 || superAdminUsage.maxCards !== -1) {
      throw new Error(`Limits bypass failed for SUPER_ADMIN role. Got maxProfiles: ${superAdminUsage.maxProfiles}`);
    }
    console.log('✅ SUPER_ADMIN limits bypass verified (unlimited profiles/cards).');

    // 4. Test Direct Service limits bypass
    console.log('Testing DIRECT_SERVICE limits bypass...');
    await db.user.update({
      where: { id: user.id },
      data: {
        role: 'CUSTOMER',
        accessType: 'DIRECT_SERVICE'
      }
    });

    const directUsage = await getUserUsage(user.id);
    if (directUsage.maxProfiles !== -1 || directUsage.maxCards !== -1) {
      throw new Error(`Limits bypass failed for DIRECT_SERVICE accessType. Got maxProfiles: ${directUsage.maxProfiles}`);
    }
    console.log('✅ DIRECT_SERVICE limits bypass verified.');

    // 5. Test Card Assignment & LOST resolution
    console.log('Testing card lookup and LOST state resolution...');
    const card = await db.card.create({
      data: {
        cardNumber: `CARD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        publicToken: `tok-${crypto.randomBytes(4).toString('hex')}`,
        status: 'UNASSIGNED',
      },
    });

    const assignment = await db.cardAssignment.create({
      data: {
        cardId: card.id,
        userId: user.id,
        profileId: profile.id,
        status: 'ACTIVE',
      },
    });

    // Mark card as LOST
    await db.card.update({
      where: { id: card.id },
      data: { status: 'LOST' }
    });

    const lostCard = await db.card.findUnique({
      where: { id: card.id }
    });

    if (lostCard?.status !== 'LOST') {
      throw new Error('Card status was not successfully updated to LOST in the database.');
    }
    console.log('✅ Card assignment and LOST status transitions verified.');

    // Clean up
    console.log('Cleaning up records...');
    await db.cardAssignment.delete({ where: { id: assignment.id } });
    await db.card.delete({ where: { id: card.id } });
    await db.profile.delete({ where: { id: profile.id } });
    await db.user.delete({ where: { id: user.id } });

    console.log('=== ALL PHASE 9 PLATFORM STABILIZATION TESTS PASSED! ===');
  } catch (error: any) {
    console.error('❌ E2E Phase 9 tests failed:', error.message);
    process.exit(1);
  }
}

runPhase9Tests();
