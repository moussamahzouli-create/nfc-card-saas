# Connect Card NFC Implementation Documentation

This document describes the technical implementation details of the NFC provisioning workflow upgrades, WebSocket bridge setup, and backend security validations.

---

## 1. Root Cause of the Old Issue
1. **Frontend-Backend Disconnect:** The client-side UI pages (`/dashboard/connect-card` and `/dashboard/cards/[id]/write`) used dummy `setTimeout` loops instead of calling the actual client-side `NfcProvider` methods to communicate with NFC hardware.
2. **Missing Local Bridge:** Browsers (other than Chrome on Android) do not support the experimental native Web NFC `NDEFReader`. There was no fallback communication bridge to allow desktop browsers or native USB readers (like ACR122U) to read/write tags.
3. **No Dev Mock Toggle:** Developers had no way to test the provisioning flow on local hardware-less devices, leading to fake verification states.

---

## 2. Files Created
- **`tools/nfc-bridge/nfc-bridge.js`**: Lightweight Node.js local WebSocket server bridging browser clients to native PC/SC NFC readers. Automatically falls back to simulated hardware loops if binary drivers fail to compile.
- **`scripts/test_connect_card.ts`**: Integration test script checking ownership validation, card status checking, DB logging, and NDEF URL matching verification.
- **`NFC_HARDWARE_SETUP.md`**: Guide explaining device setups, Web NFC compatibility, USB reader configurations, and bridge execution.

---

## 3. Files Modified
- **`src/lib/nfc/NfcWriter.ts`**: Added `LocalBridgeNfcProvider` (handles WebSockets requests to `localhost:8080`), added explicit type checks, and exported `getNfcProvider(modeOverride)` helper supporting `web`, `bridge`, and `mock` providers.
- **`src/app/dashboard/connect-card/page.tsx`**: Reworked the Connect Card Wizard page into a premium 3-step provisioning flow (Select Profile → Select Card/Serial → Place Card on reader → Write NDEF → Verify → Final Success with Copy Link and QR Download).
- **`src/app/dashboard/cards/[id]/write/page.tsx`**: Updated the standalone cards writer console to use actual client-side NFC providers (`nfc.writeUrl` and `nfc.verifyUrl`) instead of fake timing mockups.

---

## 4. How to Connect NFC Hardware
Refer to the detailed hardware guide in [NFC_HARDWARE_SETUP.md](file:///C:/Users/ZBOOK/.gemini/antigravity/scratch/nfc-card-saas/NFC_HARDWARE_SETUP.md) for full instructions on Web NFC and USB reader configuration.

---

## 5. Testing Without Hardware
1. Navigate to the **Connect Card** wizard page.
2. Choose **Mock (Dev)** mode in the NFC Hardware selector.
3. Select a profile and card, and press **Start NFC Scan**.
4. The system will mock tag detection and program the correct canonical NDEF link (`/c/[publicToken]`).
5. Upon successful programming, you can verify card records in the database or test redirection using `/c/[publicToken]`.
