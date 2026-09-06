export interface NfcWriteResult {
  success: boolean;
  message?: string;
  uid?: string;
}

export interface NfcVerifyResult {
  success: boolean;
  verifiedUrl?: string;
  message?: string;
}

export interface NfcReadResult {
  success: boolean;
  records?: { recordType: string; data: string }[];
  message?: string;
  uid?: string;
}

/**
 * NFC Provisioning Abstraction Interface.
 */
export interface NfcProvider {
  name: string;
  connect(): Promise<void>;
  writeUrl(url: string): Promise<NfcWriteResult>;
  verifyUrl(expectedUrl: string): Promise<NfcVerifyResult>;
  read(): Promise<NfcReadResult>;
  disconnect(): Promise<void>;
}

/**
 * Browser Web NFC implementation using experimental NDEFReader.
 */
export class WebNfcProvider implements NfcProvider {
  name = 'Web NFC API (Android Chrome)';
  private ndef: any = null;
  private ctrl: AbortController | null = null;

  async connect(): Promise<void> {
    if (typeof window === 'undefined' || !('NDEFReader' in window)) {
      throw new Error('Web NFC NDEFReader is not supported in this browser/device.');
    }
    this.ndef = new (window as any).NDEFReader();
  }

  async writeUrl(url: string): Promise<NfcWriteResult> {
    try {
      if (!this.ndef) await this.connect();
      this.ctrl = new AbortController();
      await this.ndef.write({
        records: [{ recordType: 'url', data: url }]
      }, { signal: this.ctrl.signal });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Write failed' };
    }
  }

  async verifyUrl(expectedUrl: string): Promise<NfcVerifyResult> {
    try {
      if (!this.ndef) await this.connect();
      this.ctrl = new AbortController();
      await this.ndef.scan({ signal: this.ctrl.signal });

      const result = await new Promise<NfcVerifyResult>((resolve, reject) => {
        const onReading = ({ message }: any) => {
          for (const record of message.records) {
            if (record.recordType === 'url') {
              const textDecoder = new TextDecoder();
              const scannedUrl = textDecoder.decode(record.data);
              if (scannedUrl.trim() === expectedUrl.trim()) {
                resolve({ success: true, verifiedUrl: scannedUrl });
                return;
              } else {
                resolve({ success: false, verifiedUrl: scannedUrl, message: 'URL mismatch' });
                return;
              }
            }
          }
          resolve({ success: false, message: 'No URL record found on scanned tag' });
        };

        this.ndef.addEventListener('reading', onReading, { once: true });
        setTimeout(() => {
          this.ndef.removeEventListener('reading', onReading);
          reject(new Error('Tag scanning verification timeout'));
        }, 15000);
      });

      return result;
    } catch (err: any) {
      return { success: false, message: err.message || 'Verification failed' };
    }
  }

  async read(): Promise<NfcReadResult> {
    try {
      if (!this.ndef) await this.connect();
      this.ctrl = new AbortController();
      await this.ndef.scan({ signal: this.ctrl.signal });

      const result = await new Promise<NfcReadResult>((resolve, reject) => {
        const onReading = ({ message, serialNumber }: any) => {
          const textDecoder = new TextDecoder();
          const records = message.records.map((r: any) => ({
            recordType: r.recordType,
            data: textDecoder.decode(r.data),
          }));
          resolve({ success: true, records, uid: serialNumber });
        };

        this.ndef.addEventListener('reading', onReading, { once: true });
        setTimeout(() => {
          this.ndef.removeEventListener('reading', onReading);
          reject(new Error('Tag scan timeout'));
        }, 15000);
      });

      return result;
    } catch (err: any) {
      return { success: false, message: err.message || 'Read failed' };
    }
  }

  async disconnect(): Promise<void> {
    if (this.ctrl) {
      this.ctrl.abort();
      this.ctrl = null;
    }
    this.ndef = null;
  }
}

/**
 * Native PC/SC reader adapter using a local WebSocket Bridge.
 */
