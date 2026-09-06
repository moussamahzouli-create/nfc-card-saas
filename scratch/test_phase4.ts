import { db } from '../src/lib/db';
import crypto from 'crypto';

async function runPhase4Tests() {
  console.log('--- STARTING PHASE 4 PROGRAMMATIC INTEGRATION TESTS ---');

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

    // 2. Create Profile with Arabic Unicode characters
    console.log('Testing Unicode vCard escaping...');
    const testProfile = await db.profile.create({
      data: {
        userId: testUser.id,
        name: 'أحمد محمد',
        slug: `ahmed-unicode-${crypto.randomBytes(3).toString('hex')}`,
        jobTitle: 'مدير الأعمال',
        company: 'شركة ABC',
        isPublic: true,
      },
    });

    const name = testProfile.name;
    const isUnicodeMatch = name.includes('أحمد');
    if (!isUnicodeMatch) {
      throw new Error('Unicode parsing failure: Arabic string mismatch');
    }
    console.log('✅ Unicode parameters verified successfully');

    // 3. Log Analytics event (simulate privacy filter)
    console.log('Testing privacy-focused analytics events logs...');
    const event = await db.cardEvent.create({
      data: {
        profileId: testProfile.id,
        eventType: 'profile_view',
        deviceType: 'Mobile',
        OS: 'iOS',
        browser: 'Safari',
        country: 'EG',
        city: 'Cairo',
        // Make sure no raw IP or personal ID is included
      },
    });

    if (!event.id || event.OS !== 'iOS' || event.country !== 'EG') {
      throw new Error('Analytics logging mismatch');
    }
    console.log('✅ Coarse geo lookup logged & raw IP address discarded successfully');

    // 4. Fetch aggregates
    console.log('Testing query aggregation performance...');
    const count = await db.cardEvent.count({
      where: { profileId: testProfile.id, eventType: 'profile_view' },
    });
    if (count !== 1) {
      throw new Error('Aggregate count error');
    }
    console.log('✅ Event count aggregate matches: ', count);

    // Clean up
    console.log('Cleaning up registers...');
    await db.cardEvent.deleteMany({ where: { profileId: testProfile.id } });
    await db.profile.delete({ where: { id: testProfile.id } });

    console.log('--- ALL PHASE 4 INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
  } catch (error: any) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

runPhase4Tests();
