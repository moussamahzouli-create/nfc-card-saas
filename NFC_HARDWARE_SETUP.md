# NFC Hardware Setup Guide

This guide explains how to connect and program physical NFC cards using different client device configurations.

---

## Option A: Native Web NFC (Android / Chrome)

The Web NFC API is supported natively on modern Android devices running Google Chrome. No external drivers, applications, or bridges are required.

### Setup Instructions:
1. Ensure NFC is enabled in your Android System Settings (**Settings > Connected Devices > Connection Preferences > NFC**).
2. Open the platform dashboard using Google Chrome on your Android phone.
3. Navigate to **Connect Card**.
4. Choose **Web NFC** as the interface mode.
5. Tap **Start NFC Scan** and place the physical card against the back of your phone where the NFC antenna is located.
6. Once detected, tap **Write NFC URL** to program the tag memory.

> [!NOTE]
> Web NFC is currently not supported on iOS (Safari/Chrome) or desktop browsers without special flags due to operating system permission constraints.

---

## Option B: USB NFC Reader with SimpleCard NFC Bridge (Desktop)

If you are provisioning cards using a desktop computer (Windows, macOS, Linux) or a browser that does not support native Web NFC, you can use a compatible USB NFC Reader connected to our lightweight local bridge service.

### Supported NFC Readers:
- **ACR122U** (Recommended - USB Plug & Play)
- **PN532-based** readers
- Any standard PC/SC-compliant USB NFC reader device.

### Setup Instructions:
1. Connect your USB NFC Reader to your computer.
2. Install the driver for your reader (most modern OS install PC/SC drivers automatically).
3. Start the local NFC Bridge service (instructions below).
4. Navigate to **Connect Card** on the platform.
5. Choose **Bridge (USB)** as the interface mode.
6. Place your card on the USB reader and proceed with the programming wizard.

---

## Option C: Running the SimpleCard NFC Bridge

To run the local bridge on your desktop:

1. Navigate to the bridge directory:
   ```bash
   cd tools/nfc-bridge
   ```
2. Install dependencies:
   ```bash
   npm install ws
   ```
   *(Optional: If you have an ACR122U and node-gyp build tools installed, run `npm install nfc-pcsc` to enable direct hardware communication. If this module is missing, the bridge will gracefully fall back to a simulated device WebSocket loop for testing).*
3. Run the service:
   ```bash
   node nfc-bridge.js
   ```
4. The service will open a WebSocket listener on `ws://localhost:8080` which the dashboard will automatically connect to when you choose the **Bridge (USB)** option.