export class LocalBridgeNfcProvider implements NfcProvider {
  name = 'NFC Bridge (USB Reader)';
  private ws: WebSocket | null = null;
  private bridgeUrl = 'ws://localhost:8080';

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.bridgeUrl);
      
      const timeout = setTimeout(() => {
        if (this.ws) this.ws.close();
        reject(new Error('NFC Bridge connection timeout. Make sure the bridge is running locally on port 8080.'));
      }, 3000);

      this.ws.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };

      this.ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Could not connect to NFC Bridge service.'));
      };
    });
  }

  private sendRequest(action: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('NFC Bridge disconnected.'));
        return;
      }

      const onMessage = (event: MessageEvent) => {
        try {
          const res = JSON.parse(event.data);
          if (res.action === action) {
            this.ws?.removeEventListener('message', onMessage);
            resolve(res);
          }
        } catch {
          // Ignore invalid payloads
        }
      };

      this.ws.addEventListener('message', onMessage);
      this.ws.send(JSON.stringify({ action, ...data }));

      // Safeguard timeout
      setTimeout(() => {
        this.ws?.removeEventListener('message', onMessage);
        reject(new Error('Bridge action request timeout'));
      }, 25000);
    });
  }

  async writeUrl(url: string): Promise<NfcWriteResult> {
    try {
      if (!this.ws) await this.connect();
      const res = await this.sendRequest('write', { url });
      return { success: res.success, message: res.message, uid: res.uid };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async verifyUrl(expectedUrl: string): Promise<NfcVerifyResult> {
    try {
      if (!this.ws) await this.connect();
      const res = await this.sendRequest('verify', { expectedUrl });
      return { success: res.success, verifiedUrl: res.verifiedUrl, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async read(): Promise<NfcReadResult> {
    try {
      if (!this.ws) await this.connect();
      const res = await this.sendRequest('read');
      return { success: res.success, records: res.records, message: res.message, uid: res.uid };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

/**
 * Mock NFC Provider for development simulations.
 */
export class MockNfcProvider implements NfcProvider {
  name = 'Mock NFC (Development simulation)';
  private isConnected = false;
  private mockMemory = '';
  private mockUid = 'E10408920C004F';

  async connect(): Promise<void> {
    this.isConnected = true;
    console.log('[Mock NFC] Connected to mock reader');
  }

  async writeUrl(url: string): Promise<NfcWriteResult> {
    if (!this.isConnected) return { success: false, message: 'Device disconnected' };
    await new Promise((resolve) => setTimeout(resolve, 1500)); // simulate delay
    this.mockMemory = url;
    return { success: true, uid: this.mockUid };
  }

  async verifyUrl(expectedUrl: string): Promise<NfcVerifyResult> {
    if (!this.isConnected) return { success: false, message: 'Device disconnected' };
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (this.mockMemory.trim() === expectedUrl.trim()) {
      return { success: true, verifiedUrl: this.mockMemory };
    }
    return { success: false, verifiedUrl: this.mockMemory, message: 'NFC Verification mismatch' };
  }

  async read(): Promise<NfcReadResult> {
    if (!this.isConnected) return { success: false, message: 'Device disconnected' };
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      records: [{ recordType: 'url', data: this.mockMemory }],
      uid: this.mockUid,
    };
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('[Mock NFC] Disconnected from mock reader');
  }
}

// Client helper to get the active provider
export function getNfcProvider(modeOverride?: 'web' | 'bridge' | 'mock'): NfcProvider {
  if (typeof window === 'undefined') {
    return new MockNfcProvider();
  }

  if (modeOverride === 'mock') return new MockNfcProvider();
  if (modeOverride === 'bridge') return new LocalBridgeNfcProvider();
  if (modeOverride === 'web') return new WebNfcProvider();

  // Auto detect
  if ('NDEFReader' in window) {
    return new WebNfcProvider();
  }
  
  // Default fallback is bridge if WebSocket is detected later or mock if dev mode
  if (process.env.NODE_ENV !== 'production') {
    return new MockNfcProvider();
  }

  return new LocalBridgeNfcProvider();
}
