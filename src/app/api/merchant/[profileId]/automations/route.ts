import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canAccessMerchantLoyalty } from '@/lib/auth/merchant-loyalty-access';

interface Params { params: Promise<{ profileId: string }>; }

// Default automation rules — these are templates
const DEFAULT_AUTOMATIONS = [
  {
    id: 'auto_welcome',
    name: 'Message de bienvenue',
    trigger: 'new_customer',
    triggerLabel: 'Nouveau client enregistré',
    action: 'send_message',
    channel: 'whatsapp',
    messageTemplate: 'Bienvenue chez {storeName} ! Votre carte fidélité est prête. Accumulez des tampons et gagnez des récompenses !',
    enabled: false,
  },
  {
    id: 'auto_almost_reward',
    name: 'Presque là !',
    trigger: 'almost_reward',
    triggerLabel: 'Client à ≥70% de la carte',
    action: 'send_message',
    channel: 'whatsapp',
    messageTemplate: 'Vous y êtes presque ! Il ne vous manque que {remaining} tampons pour votre récompense chez {storeName}.',
    enabled: false,
  },
  {
    id: 'auto_reward_ready',
    name: 'Récompense prête',
    trigger: 'reward_ready',
    triggerLabel: 'Carte complète — récompense disponible',
    action: 'send_message',
    channel: 'whatsapp',
    messageTemplate: 'Félicitations ! Votre récompense vous attend chez {storeName}. Passez nous voir !',
    enabled: false,
  },
  {
    id: 'auto_inactivity',
    name: 'Relance inactivité',
    trigger: 'inactive_30d',
    triggerLabel: 'Client inactif depuis 30 jours',
    action: 'send_message',
    channel: 'whatsapp',
    messageTemplate: '{storeName} vous manque ! Revenez continuer votre programme fidélité.',
    enabled: false,
  },
  {
    id: 'auto_reward_redeemed',
    name: 'Confirmation récompense',
    trigger: 'reward_redeemed',
    triggerLabel: 'Récompense utilisée',
    action: 'send_message',
    channel: 'whatsapp',
    messageTemplate: 'Votre récompense a bien été validée chez {storeName}. Merci pour votre fidélité !',
    enabled: false,
  },
];

export async function GET(req: NextRequest, { params }: Params) {
  const { profileId } = await params;
  const auth = await canAccessMerchantLoyalty(profileId, req);
  if (!auth.allowed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Load saved automation settings from profile component settingsJson
  const loyaltyComp = auth.loyaltyComp;
  let savedAutomations: Record<string, boolean> = {};

  if (loyaltyComp?.settingsJson) {
    try {
      const s = JSON.parse(loyaltyComp.settingsJson);
      if (s.automations) savedAutomations = s.automations;
    } catch {}
  }

  const automations = DEFAULT_AUTOMATIONS.map(a => ({
    ...a,
    enabled: savedAutomations[a.id] ?? false,
  }));

  // Usage counters (stored in settings for now — no separate table)
  const usageLimits = {
    email: { used: 0, limit: 5000, unit: 'emails/mois' },
    sms: { used: 0, limit: 1000, unit: 'SMS/mois' },
    whatsapp: { used: 0, limit: 500, unit: 'messages/mois' },
    campaigns: { used: 0, limit: 10, unit: 'campagnes/mois' },
  };

  // Count campaigns this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const campaignsThisMonth = await db.campaign.count({
    where: { profileId, createdAt: { gte: startOfMonth } },
  });
  usageLimits.campaigns.used = campaignsThisMonth;

  return NextResponse.json({ automations, usageLimits });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { profileId } = await params;
  const auth = await canAccessMerchantLoyalty(profileId, req);
  if (!auth.allowed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { automationId, enabled } = body;

  if (!automationId || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'automationId and enabled required' }, { status: 400 });
  }

  // Save automation state in loyalty settings
  const loyaltyComp = auth.loyaltyComp;
  if (!loyaltyComp) return NextResponse.json({ error: 'Loyalty component not found' }, { status: 404 });

  let settings: any = {};
  if (loyaltyComp.settingsJson) {
    try { settings = JSON.parse(loyaltyComp.settingsJson); } catch {}
  }

  if (!settings.automations) settings.automations = {};
  settings.automations[automationId] = enabled;

  await db.profileComponent.update({
    where: { id: loyaltyComp.id },
    data: { settingsJson: JSON.stringify(settings) },
  });

  return NextResponse.json({ success: true, automationId, enabled });
}
