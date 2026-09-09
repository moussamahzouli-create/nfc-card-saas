export const APP_CONFIG = {
  DEFAULT_API_URL: 'https://www.brandxpere.com',
  DEFAULT_MASTER_PIN: 'BRND', // 4-char string (4 bytes) used to lock the hardware chip
  DEFAULT_PACK: 'XP',        // 2-byte confirmation code
  APP_NAME: 'Brandxpere NFC Manager',
  VERSION: '1.0.0',
  BRAND_COLOR: '#8A509E',
  DARK_BG: '#090D16',
  CARD_BG: '#131A29',
};

// NTAG Chip Characteristics
export const NTAG_SPECS = {
  NTAG213: {
    name: 'NTAG213',
    userMemory: 144,
    totalBytes: 180,
    ccByte: 0x12,
    pwdPage: 0x2B,
    packPage: 0x2C,
    auth0Page: 0x29,
    accessPage: 0x2A,
  },
  NTAG215: {
    name: 'NTAG215',
    userMemory: 504,
    totalBytes: 540,
    ccByte: 0x3E,
    pwdPage: 0x85,
    packPage: 0x86,
    auth0Page: 0x83,
    accessPage: 0x84,
  },
  NTAG216: {
    name: 'NTAG216',
    userMemory: 888,
    totalBytes: 924,
    ccByte: 0x6D,
    pwdPage: 0xE5,
    packPage: 0xE6,
    auth0Page: 0xE3,
    accessPage: 0xE4,
  },
  GENERIC_NTAG: {
    name: 'GENERIC_NTAG',
    userMemory: 144,
    totalBytes: 180,
    ccByte: 0x12,
    pwdPage: 0x2B,
    packPage: 0x2C,
    auth0Page: 0x29,
    accessPage: 0x2A,
  },
  UNKNOWN: {
    name: 'UNKNOWN',
    userMemory: 144,
    totalBytes: 180,
    ccByte: 0x12,
    pwdPage: 0x2B,
    packPage: 0x2C,
    auth0Page: 0x29,
    accessPage: 0x2A,
  },
};
