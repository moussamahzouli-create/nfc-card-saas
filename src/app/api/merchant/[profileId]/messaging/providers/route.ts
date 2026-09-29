import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canAccessMerchantLoyalty } from '@/lib/auth/merchant-loyalty-access';
import {
  encryptSecret,
  maskSecret,
  MerchantMessagingProviders,
} from '@/lib/services/messaging-provider';

interface Params {
  params: Promise<{ profileId: string }>;
}

// GET /api/merchant/[profileId]/messaging/providers
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { profileId } = await params;
    const auth = await canAccessMerchantLoyalty(profileId, req);

    if (!auth.allowed) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const { loyaltyComp } = auth;
    let settings: any = {};
    if (loyaltyComp?.settingsJson) {
      try {
        settings = JSON.parse(loyaltyComp.settingsJson);
      } catch {}
    }

    const rawProviders: MerchantMessagingProviders = settings.messagingProviders || {};

    // Return safe/masked configuration for client UI
    const clientProviders = {
      whatsapp: {
        provider: rawProviders.whatsapp?.provider || 'meta_cloud',
        phoneNumberId: rawProviders.whatsapp?.phoneNumberId || '',
        wabaId: rawProviders.whatsapp?.wabaId || '',
        accessTokenMasked: rawProviders.whatsapp?.accessToken ? maskSecret(rawProviders.whatsapp.accessToken) : '',
        hasAccessToken: !!rawProviders.whatsapp?.accessToken,
        displayPhoneNumber: rawProviders.whatsapp?.displayPhoneNumber || '',
        connected: !!rawProviders.whatsapp?.connected,
        lastTestedAt: rawProviders.whatsapp?.lastTestedAt || null,
      },
      sms: {
        provider: rawProviders.sms?.provider || 'twilio',
        accountSid: rawProviders.sms?.accountSid || '',
        authTokenMasked: rawProviders.sms?.authToken ? maskSecret(rawProviders.sms.authToken) : '',
        hasAuthToken: !!rawProviders.sms?.authToken,
        senderId: rawProviders.sms?.senderId || '',
        connected: !!rawProviders.sms?.connected,
        lastTestedAt: rawProviders.sms?.lastTestedAt || null,
      },
      email: {
        provider: rawProviders.email?.provider || 'sendgrid',
        apiKeyMasked: rawProviders.email?.apiKey ? maskSecret(rawProviders.email.apiKey) : '',
        hasApiKey: !!rawProviders.email?.apiKey,
        fromEmail: rawProviders.email?.fromEmail || '',
        fromName: rawProviders.email?.fromName || '',
        connected: !!rawProviders.email?.connected,
        lastTestedAt: rawProviders.email?.lastTestedAt || null,
      },
    };

    return NextResponse.json({ providers: clientProviders });
  } catch (error: any) {
    console.error('Error fetching messaging providers:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/merchant/[profileId]/messaging/providers
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { profileId } = await params;
    const auth = await canAccessMerchantLoyalty(profileId, req);

    if (!auth.allowed || !auth.loyaltyComp) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { loyaltyComp } = auth;

    let settings: any = {};
    if (loyaltyComp.settingsJson) {
      try {
        settings = JSON.parse(loyaltyComp.settingsJson);
      } catch {}
    }

    const existingProviders: MerchantMessagingProviders = settings.messagingProviders || {};
    const updatedProviders: MerchantMessagingProviders = { ...existingProviders };

    // Update WhatsApp configuration
    if (body.whatsapp) {
      const wa = body.whatsapp;
      const currentWa = existingProviders.whatsapp || { provider: 'meta_cloud' };

      // Encrypt new token if provided, or retain existing encrypted token
      let tokenToSave = currentWa.accessToken;
      if (wa.accessToken && !wa.accessToken.includes('••••')) {
        tokenToSave = encryptSecret(wa.accessToken);
      }

      updatedProviders.whatsapp = {
        provider: wa.provider || 'meta_cloud',
        phoneNumberId: wa.phoneNumberId !== undefined ? wa.phoneNumberId.trim() : currentWa.phoneNumberId,
        wabaId: wa.wabaId !== undefined ? wa.wabaId.trim() : currentWa.wabaId,
        displayPhoneNumber: wa.displayPhoneNumber !== undefined ? wa.displayPhoneNumber.trim() : currentWa.displayPhoneNumber,
        accessToken: tokenToSave,
        connected: wa.connected !== undefined ? Boolean(wa.connected) : (Boolean(tokenToSave && wa.phoneNumberId)),
        lastTestedAt: wa.lastTestedAt || currentWa.lastTestedAt,
      };
    }

    // Update SMS configuration
    if (body.sms) {
      const sms = body.sms;
      const currentSms = existingProviders.sms || { provider: 'twilio' };

      let tokenToSave = currentSms.authToken;
      if (sms.authToken && !sms.authToken.includes('••••')) {
        tokenToSave = encryptSecret(sms.authToken);
      }

      updatedProviders.sms = {
        provider: sms.provider || 'twilio',
        accountSid: sms.accountSid !== undefined ? sms.accountSid.trim() : currentSms.accountSid,
        senderId: sms.senderId !== undefined ? sms.senderId.trim() : currentSms.senderId,
        authToken: tokenToSave,
        connected: sms.connected !== undefined ? Boolean(sms.connected) : (Boolean(tokenToSave && sms.accountSid)),
        lastTestedAt: sms.lastTestedAt || currentSms.lastTestedAt,
      };
    }

    // Update Email configuration
    if (body.email) {
      const email = body.email;
      const currentEmail = existingProviders.email || { provider: 'sendgrid' };

      let apiKeyToSave = currentEmail.apiKey;
      if (email.apiKey && !email.apiKey.includes('••••')) {
        apiKeyToSave = encryptSecret(email.apiKey);
      }

      updatedProviders.email = {
        provider: email.provider || 'sendgrid',
        fromEmail: email.fromEmail !== undefined ? email.fromEmail.trim() : currentEmail.fromEmail,
        fromName: email.fromName !== undefined ? email.fromName.trim() : currentEmail.fromName,
        apiKey: apiKeyToSave,
        connected: email.connected !== undefined ? Boolean(email.connected) : (Boolean(apiKeyToSave && email.fromEmail)),
        lastTestedAt: email.lastTestedAt || currentEmail.lastTestedAt,
      };
    }

    settings.messagingProviders = updatedProviders;

    await db.profileComponent.update({
      where: { id: loyaltyComp.id },
      data: {
        settingsJson: JSON.stringify(settings),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Configuration des messageries enregistrée avec succès',
    });
  } catch (error: any) {
    console.error('Error updating messaging providers:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
