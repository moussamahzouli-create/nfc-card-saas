import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { NTAG_SPECS } from '../config/constants';

export interface TagDiagnostic {
  uid: string;
  chipType: 'NTAG213' | 'NTAG215' | 'NTAG216' | 'GENERIC_NTAG' | 'UNKNOWN';
  userMemoryBytes: number;
  isPasswordProtected: boolean;
  isReadOnly: boolean;
  currentUrl?: string;
}

export const NfcEngine = {
  async init() {
    const isSupported = await NfcManager.isSupported();
    if (!isSupported) {
      throw new Error('هذا الهاتف لا يدعم تقنية NFC');
    }
    await NfcManager.start();
  },

  /**
   * Helper to convert a string PIN (e.g. "BRND" or "1234") to 4 bytes array
   */
  pinToBytes(pin: string): number[] {
    const clean = (pin || 'BRND').padEnd(4, '0').slice(0, 4);
    return [
      clean.charCodeAt(0),
      clean.charCodeAt(1),
      clean.charCodeAt(2),
      clean.charCodeAt(3),
    ];
  },

  /**
   * Detect chip type from Capability Container (Page 0x03)
   */
  async detectChipType(): Promise<'NTAG213' | 'NTAG215' | 'NTAG216' | 'GENERIC_NTAG'> {
    try {
      // Read Page 0x03 (Capability Container)
      // Command 0x30 = READ (reads 16 bytes = 4 pages)
      const resp = await NfcManager.nfcAHandler.transceive([0x30, 0x03]);
      if (resp && resp.length >= 4) {
        const ccSizeByte = resp[2];
        if (ccSizeByte === NTAG_SPECS.NTAG213.ccByte) return 'NTAG213';
        if (ccSizeByte === NTAG_SPECS.NTAG215.ccByte) return 'NTAG215';
        if (ccSizeByte === NTAG_SPECS.NTAG216.ccByte) return 'NTAG216';
      }
      return 'NTAG213'; // Default assumption for standard cards
    } catch {
      return 'NTAG213';
    }
  },

  /**
   * Full Provisioning Workflow:
   * 1. Write NDEF URL
   * 2. Program 32-bit PWD & PACK
   * 3. Set AUTH0 to Page 4 (protect user memory from unauthorized write)
   * 4. Set ACCESS PROT bit to 0 (Write-only protection; public read)
   */
  async writeAndLockTag(
    targetUrl: string,
    pin: string,
    onProgress?: (step: string) => void
  ): Promise<{ uid: string; chipType: string }> {
    try {
      onProgress?.('جاري البحث عن كارت NFC... اقترب بظهر الهاتف');
      await NfcManager.requestTechnology([NfcTech.Ndef, NfcTech.NfcA]);

      // 1. Get Tag UID
      const tag = await NfcManager.getTag();
      const uid = tag?.id || 'UNKNOWN_UID';
      onProgress?.(`تم التعرف على الكارت (UID: ${uid})`);

      // 2. Write NDEF URL record
      onProgress?.('كتابة رابط العميل على الرقاقة...');
      const bytes = Ndef.encodeMessage([Ndef.uriRecord(targetUrl)]);
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
      }

      // 3. Detect Chip Type & Hardware Pages
      onProgress?.('فحص نوع الرقاقة وتجهيز مفاتيح الأمان...');
      const chipType = await this.detectChipType();
      const spec = NTAG_SPECS[chipType] || NTAG_SPECS.NTAG213;

      // 4. Inject 32-bit Password (Command 0xA2 = WRITE page)
      onProgress?.('زرع الرقم السري الرئيسي (Hardware Write-Lock)...');
      const pwdBytes = this.pinToBytes(pin);
      // Write PWD Page
      await NfcManager.nfcAHandler.transceive([0xA2, spec.pwdPage, ...pwdBytes]);

      // Write PACK Page ('X', 'P', 0, 0)
      await NfcManager.nfcAHandler.transceive([0xA2, spec.packPage, 0x58, 0x50, 0x00, 0x00]);

      // 5. Configure AUTH0 and ACCESS
      // AUTH0 = 0x04 (Password protection starts at Page 4 - protects all user data)
      // ACCESS: Page spec.accessPage. Byte 0: bit 7 PROT = 0 (write protected only)
      await NfcManager.nfcAHandler.transceive([0xA2, spec.auth0Page, 0x00, 0x00, 0x00, 0x04]);

      onProgress?.('تم قفل وتأمين الكارت بنجاح!');
      return { uid, chipType };
    } finally {
      await NfcManager.cancelTechnologyRequest();
    }
  },

  /**
   * Diagnostic: Inspect any tag to check UID, URL, Chip Type, and Lock State
   */
  async inspectTag(): Promise<TagDiagnostic> {
    try {
      await NfcManager.requestTechnology([NfcTech.Ndef, NfcTech.NfcA]);
      const tag = await NfcManager.getTag();
      const uid = tag?.id || 'UNKNOWN';

      let currentUrl = '';
      if (tag?.ndefMessage && tag.ndefMessage.length > 0) {
        const record = tag.ndefMessage[0];
        currentUrl = Ndef.uri.decodePayload(record.payload);
      }

      const chipType = await this.detectChipType();
      const spec = NTAG_SPECS[chipType] || NTAG_SPECS.NTAG213;

      // Check if AUTH0 is set (password protection active)
      let isPasswordProtected = false;
      try {
        const authResp = await NfcManager.nfcAHandler.transceive([0x30, spec.auth0Page]);
        if (authResp && authResp.length >= 4 && authResp[3] <= 0x04) {
          isPasswordProtected = true;
        }
      } catch {
        // If reading auth page is restricted, tag is locked
        isPasswordProtected = true;
      }

      const isReadOnly = tag?.isWritable === false;

      return {
        uid,
        chipType,
        userMemoryBytes: spec.userMemory,
        isPasswordProtected,
        isReadOnly,
        currentUrl,
      };
    } finally {
      await NfcManager.cancelTechnologyRequest();
    }
  },

  /**
   * Unlock Tag using the Master PIN
   */
  async unlockTag(pin: string): Promise<boolean> {
    try {
      await NfcManager.requestTechnology([NfcTech.NfcA]);
      const chipType = await this.detectChipType();
      const spec = NTAG_SPECS[chipType] || NTAG_SPECS.NTAG213;

      // Authenticate with PWD (Command 0x1B)
      const pwdBytes = this.pinToBytes(pin);
      const authResp = await NfcManager.nfcAHandler.transceive([0x1B, ...pwdBytes]);

      // If authenticated, reset AUTH0 to 0xFF (disable password protection)
      if (authResp && authResp.length >= 2) {
        await NfcManager.nfcAHandler.transceive([0xA2, spec.auth0Page, 0x00, 0x00, 0x00, 0xFF]);
        return true;
      }
      return false;
    } finally {
      await NfcManager.cancelTechnologyRequest();
    }
  }
};
