import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canAccessMerchantLoyalty } from '@/lib/auth/merchant-loyalty-access';
import {
  testWhatsAppConnection,
  testSmsConnection,
  testEmailConnection,
  MerchantMessagingProviders,
  encryptSecret,
} from '@/lib/services/messaging-provider';

interface Params {
  params: Promise<{ profileId: string }>;
}

// POST /api/merchant/[profileId]/messaging/test
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { profileId } = await params;
    const auth = await canAccessMerchantLoyalty(profileId, req);

    if (!auth.allowed || !auth.loyaltyComp) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { channel, config } = body; // channel: 'whatsapp' | 'sms' | 'email'

    const { loyaltyComp } = auth;
    let settings: any = {};
    if (loyaltyComp?.settingsJson) {
      try {
        settings = JSON.parse(loyaltyComp.settingsJson);
      } catch {}
    }

    const storedProviders: MerchantMessagingProviders = settings.messagingProviders || {};

    if (channel === 'whatsapp') {
      const waConfig = {
        provider: config?.provider || storedProviders.whatsapp?.provider || 'meta_cloud',
        phoneNumberId: config?.phoneNumberId || storedProviders.whatsapp?.phoneNumberId,
        wabaId: config?.wabaId || storedProviders.whatsapp?.wabaId,
        accessToken: (config?.accessToken && !config.accessToken.includes('••••'))
          ? config.accessToken
          : storedProviders.whatsapp?.accessToken,
        displayPhoneNumber: config?.displayPhoneNumber || storedProviders.whatsapp?.displayPhoneNumber,
      };

      const result = await testWhatsAppConnection(waConfig);

      // If test succeeded, mark connected in settings
      if (result.success && loyaltyComp) {
        if (!settings.messagingProviders) settings.messagingProviders = {};
        if (!settings.messagingProviders.whatsapp) settings.messagingProviders.whatsapp = {};
        settings.messagingProviders.whatsapp.connected = true;
        settings.messagingProviders.whatsapp.lastTestedAt = new Date().toISOString();
        if (config?.accessToken && !config.accessToken.includes('••••')) {
          settings.messagingProviders.whatsapp.accessToken = encryptSecret(config.accessToken);
        }
        await db.profileComponent.update({
          where: { id: loyaltyComp.id },
          data: { settingsJson: JSON.stringify(settings) },
        });
      }

      return NextResponse.json(result);
    }

    if (channel === 'sms') {
      const smsConfig = {
        provider: config?.provider || storedProviders.sms?.provider || 'twilio',
        accountSid: config?.accountSid || storedProviders.sms?.accountSid,
        authToken: (config?.authToken && !config.authToken.includes('••••'))
          ? config.authToken
          : storedProviders.sms?.authToken,
        senderId: config?.senderId || storedProviders.sms?.senderId,
      };

      const result = await testSmsConnection(smsConfig);

      if (result.success && loyaltyComp) {
        if (!settings.messagingProviders) settings.messagingProviders = {};
        if (!settings.messagingProviders.sms) settings.messagingProviders.sms = {};
        settings.messagingProviders.sms.connected = true;
        settings.messagingProviders.sms.lastTestedAt = new Date().toISOString();
        if (config?.authToken && !config.authToken.includes('••••')) {
          settings.messagingProviders.sms.authToken = encryptSecret(config.authToken);
        }
        await db.profileComponent.update({
          where: { id: loyaltyComp.id },
          data: { settingsJson: JSON.stringify(settings) },
        });
      }

      return NextResponse.json(result);
    }

    if (channel === 'email') {
      const emailConfig = {
        provider: config?.provider || storedProviders.email?.provider || 'sendgrid',
        apiKey: (config?.apiKey && !config.apiKey.includes('••••'))
          ? config.apiKey
          : storedProviders.email?.apiKey,
        fromEmail: config?.fromEmail || storedProviders.email?.fromEmail,
        fromName: config?.fromName || storedProviders.email?.fromName,
      };

      const result = await testEmailConnection(emailConfig);

      if (result.success && loyaltyComp) {
        if (!settings.messagingProviders) settings.messagingProviders = {};
        if (!settings.messagingProviders.email) settings.messagingProviders.email = {};
        settings.messagingProviders.email.connected = true;
        settings.messagingProviders.email.lastTestedAt = new Date().toISOString();
        if (config?.apiKey && !config.apiKey.includes('••••')) {
          settings.messagingProviders.email.apiKey = encryptSecret(config.apiKey);
        }
        await db.profileComponent.update({
          where: { id: loyaltyComp.id },
          data: { settingsJson: JSON.stringify(settings) },
        });
      }

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Canal de messagerie non supporté' }, { status: 400 });
  } catch (error: any) {
    console.error('Error testing messaging provider:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors du test' }, { status: 500 });
  }
}
