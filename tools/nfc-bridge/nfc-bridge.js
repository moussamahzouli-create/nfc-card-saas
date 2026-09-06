/**
 * SimpleCard NFC Local Bridge
 * WebSocket server bridging browser clients to native PC/SC NFC readers.
 * Port: 8080
 */

const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });
console.log('SimpleCard NFC Bridge running on ws://localhost:8080');

let nfcReader = null;
let currentCard = null;
let simulatedMemory = '';

// Try loading native PC/SC libraries dynamically
try {
  const { NFC } = require('nfc-pcsc');
  const nfc = new NFC();

  nfc.on('reader', reader => {
    nfcReader = reader;
    console.log(`[PC/SC] Reader detected: ${reader.name}`);

    reader.on('card', card => {
      currentCard = card;
      console.log(`[PC/SC] Card detected: UID=${card.uid}`);
    });

    reader.on('card.off', card => {
      if (currentCard && currentCard.uid === card.uid) {
        currentCard = null;
      }
      console.log(`[PC/SC] Card removed`);
    });

    reader.on('end', () => {
      nfcReader = null;
      currentCard = null;
      console.log(`[PC/SC] Reader disconnected`);
    });

    reader.on('error', err => {
      console.error(`[PC/SC] Reader error:`, err);
    });
  });

  nfc.on('error', err => {
    console.error(`[PC/SC] Global NFC error:`, err);
  });

} catch (err) {
  console.warn('[PC/SC Warning] nfc-pcsc module not found or compilation failed. Running bridge in hardware-simulated mode.');
}

wss.on('connection', ws => {
  console.log('Browser connected to NFC Bridge');

  ws.on('message', async message => {
    try {
      const req = JSON.parse(message);
      console.log('Received request:', req);

      if (req.action === 'write') {
        if (nfcReader && currentCard) {
          // Hardware writing flow using nfc-pcsc
          // Standard NFC URI NDEF structure (simplified write)
          try {
            // Map the URL into NDEF payload
            const payload = Buffer.from(req.url, 'utf-8');
            // Write block command to tag (requires specific tag support like Mifare Ultralight / NTAG213)
            // For ACR122U readers we write payload starting at page 4 for NTAG tags
            // Prepend NDEF URI record prefix (0x03 [len] 0xD1 0x01 [len] 0x55 0x04 [url])
            const ndefHeader = Buffer.from([
              0x03, payload.length + 5, // NDEF Message TLV
              0xD1, 0x01, payload.length + 1, // Record Header (MB=1, ME=1, SR=1, TNF=0x01), Type Len, Payload Len
              0x55, 0x04 // Type: 'U' (URI), Prefix: 0x04 (https://)
            ]);
            
            // Strip the protocol since prefix 0x04 represents "https://"
            const cleanUrlStr = req.url.replace(/^https:\/\//i, '');
            const urlPayload = Buffer.from(cleanUrlStr, 'utf-8');
            const fullPayload = Buffer.concat([ndefHeader, urlPayload, Buffer.from([0xFE])]); // 0xFE TLV Terminator

            // Write payload page by page (4 bytes per page)
            for (let i = 0; i < fullPayload.length; i += 4) {
              const page = 4 + (i / 4);
              const chunk = Buffer.alloc(4);
              fullPayload.copy(chunk, 0, i, i + 4);
              await nfcReader.write(page, chunk);
            }

            ws.send(JSON.stringify({
              action: 'write',
              success: true,
              uid: currentCard.uid,
              message: 'NDEF URL written successfully via hardware.'
            }));
          } catch (writeErr) {
            ws.send(JSON.stringify({
              action: 'write',
              success: false,
              message: `Hardware write error: ${writeErr.message}`
            }));
          }
        } else {
          // Simulated hardware flow fallback
          console.log('[Simulated Bridge] Writing URL:', req.url);
          await new Promise(r => setTimeout(r, 1200));
          simulatedMemory = req.url;
          ws.send(JSON.stringify({
            action: 'write',
            success: true,
            uid: 'USB-SIM-09A18B',
            message: 'NDEF URL written successfully (simulated).'
          }));
        }
      }

      else if (req.action === 'read') {
        if (nfcReader && currentCard) {
          // Hardware read flow
          try {
            // Read first 16 pages to extract TLV blocks
            const dataBuffer = await nfcReader.read(4, 64);
            // Search for NDEF URI record (Type 0x55)
            let records = [];
            const ndefIndex = dataBuffer.indexOf(0x55);
            if (ndefIndex !== -1) {
              const payloadLen = dataBuffer[ndefIndex - 1] - 1; // Subtract 1 for URI prefix byte
              const urlBytes = dataBuffer.slice(ndefIndex + 2, ndefIndex + 2 + payloadLen);
              const urlStr = 'https://' + urlBytes.toString('utf-8');
              records.push({ recordType: 'url', data: urlStr });
            }
            ws.send(JSON.stringify({
              action: 'read',
              success: true,
              records,
              uid: currentCard.uid
            }));
          } catch (readErr) {
            ws.send(JSON.stringify({
              action: 'read',
              success: false,
              message: `Hardware read error: ${readErr.message}`
            }));
          }
        } else {
          // Simulated read fallback
          await new Promise(r => setTimeout(r, 800));
          ws.send(JSON.stringify({
            action: 'read',
            success: true,
            records: simulatedMemory ? [{ recordType: 'url', data: simulatedMemory }] : [],
            uid: 'USB-SIM-09A18B'
          }));
        }
      }

      else if (req.action === 'verify') {
        if (nfcReader && currentCard) {
          try {
            const dataBuffer = await nfcReader.read(4, 64);
            const ndefIndex = dataBuffer.indexOf(0x55);
            if (ndefIndex !== -1) {
              const payloadLen = dataBuffer[ndefIndex - 1] - 1;
              const urlBytes = dataBuffer.slice(ndefIndex + 2, ndefIndex + 2 + payloadLen);
              const scannedUrl = 'https://' + urlBytes.toString('utf-8');
              const isMatch = scannedUrl.trim().toLowerCase() === req.expectedUrl.trim().toLowerCase();
              ws.send(JSON.stringify({
                action: 'verify',
                success: isMatch,
                verifiedUrl: scannedUrl,
                message: isMatch ? 'Matched' : `Expected ${req.expectedUrl}, read ${scannedUrl}`
              }));
            } else {
              ws.send(JSON.stringify({ action: 'verify', success: false, message: 'No NDEF URI found' }));
            }
          } catch (verifyErr) {
            ws.send(JSON.stringify({ action: 'verify', success: false, message: verifyErr.message }));
          }
        } else {
          // Simulated verify
          await new Promise(r => setTimeout(r, 800));
          const isMatch = simulatedMemory.trim().toLowerCase() === req.expectedUrl.trim().toLowerCase();
          ws.send(JSON.stringify({
            action: 'verify',
            success: isMatch,
            verifiedUrl: simulatedMemory,
            message: isMatch ? 'Matched' : 'Mismatch'
          }));
        }
      }

    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  ws.on('close', () => {
    console.log('Browser disconnected');
  });
});
