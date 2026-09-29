import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canAccessMerchantLoyalty } from '@/lib/auth/merchant-loyalty-access';
import {
  sendCustomerWhatsApp,
  MerchantMessagingProviders,
} from '@/lib/services/messaging-provider';

interface Params {
  params: Promise<{ profileId: string }>;
}

// POST /api/merchant/[profileId]/messaging/send-whatsapp
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { profileId } = await params;
    const auth = await canAccessMerchantLoyalty(profileId, req);

    if (!auth.allowed) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { customerId, phone, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Le contenu du message est requis' }, { status: 400 });
    }

    // Verify customer belongs to this merchant/profile
    const customer = await db.loyaltyCustomer.findFirst({
      where: {
        profileId,
        ...(customerId ? { id: customerId } : { phone: phone?.trim() }),
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Client introuvable pour ce commerce' }, { status: 404 });
    }

    const { loyaltyComp } = auth;
    let settings: any = {};
    if (loyaltyComp?.settingsJson) {
      try {
        settings = JSON.parse(loyaltyComp.settingsJson);
      } catch {}
    }

    const providers: MerchantMessagingProviders = settings.messagingProviders || {};
    const waConfig = providers.whatsapp;

    if (!waConfig || !waConfig.phoneNumberId || !waConfig.accessToken) {
      return NextResponse.json(
        {
          error: 'Fournisseur WhatsApp Business non connecté',
          providerNotConnected: true,
          phone: customer.phone,
        },
        { status: 400 }
      );
    }

    // Send the real WhatsApp message via merchant's own configured Meta Cloud API
    const result = await sendCustomerWhatsApp(waConfig, customer.phone, message.trim());

    if (result.success) {
      // Record merchant notification for traceability
      try {
        await db.merchantNotification.create({
          data: {
            profileId,
            type: 'campaign_sent',
            message: `Message WhatsApp envoyé à ${customer.customerName || customer.phone}`,
            metadata: JSON.stringify({
              customerId: customer.id,
              phone: customer.phone,
              messageId: result.messageId,
              channel: 'whatsapp',
            }),
          },
        });
      } catch (logErr) {
        console.warn('Could not record notification:', logErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Message WhatsApp envoyé avec succès',
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        {
          error: result.error || "Échec de l'envoi WhatsApp",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
