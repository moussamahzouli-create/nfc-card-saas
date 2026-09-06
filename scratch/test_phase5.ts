import { db } from '../src/lib/db';
import crypto from 'crypto';

async function runPhase5Tests() {
  console.log('--- STARTING PHASE 5 PROGRAMMATIC INTEGRATION TESTS ---');

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

    // 2. Create Product and Product Variant
    console.log('Testing Product & Variant creation...');
    const product = await db.product.create({
      data: {
        name: 'PVC Card Test',
        slug: `pvc-test-${crypto.randomBytes(3).toString('hex')}`,
        sku: `SKU-${crypto.randomBytes(3).toString('hex')}`,
        price: 15.0, // base price
        nfcType: 'Ntag213',
        status: 'ACTIVE',
      },
    });

    const variant = await db.productVariant.create({
      data: {
        productId: product.id,
        name: 'Gold Variant',
        sku: `SKU-VAR-${crypto.randomBytes(3).toString('hex')}`,
        price: 1999, // $19.99 (minor units)
        stock: 50,
        status: 'ACTIVE',
      },
    });

    if (variant.price !== 1999) {
      throw new Error('Variant minor price unit mismatch');
    }
    console.log('✅ Product and Variant registers created successfully');

    // 3. Create Coupon code
    console.log('Testing Coupons...');
    const couponCode = `PROMO-${crypto.randomBytes(3).toString('hex')}`.toUpperCase();
    const coupon = await db.coupon.create({
      data: {
        code: couponCode,
        type: 'PERCENTAGE',
        value: 10, // 10% discount
        active: true,
      },
    });

    if (coupon.value !== 10) {
      throw new Error('Coupon mapping mismatch');
    }
    console.log('✅ Coupon promo code registered');

    // 4. Plan Limits Centralized Enforcement Verification
    console.log('Testing Subscription Plan Upgrade & Limits...');
    let planPro = await db.plan.findFirst({ where: { name: 'PRO' } });
    if (!planPro) {
      planPro = await db.plan.create({
        data: {
          name: 'PRO',
          maxProfiles: 5,
          maxCards: 5,
          price: 9.99,
          currency: 'USD',
          analyticsRetentionDays: 365,
          customBranding: true,
          advancedAnalytics: true,
        },
      });
    }

    // Create active subscription
    const sub = await db.subscription.create({
      data: {
        userId: testUser.id,
        planId: planPro.id,
        provider: 'MockProvider',
        providerSubscriptionId: `sub_${crypto.randomBytes(4).toString('hex')}`,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const { getUserUsage } = await import('../src/lib/billing/limits');
    const report = await getUserUsage(testUser.id);
    
    if (report.planName !== 'PRO' || report.maxProfiles !== 5) {
      throw new Error('SaaS limits mapping failed');
    }
    console.log('✅ Limit checking verification matches expected Plan variables');

    // Clean up
    console.log('Cleaning up registers...');
    await db.subscription.deleteMany({ where: { userId: testUser.id } });
    await db.coupon.delete({ where: { id: coupon.id } });
    await db.productVariant.delete({ where: { id: variant.id } });
    await db.product.delete({ where: { id: product.id } });

    console.log('--- ALL PHASE 5 INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
  } catch (error: any) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

runPhase5Tests();
