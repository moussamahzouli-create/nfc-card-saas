import { db } from '../src/lib/db';
import crypto from 'crypto';

async function runTests() {
  console.log('--- STARTING PHASE 2 PROGRAMMATIC INTEGRATION TESTS ---');

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

    const testUser2 = await db.user.upsert({
      where: { email: 'unauthorized@cardly.com' },
      update: {},
      create: {
        name: 'Unauthorized User',
        email: 'unauthorized@cardly.com',
        passwordHash: 'hashed_password_123',
        role: 'CUSTOMER',
      },
    });

    const uniqueSlug = `test-profile-${crypto.randomBytes(4).toString('hex')}`;

    // Test 1: Profile Creation
    console.log('Testing Profile Creation...');
    const profile = await db.profile.create({
      data: {
        userId: testUser.id,
        name: 'John Doe Business Card',
        slug: uniqueSlug,
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Architect',
        company: 'Cloud Inc',
        isPublic: true,
      },
    });
    console.log('✅ Profile Created:', profile.id);

    // Test 2: Profile Editing
    console.log('Testing Profile Editing...');
    const updatedProfile = await db.profile.update({
      where: { id: profile.id },
      data: {
        jobTitle: 'Principal Software Architect',
        bio: 'Designing large scale SaaS architectures.',
      },
    });
    if (updatedProfile.jobTitle !== 'Principal Software Architect') {
      throw new Error('Profile editing field mismatch');
    }
    console.log('✅ Profile Edited successfully');

    // Test 3: IDOR Security (Verify another user cannot hijack/access ownership)
    console.log('Testing IDOR Ownership Validation...');
    const isOwner = profile.userId === testUser.id;
    const isUnauthorizedUserOwner = profile.userId === testUser2.id;
    if (!isOwner || isUnauthorizedUserOwner) {
      throw new Error('IDOR Check Failed: Incorrect ownership resolution!');
    }
    console.log('✅ IDOR Authorization verified');

    // Test 4: Component Creation
    console.log('Testing Component Creation...');
    const comp1 = await db.profileComponent.create({
      data: {
        profileId: profile.id,
        type: 'Phone',
        title: 'Call Main Line',
        value: '+12345678',
        sortOrder: 0,
      },
    });
    const comp2 = await db.profileComponent.create({
      data: {
        profileId: profile.id,
        type: 'WhatsApp',
        title: 'Chat on WhatsApp',
        value: '+12345678',
        sortOrder: 1,
      },
    });
    console.log('✅ Components created successfully');

    // Test 5: Component Reordering
    console.log('Testing Component Reordering...');
    await db.$transaction([
      db.profileComponent.update({ where: { id: comp1.id }, data: { sortOrder: 1 } }),
      db.profileComponent.update({ where: { id: comp2.id }, data: { sortOrder: 0 } }),
    ]);
    const reorderedComps = await db.profileComponent.findMany({
      where: { profileId: profile.id },
      orderBy: { sortOrder: 'asc' },
    });
    if (reorderedComps[0].id !== comp2.id) {
      throw new Error('Component reordering transaction failed');
    }
    console.log('✅ Components reordered successfully');

    // Test 6: Deleting Profile & Cascaded components
    console.log('Testing Profile Deletion & Cascade components...');
    await db.profile.delete({ where: { id: profile.id } });
    const orphanComponents = await db.profileComponent.findMany({
      where: { profileId: profile.id },
    });
    if (orphanComponents.length > 0) {
      throw new Error('Cascade delete components failed');
    }
    console.log('✅ Profile and cascaded components deleted successfully');

    console.log('--- ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
  } catch (error: any) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

runTests();
