# Connect Card Audit Report

## 1. Current Connect Card Implementation
- The existing Connect Card feature is implemented at `/dashboard/connect-card/page.tsx`.
- It currently operates as a simple 3-step form wizard:
  1. Input a serial number or public token.
  2. Verify the card and select an owned profile.
  3. Send a POST request to `/api/cards/[id]/assign` to bind the card to the profile.
- **Critical Gap:** It performs database assignment but **completely lacks the actual NFC provisioning step** (no NDEF writing). The user is never prompted to tap their card, and no data is written to the physical NFC tag.

## 2. Current NFC Architecture
- Located under `src/lib/nfc/`.
- `url.ts` provides `generateCardUrl(publicToken)` which builds the redirect link `/c/[publicToken]`.
- `NfcWriter.ts` defines the `NfcProvider` interface and three provider subclasses:
  - `WebNfcProvider`: Browser-based native Web NFC API utilizing `NDEFReader`.
  - `MockNfcProvider`: Development simulation that writes to local memory state.
  - `ExternalReaderProvider`: Placeholder for external/native USB reader APIs (currently not configured).
- **Critical Gap:** The `NfcWriter.ts` class and its `nfc` export are **never imported or utilized** in any client-side pages.

## 3. Existing APIs
- **User Cards APIs:**
  - `GET /api/cards`: Returns cards assigned to the current user.
  - `POST /api/cards/[id]/assign`: Binds a card to a profile in the DB.
  - `POST /api/cards/[id]/nfc/write`: Logs NFC write operation metadata to `NfcWrite` database model and sets status to `ACTIVE`.
  - `POST /api/cards/[id]/nfc/verify`: Logs verification metadata (`verifiedAt`).
- **Admin Cards APIs:**
  - `POST /api/admin/cards/[id]/nfc/write`: Logs admin NFC write metadata.
  - `POST /api/admin/cards/[id]/nfc/verify`: Logs verification metadata and matches actual vs expected URLs.

## 4. Exact Reason it is Not Working
1. **Frontend-Backend Disconnect:** The client-side UI (`/dashboard/connect-card/page.tsx` and `/dashboard/cards/[id]/write/page.tsx`) uses fake `setTimeout` animations instead of calling the actual client-side `NfcProvider` methods (`nfc.writeUrl()`, `nfc.verifyUrl()`).
2. **Missing Local Bridge for USB/PC-SC:** If the browser doesn't support Web NFC (e.g. desktop Chrome/Safari without flags), there is no fallback bridge setup for USB readers.
3. **No Dev Mock Toggle:** There is no UI switch or environment configuration exposed to developers to toggle `MockNfcProvider` on the frontend for local hardware-less testing.
4. **Poor Step Layout:** The Connect Card page expects the user to input a card code/serial first instead of listing available cards or profiles first.

## 5. Files that Need Modification
- `src/lib/nfc/NfcWriter.ts`: Extend providers to support local WebSocket NFC Bridge or custom PC/SC adapters.
- `src/app/dashboard/connect-card/page.tsx`: Rebuild to feature a professional 3-step modal flow (Select Profile → Select Card → Start NFC Connection and Write Tag).
- `src/app/dashboard/cards/[id]/write/page.tsx`: Rewrite to perform actual NDEF Web NFC write operations and log them via `/api/cards/[id]/nfc/write`.
- `src/app/api/cards/route.ts`: Modify `GET` or add a new route to allow users to fetch their own unassigned or available cards (in addition to assigned cards) for linking.
- `src/app/globals.css`: Verify styling classes exist for the premium card connection screens.

## 6. Final Implementation Plan
1. **Audit & Plan Approval:** Get user confirmation on the proposed architecture.
2. **Create Local NFC Bridge (Optional/Preparatory):** Build a small local bridge service under `tools/nfc-bridge/` communicating over WebSockets for desktop USB reader support.
3. **Extend Client-Side Provider:** Update `NfcWriter.ts` to detect `NDEFReader` in browser, fall back to localhost WebSocket bridge if configured, and fall back to Mock NFC if in development mode.
4. **Rebuild Connect Card UI:** Design a premium step-by-step modal that fetches owned profiles, displays owned available cards, starts NFC scanning, writes the canonical URL (`/c/[publicToken]`), reads it back to verify, and saves.
5. **Add Automated Verification Tests:** Write `test_connect_card.ts` to test all authentication, role, state, and IDOR validation limits.
