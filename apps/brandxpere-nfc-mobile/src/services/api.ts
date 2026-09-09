import { Storage } from './storage';

export interface ProfileItem {
  id: string;
  name: string;
  slug: string;
  targetUrl: string;
  jobTitle: string;
  company: string;
  photoUrl?: string | null;
  cardId?: string | null;
  cardNumber?: string | null;
  nfcUid?: string | null;
  status: 'PENDING' | 'ACTIVE';
  ownerName: string;
  ownerEmail: string;
  updatedAt: string;
}

export const Api = {
  async login(email: string, password: string) {
    const baseUrl = await Storage.getApiUrl();
    const res = await fetch(`${baseUrl}/api/mobile/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'فشل تسجيل الدخول');
    }

    await Storage.saveToken(data.token);
    if (data.settings?.defaultPin) {
      await Storage.saveMasterPin(data.settings.defaultPin);
    }
    return data;
  },

  async getCards(filter: 'all' | 'pending' | 'active' = 'all', search: string = ''): Promise<ProfileItem[]> {
    const baseUrl = await Storage.getApiUrl();
    const token = await Storage.getToken();

    const res = await fetch(`${baseUrl}/api/mobile/nfc/cards?filter=${filter}&q=${encodeURIComponent(search)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'فشل جلب الكروت');
    }
    return data.items || [];
  },

  async confirmWrite(payload: {
    profileId?: string;
    profileSlug?: string;
    cardId?: string;
    nfcUid: string;
    chipType: string;
    lockType: 'PASSWORD_PROTECTED' | 'PERMANENT_READ_ONLY';
    lockPinUsed?: string;
  }) {
    const baseUrl = await Storage.getApiUrl();
    const token = await Storage.getToken();

    const res = await fetch(`${baseUrl}/api/mobile/nfc/complete-write`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'فشل إرسال تقرير البرمجة');
    }
    return data;
  }
};
