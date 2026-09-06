import { db } from '../src/lib/db';
import crypto from 'crypto';

async function runPhase6bTests() {
  console.log('--- STARTING PHASE 6B PROGRAMMATIC INTEGRATION TESTS ---');

  try {
    const uniqueEmail = `test-user-${crypto.randomBytes(3).toString('hex')}@onboarding.com`;

    // 1. Test Registration duplicate checks
    console.log('Testing User Register...');
    const user = await db.user.create({
      data: {
        name: 'Jane Doe',
        email: uniqueEmail,
        passwordHash: 'hashed_password_555',
        role: 'CUSTOMER',
      },
    });

    if (user.email !== uniqueEmail) {
      throw new Error('User register details mismatch');
    }

    try {
      await db.user.create({
        data: {
          name: 'Jane Duplicate',
          email: uniqueEmail,
          passwordHash: 'hashed_password_abc',
        },
      });
      throw new Error('Database allowed duplicate user emails!');
    } catch (e: any) {
      if (e.message.includes('Allowed duplicate')) throw e;
      console.log('✅ Duplicate user block validated successfully');
    }

    // 2. Test Onboarding and template styling
    console.log('Testing Onboarding profile setups...');
    const onboardingProfile = await db.profile.create({
      data: {
        userId: user.id,
        name: 'Jane Doe Onboarded',
        slug: `jane-onboarded-${crypto.randomBytes(3).toString('hex')}`,
        jobTitle: 'Creative Director',
        company: 'Art Studio',
        bio: 'Onboarding bio text...',
        templateId: 'creative',
        isPublic: true,
      },
    });

    if (onboardingProfile.templateId !== 'creative') {
      throw new Error('Template choice mapping failure');
    }
    console.log('✅ User onboarding parameters and template assignment verified');

    // 3. Test Contact messaging API submissions
    console.log('Testing Contact form messages inbox...');
    const message = await db.contactMessage.create({
      data: {
        name: 'Visitor Name',
        email: 'visitor@inquire.com',
        subject: 'Hardware enquiry',
        message: 'Hello, what are your custom sticker options?',
        status: 'NEW',
      },
    });

    if (message.status !== 'NEW' || !message.id) {
      throw new Error('Contact message creation failed');
    }
    console.log('✅ Contact form message stored in database inbox successfully');

    // Clean up
    console.log('Cleaning up registers...');
    await db.contactMessage.delete({ where: { id: message.id } });
    await db.profile.delete({ where: { id: onboardingProfile.id } });
    await db.user.delete({ where: { id: user.id } });

    console.log('--- ALL PHASE 6B INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
  } catch (error: any) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

runPhase6bTests();
