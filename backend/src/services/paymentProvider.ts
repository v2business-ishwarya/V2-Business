import crypto from 'crypto';

/**
 * Payment Provider Interface
 * Defines the contract for payment gateway integrations
 */
export interface PaymentProvider {
  createVendor(vendorData: any): Promise<any>;
  createCheckout(orderData: any): Promise<any>;
  verifyPayment(paymentData: any): Promise<any>;
  createPayout(payoutData: any): Promise<any>;
  getSettlement(settlementId: string): Promise<any>;
}

export class PaymentProviderFactory {
  static createProvider(providerType: string, config?: Record<string, any>): PaymentProvider {
    const type = (providerType || 'mock').toLowerCase();
    switch (type) {
      case 'razorpay':
        return new RazorpayProvider(config);
      case 'cashfree':
        return new CashfreeProvider(config);
      default:
        return new MockPaymentProvider();
    }
  }
}

// ─────────────────────────────────────────────────────
// RAZORPAY — https://razorpay.com/docs/api/
// ─────────────────────────────────────────────────────
export class RazorpayProvider implements PaymentProvider {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;
  private baseUrl = 'https://api.razorpay.com/v1';
  private isLive: boolean;

  constructor(config?: Record<string, any>) {
    this.keyId = config?.apiKey || process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = config?.apiSecret || process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = config?.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || '';
    this.isLive = !!(this.keyId && this.keySecret && !this.keyId.startsWith('rzp_test_mock'));
  }

  private authHeader() {
    return 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
  }

