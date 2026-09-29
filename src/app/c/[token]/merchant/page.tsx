import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import CashierPortalClient from './CashierPortalClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CashierPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function CashierPortalPage({ params }: CashierPageProps) {
  const { token } = await params;
  const rawToken = (token || '').trim();

  // Find profile by slug or id
  const profile = await db.profile.findFirst({
    where: {
      OR: [
        { slug: rawToken },
        { id: rawToken }
      ]
    },
    include: {
      components: {
        where: {
          type: { in: ['Loyalty', 'loyalty', 'LOYALTY'] }
        }
      }
    }
  });

  if (!profile) {
    notFound();
  }

  const loyaltyComp = profile.components[0];
  let settings: any = {};
  if (loyaltyComp?.settingsJson) {
    try { settings = JSON.parse(loyaltyComp.settingsJson); } catch {}
  }

  const storeName = settings.storeName || profile.company || profile.name || 'Commerce Partenaire';

  return (
    <CashierPortalClient
      profileId={profile.id}
      slug={profile.slug}
      storeName={storeName}
      targetStamps={Number(settings.targetStamps) || 10}
      rewardText={settings.rewardText || 'Cadeau de fidélité'}
      photoUrl={profile.photoUrl}
    />
  );
}
