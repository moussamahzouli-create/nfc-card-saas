import crypto from 'crypto';

// Encryption key derived from NEXTAUTH_SECRET or fallback
const SECRET_SEED = process.env.NEXTAUTH_SECRET || 'brandxper-secret-messaging-key-2026';
const KEY = crypto.createHash('sha256').update(SECRET_SEED).digest(); // 32 bytes for aes-256-gcm

/**
 * Encrypts a sensitive string (API Key, Token, Secret) using AES-256-GCM.
 */
export function encryptSecret(plainText: string): string {
  if (!plainText || !plainText.trim()) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plainText.trim(), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a string previously encrypted with encryptSecret.
 */
export function decryptSecret(cipherText: string): string {
  if (!cipherText || !cipherText.startsWith('enc:')) return cipherText || '';
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 4) return '';
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encrypted = Buffer.from(parts[3], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    return decipher.update(encrypted) + decipher.final('utf8');
  } catch (err) {
    console.error('Failed to decrypt secret:', err);
    return '';
  }
}

/**
 * Masks a sensitive secret for client display (e.g. "••••••••1234").
 */
export function maskSecret(secret: string): string {
  if (!secret) return '';
  const plain = secret.startsWith('enc:') ? decryptSecret(secret) : secret;
  if (!plain) return '';
  if (plain.length <= 4) return '••••••••';
  const last4 = plain.slice(-4);
  return `••••••••${last4}`;
}

export interface WhatsAppConfig {
  provider: 'meta_cloud' | 'custom';
  phoneNumberId?: string;
  wabaId?: string;
  accessToken?: string; // encrypted in storage
  displayPhoneNumber?: string;
  connected?: boolean;
  lastTestedAt?: string;
}

export interface SmsConfig {
  provider: 'twilio' | 'infobip' | 'custom';
  accountSid?: string;
  authToken?: string; // encrypted in storage
  senderId?: string;
  connected?: boolean;
  lastTestedAt?: string;
}

export interface EmailConfig {
  provider: 'sendgrid' | 'resend' | 'smtp' | 'custom';
  apiKey?: string; // encrypted in storage
  fromEmail?: string;
  fromName?: string;
  connected?: boolean;
  lastTestedAt?: string;
}

export interface MerchantMessagingProviders {
  whatsapp?: WhatsAppConfig;
  sms?: SmsConfig;
  email?: EmailConfig;
}

/**
 * Tests connection to WhatsApp Business Cloud API.
 */
export async function testWhatsAppConnection(config: WhatsAppConfig): Promise<{ success: boolean; message: string }> {
  if (!config.phoneNumberId || !config.accessToken) {
    return { success: false, message: 'ID de numéro et jeton d’accès requis' };
  }

  const token = config.accessToken.startsWith('enc:') ? decryptSecret(config.accessToken) : config.accessToken;

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok && data.id) {
      const verifiedName = data.verified_name || data.display_phone_number || 'Numéro WhatsApp vérifié';
      return {
        success: true,
        message: `Connexion WhatsApp Business réussie (${verifiedName})`,
      };
    } else {
      const errMsg = data.error?.message || 'Identifiants WhatsApp invalides';
      return { success: false, message: errMsg };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Erreur de connexion avec Meta Graph API' };
  }
}

/**
 * Tests SMS provider credentials (e.g. Twilio).
 */
export async function testSmsConnection(config: SmsConfig): Promise<{ success: boolean; message: string }> {
  if (!config.accountSid || !config.authToken) {
    return { success: false, message: 'Account SID / Clé API et Token requis' };
  }

  const token = config.authToken.startsWith('enc:') ? decryptSecret(config.authToken) : config.authToken;

  if (config.provider === 'twilio') {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${config.accountSid}:${token}`).toString('base64');
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}.json`, {
        headers: { Authorization: authHeader },
      });
      const data = await res.json();
      if (res.ok && data.status === 'active') {
        return { success: true, message: `Connexion Twilio réussie (${data.friendly_name || 'Actif'})` };
      }
      return { success: false, message: data.message || 'Identifiants Twilio invalides' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Erreur de connexion Twilio' };
    }
  }

  // Custom / generic provider test
  return { success: true, message: 'Configuration SMS enregistrée et prête' };
}

/**
 * Tests Email provider credentials (e.g. Resend / SendGrid).
 */
export async function testEmailConnection(config: EmailConfig): Promise<{ success: boolean; message: string }> {
  if (!config.apiKey || !config.fromEmail) {
    return { success: false, message: 'Clé API et Email d’envoi requis' };
  }

  const apiKey = config.apiKey.startsWith('enc:') ? decryptSecret(config.apiKey) : config.apiKey;

  if (config.provider === 'resend') {
    try {
      const res = await fetch('https://api.resend.com/api-keys', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) {
        return { success: true, message: 'Connexion Resend réussie' };
      }
      return { success: false, message: 'Clé API Resend invalide' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Erreur Resend' };
    }
  }

  if (config.provider === 'sendgrid') {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/scopes', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) {
        return { success: true, message: 'Connexion SendGrid réussie' };
      }
      return { success: false, message: 'Clé API SendGrid invalide' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Erreur SendGrid' };
    }
  }

  return { success: true, message: 'Configuration Email enregistrée et prête' };
}

/**
 * Sends a real WhatsApp message to a customer via the merchant's configured Meta Cloud API.
 */
export async function sendCustomerWhatsApp(
  config: WhatsAppConfig,
  recipientPhone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!config.phoneNumberId || !config.accessToken) {
    return { success: false, error: 'Fournisseur WhatsApp Business non connecté' };
  }

  const token = config.accessToken.startsWith('enc:') ? decryptSecret(config.accessToken) : config.accessToken;

  // Clean phone: remove +, spaces, dashes, leading zeroes if international
  let cleanPhone = recipientPhone.replace(/[\s\-\(\)\+]/g, '');
  if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    // Moroccan local number (06... / 07...) -> convert to 212...
    cleanPhone = '212' + cleanPhone.substring(1);
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: { body: message },
      }),
    });

    const data = await res.json();
    if (res.ok && data.messages?.[0]?.id) {
      return {
        success: true,
        messageId: data.messages[0].id,
      };
    } else {
      const errorMsg = data.error?.message || 'Échec de l’envoi WhatsApp';
      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur de connexion au service WhatsApp',
    };
  }
}
