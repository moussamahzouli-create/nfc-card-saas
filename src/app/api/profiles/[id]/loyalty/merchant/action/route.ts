import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canAccessMerchantLoyalty } from '@/lib/auth/merchant-loyalty-access';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

function cleanPhone(raw: string): string {
  if (!raw) return '';
  let cleaned = raw
    .replace(/[٠-٩]/g, d => (d.charCodeAt(0) - 1632).toString())
    .replace(/[۰-۹]/g, d => (d.charCodeAt(0) - 1776).toString())
    .replace(/[\s\-\.\(\)]/g, '')
    .trim();

  if (cleaned.startsWith('+212')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('00212')) {
    cleaned = '0' + cleaned.slice(5);
  } else if (cleaned.startsWith('212') && cleaned.length >= 11) {
    cleaned = '0' + cleaned.slice(3);
  } else if (/^[5-7]\d{8}$/.test(cleaned)) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}

// POST /api/profiles/[id]/loyalty/merchant/action
// Direct cashier/merchant actions on customers (Add Stamp, Redeem, Reset, Update Name, Delete, Fetch History)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const auth = await canAccessMerchantLoyalty(id, req);

    if (!auth.allowed || !auth.profile) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const action = body?.action; // 'ADD_STAMP' | 'REDEEM_REWARD' | 'RESET' | 'UPDATE_NAME' | 'DELETE_CUSTOMER' | 'GET_HISTORY'
    const customerId = body?.customerId;
    const rawPhone = body?.phone;
    const phone = cleanPhone(rawPhone);

    if (!phone && !customerId) {
      return NextResponse.json({ error: 'Numéro de téléphone ou identifiant client requis' }, { status: 400 });
    }

    const { settings } = auth;
    const targetStamps = Number(settings?.targetStamps) || 10;

    // Find customer for this profile (scoped strictly by profileId)
    let customer = customerId
      ? await db.loyaltyCustomer.findFirst({
          where: {
            id: customerId,
            profileId: id,
          },
        })
      : null;

    if (!customer && phone) {
      customer = await db.loyaltyCustomer.findUnique({
        where: {
          profileId_phone: {
            profileId: id,
            phone,
          },
        },
      });
    }

    const activePhone = customer?.phone || phone;

    // Handle GET_HISTORY action
    if (action === 'GET_HISTORY') {
      if (!customer) {
        return NextResponse.json({ customer: null, logs: [] });
      }

      const logs = await db.loyaltyLog.findMany({
        where: {
          profileId: id,
          phone: activePhone,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return NextResponse.json({
        customer: {
          id: customer.id,
          phone: customer.phone,
          customerName: customer.customerName,
          stampsCount: customer.stampsCount,
          rewardsEarned: customer.rewardsEarned,
          lastStampAt: customer.lastStampAt,
          createdAt: customer.createdAt,
          isRewardReady: customer.stampsCount >= targetStamps,
        },
        logs,
      });
    }

    // Auto-create customer if doesn't exist for ADD_STAMP
    if (!customer) {
      if (action === 'ADD_STAMP') {
        customer = await db.loyaltyCustomer.create({
          data: {
            profileId: id,
            phone,
            customerName: body.customerName || null,
            stampsCount: 0,
            rewardsEarned: 0,
          },
        });
      } else {
        return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
      }
    }

    // 1. ADD_STAMP
    if (action === 'ADD_STAMP') {
      const now = new Date();
      const updatedStamps = customer.stampsCount + 1;

      const updated = await db.$transaction(async (tx) => {
        const c = await tx.loyaltyCustomer.update({
          where: { id: customer!.id },
          data: {
            stampsCount: updatedStamps,
            lastStampAt: now,
            customerName: body.customerName !== undefined ? (body.customerName?.trim() || null) : customer!.customerName,
          },
        });

        const log = await tx.loyaltyLog.create({
          data: {
            profileId: id,
            customerId: c.id,
            phone: activePhone,
            action: 'STAMP_ADDED',
            stampsCount: updatedStamps,
          },
        });

        return { customer: c, log };
      });

      return NextResponse.json({
        success: true,
        message: 'Tampon ajouté avec succès (+1)',
        customer: {
          id: updated.customer.id,
          phone: updated.customer.phone,
          customerName: updated.customer.customerName,
          stampsCount: updated.customer.stampsCount,
          rewardsEarned: updated.customer.rewardsEarned,
          lastStampAt: updated.customer.lastStampAt,
          isRewardReady: updated.customer.stampsCount >= targetStamps,
        },
      });
    }

    // 2. REDEEM_REWARD
    if (action === 'REDEEM_REWARD') {
      if (customer.stampsCount < targetStamps) {
        return NextResponse.json({
          error: `Le client n'a que ${customer.stampsCount}/${targetStamps} tampons nécessaires.`,
        }, { status: 400 });
      }

      const remainingStamps = Math.max(0, customer.stampsCount - targetStamps);

      const updated = await db.$transaction(async (tx) => {
        const c = await tx.loyaltyCustomer.update({
          where: { id: customer!.id },
          data: {
            stampsCount: remainingStamps,
            rewardsEarned: customer!.rewardsEarned + 1,
            lastStampAt: new Date(),
          },
        });

        const log = await tx.loyaltyLog.create({
          data: {
            profileId: id,
            customerId: c.id,
            phone: activePhone,
            action: 'REWARD_REDEEMED',
            stampsCount: remainingStamps,
          },
        });

        return { customer: c, log };
      });

      return NextResponse.json({
        success: true,
        message: 'Récompense validée avec succès ! 🎉',
        customer: {
          id: updated.customer.id,
          phone: updated.customer.phone,
          customerName: updated.customer.customerName,
          stampsCount: updated.customer.stampsCount,
          rewardsEarned: updated.customer.rewardsEarned,
          lastStampAt: updated.customer.lastStampAt,
          isRewardReady: updated.customer.stampsCount >= targetStamps,
        },
      });
    }

    // 3. RESET
    if (action === 'RESET') {
      const newStampsCount = body.stampsCount !== undefined ? Math.max(0, Number(body.stampsCount)) : 0;

      const updated = await db.$transaction(async (tx) => {
        const c = await tx.loyaltyCustomer.update({
          where: { id: customer!.id },
          data: {
            stampsCount: newStampsCount,
          },
        });

        const log = await tx.loyaltyLog.create({
          data: {
            profileId: id,
            customerId: c.id,
            phone,
            action: 'RESET',
            stampsCount: newStampsCount,
          },
        });

        return { customer: c, log };
      });

      return NextResponse.json({
        success: true,
        message: 'Compteur de tampons réinitialisé',
        customer: {
          id: updated.customer.id,
          phone: updated.customer.phone,
          customerName: updated.customer.customerName,
          stampsCount: updated.customer.stampsCount,
          rewardsEarned: updated.customer.rewardsEarned,
          lastStampAt: updated.customer.lastStampAt,
          isRewardReady: updated.customer.stampsCount >= targetStamps,
        },
      });
    }

    // 4. UPDATE_NAME
    if (action === 'UPDATE_NAME') {
      const customerName = body.customerName !== undefined ? (body.customerName?.trim() || null) : null;
      const updated = await db.loyaltyCustomer.update({
        where: { id: customer.id },
        data: { customerName },
      });

      return NextResponse.json({
        success: true,
        message: 'Nom du client mis à jour',
        customer: updated,
      });
    }

    // 5. DELETE_CUSTOMER
    if (action === 'DELETE_CUSTOMER') {
      await db.loyaltyCustomer.delete({
        where: { id: customer.id },
      });

      return NextResponse.json({
        success: true,
        message: 'Fiche client supprimée',
      });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in POST /api/profiles/[id]/loyalty/merchant/action:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
