export interface CheckoutOptions {
  userId: string;
  orderId: string;
  amount: number; // Integer minor units (e.g. 1999)
  currency: string;
  successUrl: string;
  cancelUrl: string;
  type: 'PRODUCT' | 'SUBSCRIPTION';
}

export interface CheckoutResult {
  sessionId: string;
  checkoutUrl: string;
}

export interface PaymentProvider {
  createCheckout(options: CheckoutOptions): Promise<CheckoutResult>;
  refundPayment(transactionId: string, amount: number): Promise<boolean>;
  verifyWebhookSignature(body: string, signature: string): Promise<boolean>;
}

export class MockPaymentProvider implements PaymentProvider {
  async createCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    const sessionId = `mock_sess_${crypto.randomUUID()}`;
    return {
      sessionId,
      checkoutUrl: `/checkout/confirm?sessionId=${sessionId}&orderId=${options.orderId}&amount=${options.amount}&currency=${options.currency}`,
    };
  }

  async refundPayment(transactionId: string, amount: number): Promise<boolean> {
    console.log(`[MockPayment] Refunding transaction ${transactionId} by minor amount ${amount}`);
    return true;
  }

  async verifyWebhookSignature(body: string, signature: string): Promise<boolean> {
    // In mock provider, checking if signature matches 'mock_sig_123'
    return signature === 'mock_sig_123';
  }
}

// Global helper returning the configured active payment provider
export function getPaymentProvider(): PaymentProvider {
  // Can extend to check process.env.STRIPE_SECRET_KEY, etc.
  return new MockPaymentProvider();
}