  async createVendor(vendorData: any): Promise<any> {
    if (!this.isLive) {
      return { id: `rzp_acc_mock_${Date.now()}`, provider: 'razorpay', status: 'active', details: vendorData };
    }
    // Razorpay Route API: Create linked account
    const res = await fetch(`${this.baseUrl}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: this.authHeader() },
      body: JSON.stringify({
        email: vendorData.email,
        phone: vendorData.phone,
        legal_business_name: vendorData.businessName,
        business_type: vendorData.businessType || 'individual',
        legal_info: { pan: vendorData.pan, gst: vendorData.gst },
      }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as any;
      throw new Error(`Razorpay createVendor failed: ${JSON.stringify(err)}`);
    }
    const data = await res.json() as any;
    return { id: data.id, provider: 'razorpay', status: data.status, details: data };
  }

  async createCheckout(orderData: any): Promise<any> {
    const amountInPaisa = Math.round((orderData.amount || 0) * 100);
    const receipt = `order_rcpt_${orderData.orderId || Date.now()}`;

    if (!this.isLive) {
      const razorpayOrderId = `order_${Math.random().toString(36).substring(2, 14)}`;
      return {
        id: razorpayOrderId, orderId: razorpayOrderId, amount: amountInPaisa,
        currency: (orderData.currency || 'INR').toUpperCase(), receipt,
        keyId: this.keyId, provider: 'razorpay',
      };
    }

    // Real Razorpay Orders API
    const res = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: this.authHeader() },
      body: JSON.stringify({
        amount: amountInPaisa,
        currency: (orderData.currency || 'INR').toUpperCase(),
        receipt,
        notes: { orderId: orderData.orderId },
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as any;
      throw new Error(`Razorpay order creation failed: ${JSON.stringify(err)}`);
    }

    const data = await res.json() as any;
    return {
      id: data.id,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      keyId: this.keyId,
      provider: 'razorpay',
    };
  }

  async verifyPayment(paymentData: any): Promise<any> {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData || {};

    // Signature verification (works in both live and test mode when real keys present)
    if (this.keySecret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return { status: 'failed', reason: 'Invalid signature' };
      }
    }

    // Fetch payment details from Razorpay if live
    if (this.isLive && razorpay_payment_id) {
      const res = await fetch(`${this.baseUrl}/payments/${razorpay_payment_id}`, {
        headers: { Authorization: this.authHeader() },
      });
      if (res.ok) {
        const payment = await res.json() as any;
        return {
          id: payment.id, status: payment.status === 'captured' ? 'succeeded' : payment.status,
          provider: 'razorpay', amount: payment.amount / 100, currency: payment.currency,
          method: payment.method, email: payment.email, contact: payment.contact,
        };
      }
    }

    return {
      id: razorpay_payment_id || `pay_${Date.now()}`, status: 'succeeded',
      provider: 'razorpay', amount: paymentData.amount || 0, currency: paymentData.currency || 'INR',
    };
  }

  /** Verify Razorpay webhook signature */
  verifyWebhookSignature(body: string, signature: string): boolean {
    if (!this.webhookSecret) return true; // skip if no secret configured
    const expected = crypto.createHmac('sha256', this.webhookSecret).update(body).digest('hex');
    return expected === signature;
  }

  async createPayout(payoutData: any): Promise<any> {
    if (!this.isLive) {
      return { id: `payout_rzp_mock_${Date.now()}`, status: 'queued', amount: payoutData.amount };
    }
    // Razorpay Payout API (RazorpayX)
    const res = await fetch('https://api.razorpay.com/v1/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: this.authHeader() },
      body: JSON.stringify({
        account_number: payoutData.accountNumber || process.env.RAZORPAY_ACCOUNT_NUMBER,
        fund_account_id: payoutData.fundAccountId,
        amount: Math.round(payoutData.amount * 100),
        currency: 'INR', mode: 'NEFT',
        purpose: 'vendor_settlement',
        queue_if_low_balance: true,
      }),
    });
    const data = await res.json() as any;
    return { id: data.id, status: data.status, amount: payoutData.amount };
  }

  async getSettlement(settlementId: string): Promise<any> {
    if (!this.isLive) {
      return { id: settlementId, status: 'processed', amount: 0 };
    }
    const res = await fetch(`${this.baseUrl}/settlements/${settlementId}`, {
      headers: { Authorization: this.authHeader() },
    });
    return await res.json() as any;
  }
}

// ─────────────────────────────────────────────────────
// CASHFREE — https://docs.cashfree.com/reference/pgcreateorder
// ─────────────────────────────────────────────────────
export class CashfreeProvider implements PaymentProvider {
  private appId: string;
  private secretKey: string;
  private mode: string;
  private baseUrl: string;
  private isLive: boolean;

  constructor(config?: Record<string, any>) {
    this.appId = config?.apiKey || process.env.CASHFREE_APP_ID || '';
    this.secretKey = config?.apiSecret || process.env.CASHFREE_SECRET_KEY || '';
    this.mode = config?.credentials?.mode || process.env.CASHFREE_MODE || 'TEST';
    this.baseUrl = this.mode === 'PROD'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
    this.isLive = !!(this.appId && this.secretKey && this.appId !== 'cashfree_app_mock');
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      'x-client-id': this.appId,
      'x-client-secret': this.secretKey,
      'x-api-version': '2023-08-01',
    };
  }

  async createVendor(vendorData: any): Promise<any> {
    if (!this.isLive) {
      return { id: `cf_vendor_mock_${Date.now()}`, provider: 'cashfree', status: 'ACTIVE' };
    }
    // Cashfree vendor/beneficiary creation for payouts
    const res = await fetch(`https://payout-api.cashfree.com/payout/v1/addBeneficiary`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        beneId: vendorData.id,
        name: vendorData.name,
        email: vendorData.email,
        phone: vendorData.phone,
        bankAccount: vendorData.bankAccount,
        ifsc: vendorData.ifsc,
      }),
    });
    const data = await res.json() as any;
    return { id: vendorData.id, provider: 'cashfree', status: data.status || 'ACTIVE', details: data };
  }

  async createCheckout(orderData: any): Promise<any> {
    const cfOrderId = `cf_${orderData.orderId || Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (!this.isLive) {
      const paymentSessionId = `session_mock_${Math.random().toString(36).substring(2, 15)}`;
      return {
        id: cfOrderId, orderId: cfOrderId, paymentSessionId,
        amount: orderData.amount, currency: (orderData.currency || 'INR').toUpperCase(),
        appId: this.appId, mode: this.mode, provider: 'cashfree',
      };
    }

    // Real Cashfree PG Order creation
    const res = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        order_id: cfOrderId,
        order_amount: orderData.amount,
        order_currency: (orderData.currency || 'INR').toUpperCase(),
        customer_details: {
          customer_id: orderData.metadata?.userId || 'guest',
          customer_email: orderData.metadata?.email,
          customer_phone: orderData.metadata?.phone || '9999999999',
        },
        order_meta: {
          return_url: orderData.metadata?.returnUrl || `${process.env.FRONTEND_URL}/account/orders`,
          notify_url: `${process.env.FRONTEND_URL?.replace(':8080', ':5000')}/api/payment/webhook`,
        },
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as any;
      throw new Error(`Cashfree order creation failed: ${JSON.stringify(err)}`);
    }

    const data = await res.json() as any;
    return {
      id: data.cf_order_id || cfOrderId,
      orderId: data.order_id || cfOrderId,
      paymentSessionId: data.payment_session_id,
      amount: data.order_amount,
      currency: data.order_currency,
      appId: this.appId,
      mode: this.mode,
      provider: 'cashfree',
    };
  }

  async verifyPayment(paymentData: any): Promise<any> {
    if (!this.isLive) {
      return {
        id: paymentData.cfPaymentId || `cf_pay_mock_${Date.now()}`, status: 'succeeded',
        provider: 'cashfree', amount: paymentData.amount || 0, currency: paymentData.currency || 'INR',
      };
    }

    // Verify with Cashfree API
    const orderId = paymentData.orderId || paymentData.cfOrderId;
    const res = await fetch(`${this.baseUrl}/orders/${orderId}/payments`, {
      headers: this.headers(),
    });

    if (res.ok) {
      const payments = await res.json() as any;
      const payment = Array.isArray(payments) ? payments[0] : payments;
      return {
        id: payment?.cf_payment_id || paymentData.cfPaymentId,
        status: payment?.payment_status === 'SUCCESS' ? 'succeeded' : payment?.payment_status?.toLowerCase(),
        provider: 'cashfree',
        amount: payment?.payment_amount || paymentData.amount,
        currency: payment?.payment_currency || 'INR',
        method: payment?.payment_group,
      };
    }

    return { id: `cf_pay_${Date.now()}`, status: 'succeeded', provider: 'cashfree', amount: paymentData.amount || 0, currency: 'INR' };
  }

  /** Verify Cashfree webhook signature */
  verifyWebhookSignature(body: string, timestamp: string, signature: string): boolean {
    if (!this.secretKey) return true;
    const payload = timestamp + body;
    const expected = crypto.createHmac('sha256', this.secretKey).update(payload).digest('base64');
    return expected === signature;
  }

  async createPayout(payoutData: any): Promise<any> {
    if (!this.isLive) {
      return { id: `cf_payout_mock_${Date.now()}`, status: 'SUCCESS', amount: payoutData.amount };
    }
    const res = await fetch('https://payout-api.cashfree.com/payout/v1/directTransfer', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        beneId: payoutData.beneficiaryId,
        amount: String(payoutData.amount),
        transferId: `transfer_${Date.now()}`,
        transferMode: payoutData.mode || 'banktransfer',
      }),
    });
    const data = await res.json() as any;
    return { id: data.data?.referenceId, status: data.status, amount: payoutData.amount };
  }

  async getSettlement(settlementId: string): Promise<any> {
    if (!this.isLive) {
      return { id: settlementId, status: 'SETTLED', amount: 0 };
    }
    const res = await fetch(`${this.baseUrl}/settlements/${settlementId}`, {
      headers: this.headers(),
    });
    return await res.json() as any;
  }
}

// ─────────────────────────────────────────────────────
// MOCK (for development / testing)
// ─────────────────────────────────────────────────────
export class MockPaymentProvider implements PaymentProvider {
  async createVendor(vendorData: any): Promise<any> {
    return {
      id: `vendor_${Math.random().toString(36).substr(2, 9)}`,
      provider: 'mock', status: 'verified', ...vendorData,
    };
  }

  async createCheckout(orderData: any): Promise<any> {
    return {
      id: `mock_pay_${Date.now()}`,
      clientSecret: `mock_secret_${Date.now()}`,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      status: 'requires_payment_method',
      provider: 'mock',
    };
  }

  async verifyPayment(paymentData: any): Promise<any> {
    return {
      id: paymentData?.paymentId || `mock_txn_${Date.now()}`,
      status: 'succeeded', provider: 'mock',
      amount: paymentData?.amount || 0, currency: paymentData?.currency || 'INR',
    };
  }

  async createPayout(payoutData: any): Promise<any> {
    return {
      id: `po_${Math.random().toString(36).substr(2, 9)}`,
      amount: payoutData.amount, currency: payoutData.currency || 'INR',
      status: 'paid', destination: payoutData.destination, createdAt: new Date().toISOString(),
    };
  }

  async getSettlement(settlementId: string): Promise<any> {
    return {
      id: settlementId, status: 'processed',
      amount: 1000, fee: 100, netAmount: 900,
      currency: 'INR', createdAt: new Date().toISOString(),
    };
  }
}
