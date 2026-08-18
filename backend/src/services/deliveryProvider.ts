/**
 * Delivery Provider Interface & Integrations
 * Supports: Delhivery, Shiprocket, Vendor Self-Delivery, Platform Managed
 */

export interface DeliveryProvider {
  createShipment(shipmentData: ShipmentRequest): Promise<ShipmentResponse>;
  trackShipment(trackingId: string): Promise<TrackingResponse>;
  cancelShipment(shipmentId: string): Promise<any>;
  getServiceability(pincode: string): Promise<ServiceabilityResponse>;
  getShippingRates(rateRequest: RateRequest): Promise<RateResponse>;
}

export interface ShipmentRequest {
  orderId: string;
  vendorId: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  items: ShipmentItem[];
  weight: number; // in kg
  dimensions?: { length: number; width: number; height: number }; // in cm
  paymentMode: 'prepaid' | 'cod';
  codAmount?: number;
}

export interface Address {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface ShipmentItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface ShipmentResponse {
  id: string;
  trackingNumber: string;
  awb: string;
  label?: string;
  provider: string;
  status: string;
  estimatedDelivery?: string;
}

export interface TrackingResponse {
  trackingNumber: string;
  status: string;
  currentLocation?: string;
  events: { timestamp: string; status: string; location: string; description: string }[];
  estimatedDelivery?: string;
}

export interface ServiceabilityResponse {
  available: boolean;
  cod: boolean;
  prepaid: boolean;
  estimatedDays?: number;
}

export interface RateRequest {
  originPincode: string;
  destinationPincode: string;
  weight: number;
  cod: boolean;
}

export interface RateResponse {
  totalCharge: number;
  codCharge: number;
  freightCharge: number;
  estimatedDays: number;
}

// ─────────────────────────────────────────────────────
// FACTORY
// ─────────────────────────────────────────────────────
export class DeliveryProviderFactory {
  static createProvider(providerType: string, config?: Record<string, any>): DeliveryProvider {
    const type = (providerType || 'mock').toLowerCase();
    switch (type) {
      case 'delhivery':
        return new DelhiveryProvider(config);
      case 'shiprocket':
        return new ShiprocketProvider(config);
      case 'own':
        return new SelfDeliveryProvider();
      case 'platform':
        return new PlatformDeliveryProvider();
      default:
        return new MockDeliveryProvider();
    }
  }
}

// ─────────────────────────────────────────────────────
// DELHIVERY — https://track.delhivery.com/api/
// ─────────────────────────────────────────────────────
export class DelhiveryProvider implements DeliveryProvider {
  private apiKey: string;
  private warehouseId: string;
  private baseUrl = 'https://track.delhivery.com';
  private isLive: boolean;

  constructor(config?: Record<string, any>) {
    this.apiKey = config?.apiKey || process.env.DELHIVERY_API_KEY || '';
    this.warehouseId = config?.warehouseId || process.env.DELHIVERY_WAREHOUSE_ID || '';
    this.isLive = !!(this.apiKey && this.apiKey.length > 10);
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Token ${this.apiKey}`,
    };
  }

  async createShipment(data: ShipmentRequest): Promise<ShipmentResponse> {
    if (!this.isLive) {
      const awb = `DL${Date.now()}`;
      return {
        id: `del_${Date.now()}`, trackingNumber: awb, awb, provider: 'delhivery',
        status: 'manifested', estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(),
      };
    }

    const shipmentPayload = {
      shipments: [{
        name: data.deliveryAddress.name,
        add: data.deliveryAddress.addressLine1,
        pin: data.deliveryAddress.pincode,
        city: data.deliveryAddress.city,
        state: data.deliveryAddress.state,
        country: data.deliveryAddress.country || 'India',
        phone: data.deliveryAddress.phone,
        order: data.orderId,
        payment_mode: data.paymentMode === 'cod' ? 'COD' : 'Pre-paid',
        return_pin: data.pickupAddress.pincode,
        return_city: data.pickupAddress.city,
        return_phone: data.pickupAddress.phone,
        return_add: data.pickupAddress.addressLine1,
        return_state: data.pickupAddress.state,
        return_country: 'India',
        products_desc: data.items.map(i => i.name).join(', '),
        hsn_code: '',
        cod_amount: data.codAmount || 0,
        order_date: new Date().toISOString(),
        total_amount: data.items.reduce((s, i) => s + i.price * i.quantity, 0),
        seller_add: data.pickupAddress.addressLine1,
        seller_name: data.pickupAddress.name,
        seller_inv: data.orderId,
        quantity: data.items.reduce((s, i) => s + i.quantity, 0),
        waybill: '',
        shipment_width: data.dimensions?.width || 10,
        shipment_height: data.dimensions?.height || 10,
        weight: data.weight * 1000, // Convert kg to grams
        seller_gst_tin: '',
        shipping_mode: 'Surface',
        address_type: 'home',
      }],
      pickup_location: {
        name: this.warehouseId,
      },
    };

    const formData = `format=json&data=${encodeURIComponent(JSON.stringify(shipmentPayload))}`;

    const res = await fetch(`${this.baseUrl}/api/cmu/create.json`, {
      method: 'POST',
      headers: { ...this.headers(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    const result = await res.json();
    const pkg = result?.packages?.[0];

    return {
      id: pkg?.refnum || `del_${Date.now()}`,
      trackingNumber: pkg?.waybill || `DL${Date.now()}`,
      awb: pkg?.waybill || '',
      provider: 'delhivery',
      status: pkg?.status || 'manifested',
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(),
    };
  }

  async trackShipment(trackingId: string): Promise<TrackingResponse> {
    if (!this.isLive) {
      return {
        trackingNumber: trackingId, status: 'in_transit', currentLocation: 'Mumbai Hub',
        events: [{ timestamp: new Date().toISOString(), status: 'In Transit', location: 'Mumbai', description: 'Package in transit' }],
      };
    }

    const res = await fetch(`${this.baseUrl}/api/v1/packages/json/?waybill=${trackingId}`, {
      headers: this.headers(),
    });
    const data = await res.json();
    const shipment = data?.ShipmentData?.[0]?.Shipment;

    return {
      trackingNumber: trackingId,
      status: shipment?.Status?.Status?.toLowerCase() || 'unknown',
      currentLocation: shipment?.Status?.StatusLocation,
      events: (shipment?.Scans || []).map((s: any) => ({
        timestamp: s.ScanDetail?.ScanDateTime,
        status: s.ScanDetail?.Scan,
        location: s.ScanDetail?.ScannedLocation,
        description: s.ScanDetail?.Instructions || '',
      })),
      estimatedDelivery: shipment?.EstimatedDate,
    };
  }

  async cancelShipment(shipmentId: string): Promise<any> {
    if (!this.isLive) return { success: true, message: 'Shipment cancelled (mock)' };

    const res = await fetch(`${this.baseUrl}/api/p/edit`, {
      method: 'POST',
      headers: { ...this.headers(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `waybill=${shipmentId}&cancellation=true`,
    });
    return await res.json();
  }

  async getServiceability(pincode: string): Promise<ServiceabilityResponse> {
    if (!this.isLive) return { available: true, cod: true, prepaid: true, estimatedDays: 5 };

    const res = await fetch(`${this.baseUrl}/c/api/pin-codes/json/?filter_codes=${pincode}`, {
      headers: this.headers(),
    });
    const data = await res.json();
    const info = data?.delivery_codes?.[0]?.postal_code;
    return {
      available: !!info, cod: info?.cod === 'Y',
      prepaid: info?.pre_paid === 'Y', estimatedDays: info?.max_days || 7,
    };
  }

  async getShippingRates(rateReq: RateRequest): Promise<RateResponse> {
    if (!this.isLive) return { totalCharge: 65, codCharge: rateReq.cod ? 25 : 0, freightCharge: 40, estimatedDays: 5 };

    // Delhivery doesn't have a dedicated rate API — using approximate calculation
    const base = rateReq.weight <= 0.5 ? 40 : Math.ceil(rateReq.weight / 0.5) * 30;
    const codCharge = rateReq.cod ? 25 : 0;
    return { totalCharge: base + codCharge, codCharge, freightCharge: base, estimatedDays: 5 };
  }
}

// ─────────────────────────────────────────────────────
// SHIPROCKET — https://apidocs.shiprocket.in/
// ─────────────────────────────────────────────────────
export class ShiprocketProvider implements DeliveryProvider {
  private email: string;
  private password: string;
  private baseUrl = 'https://apiv2.shiprocket.in/v1/external';
  private token: string = '';
  private isLive: boolean;

  constructor(config?: Record<string, any>) {
    this.email = config?.apiKey || process.env.SHIPROCKET_EMAIL || '';
    this.password = config?.apiSecret || process.env.SHIPROCKET_PASSWORD || '';
    this.isLive = !!(this.email && this.password);
  }

  private async authenticate(): Promise<string> {
    if (this.token) return this.token;
    if (!this.isLive) return 'mock_token';

    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.email, password: this.password }),
    });

    if (!res.ok) throw new Error('Shiprocket authentication failed');
    const data = await res.json();
    this.token = data.token;
    return this.token;
  }

  private async headers() {
    const token = await this.authenticate();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async createShipment(data: ShipmentRequest): Promise<ShipmentResponse> {
    if (!this.isLive) {
      const awb = `SR${Date.now()}`;
      return {
        id: `sr_${Date.now()}`, trackingNumber: awb, awb, provider: 'shiprocket',
        status: 'created', estimatedDelivery: new Date(Date.now() + 4 * 86400000).toISOString(),
      };
    }

    const hdrs = await this.headers();

    // Step 1: Create order
    const orderRes = await fetch(`${this.baseUrl}/orders/create/adhoc`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({
        order_id: data.orderId,
        order_date: new Date().toISOString().split('T')[0],
        pickup_location: 'Primary',
        billing_customer_name: data.deliveryAddress.name,
        billing_last_name: '',
        billing_address: data.deliveryAddress.addressLine1,
        billing_address_2: data.deliveryAddress.addressLine2 || '',
        billing_city: data.deliveryAddress.city,
        billing_pincode: data.deliveryAddress.pincode,
        billing_state: data.deliveryAddress.state,
        billing_country: data.deliveryAddress.country || 'India',
        billing_email: '',
        billing_phone: data.deliveryAddress.phone,
        shipping_is_billing: true,
        order_items: data.items.map(item => ({
          name: item.name, sku: item.sku, units: item.quantity, selling_price: item.price, hsn: '',
        })),
        payment_method: data.paymentMode === 'cod' ? 'COD' : 'Prepaid',
        sub_total: data.items.reduce((s, i) => s + i.price * i.quantity, 0),
        length: data.dimensions?.length || 10,
        breadth: data.dimensions?.width || 10,
        height: data.dimensions?.height || 10,
        weight: data.weight,
      }),
    });

    const orderData = await orderRes.json();

    // Step 2: Generate AWB
    const awbRes = await fetch(`${this.baseUrl}/courier/assign/awb`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({
        shipment_id: orderData.shipment_id,
        courier_id: orderData.courier_id || '',
      }),
    });

    const awbData = await awbRes.json();

    return {
      id: String(orderData.order_id || `sr_${Date.now()}`),
      trackingNumber: awbData.response?.data?.awb_code || `SR${Date.now()}`,
      awb: awbData.response?.data?.awb_code || '',
      provider: 'shiprocket',
      status: 'created',
      estimatedDelivery: awbData.response?.data?.etd || new Date(Date.now() + 4 * 86400000).toISOString(),
    };
  }

  async trackShipment(trackingId: string): Promise<TrackingResponse> {
    if (!this.isLive) {
      return {
        trackingNumber: trackingId, status: 'in_transit', currentLocation: 'Delhi Hub',
        events: [{ timestamp: new Date().toISOString(), status: 'In Transit', location: 'Delhi', description: 'Shipment in transit' }],
      };
    }

    const hdrs = await this.headers();
    const res = await fetch(`${this.baseUrl}/courier/track/awb/${trackingId}`, { headers: hdrs });
    const data = await res.json();
    const tracking = data.tracking_data;

    return {
      trackingNumber: trackingId,
      status: tracking?.shipment_status?.toLowerCase() || 'unknown',
      currentLocation: tracking?.track_activities?.[0]?.activity,
      events: (tracking?.track_activities || []).map((a: any) => ({
        timestamp: a.date, status: a['sr-status'], location: a.location, description: a.activity,
      })),
      estimatedDelivery: tracking?.etd,
    };
  }

  async cancelShipment(shipmentId: string): Promise<any> {
    if (!this.isLive) return { success: true, message: 'Shipment cancelled (mock)' };

    const hdrs = await this.headers();
    const res = await fetch(`${this.baseUrl}/orders/cancel`, {
      method: 'POST',
      headers: hdrs,
      body: JSON.stringify({ ids: [shipmentId] }),
    });
    return await res.json();
  }

  async getServiceability(pincode: string): Promise<ServiceabilityResponse> {
    if (!this.isLive) return { available: true, cod: true, prepaid: true, estimatedDays: 4 };

    const hdrs = await this.headers();
    const res = await fetch(
      `${this.baseUrl}/courier/serviceability/?pickup_postcode=110001&delivery_postcode=${pincode}&weight=0.5&cod=1`,
      { headers: hdrs }
    );
    const data = await res.json();
    const available = data?.data?.available_courier_companies?.length > 0;
    return {
      available,
      cod: available, prepaid: available,
      estimatedDays: data?.data?.available_courier_companies?.[0]?.etd_days || 5,
    };
  }

  async getShippingRates(rateReq: RateRequest): Promise<RateResponse> {
    if (!this.isLive) return { totalCharge: 55, codCharge: rateReq.cod ? 30 : 0, freightCharge: 25, estimatedDays: 4 };

    const hdrs = await this.headers();
    const res = await fetch(
      `${this.baseUrl}/courier/serviceability/?pickup_postcode=${rateReq.originPincode}&delivery_postcode=${rateReq.destinationPincode}&weight=${rateReq.weight}&cod=${rateReq.cod ? 1 : 0}`,
      { headers: hdrs }
    );
    const data = await res.json();
    const cheapest = data?.data?.available_courier_companies?.sort((a: any, b: any) => a.rate - b.rate)?.[0];

    return {
      totalCharge: cheapest?.rate || 55,
      codCharge: cheapest?.cod_charges || 0,
      freightCharge: cheapest?.freight_charge || 25,
      estimatedDays: cheapest?.etd_days || 4,
    };
  }
}

// ─────────────────────────────────────────────────────
// SELF-DELIVERY (vendor manages own delivery)
// ─────────────────────────────────────────────────────
export class SelfDeliveryProvider implements DeliveryProvider {
  async createShipment(data: ShipmentRequest): Promise<ShipmentResponse> {
    return {
      id: `self_${Date.now()}`, trackingNumber: `SELF-${data.orderId.substring(0, 8)}`,
      awb: '', provider: 'own', status: 'pending_pickup',
    };
  }
  async trackShipment(trackingId: string): Promise<TrackingResponse> {
    return { trackingNumber: trackingId, status: 'vendor_managed', events: [] };
  }
  async cancelShipment(): Promise<any> { return { success: true }; }
  async getServiceability(): Promise<ServiceabilityResponse> {
    return { available: true, cod: true, prepaid: true };
  }
  async getShippingRates(): Promise<RateResponse> {
    return { totalCharge: 0, codCharge: 0, freightCharge: 0, estimatedDays: 3 };
  }
}

// ─────────────────────────────────────────────────────
// PLATFORM MANAGED (admin configures)
// ─────────────────────────────────────────────────────
export class PlatformDeliveryProvider implements DeliveryProvider {
  async createShipment(data: ShipmentRequest): Promise<ShipmentResponse> {
    return {
      id: `plat_${Date.now()}`, trackingNumber: `PLT-${data.orderId.substring(0, 8)}`,
      awb: '', provider: 'platform', status: 'awaiting_assignment',
    };
  }
  async trackShipment(trackingId: string): Promise<TrackingResponse> {
    return { trackingNumber: trackingId, status: 'platform_managed', events: [] };
  }
  async cancelShipment(): Promise<any> { return { success: true }; }
  async getServiceability(): Promise<ServiceabilityResponse> {
    return { available: true, cod: true, prepaid: true };
  }
  async getShippingRates(): Promise<RateResponse> {
    return { totalCharge: 0, codCharge: 0, freightCharge: 0, estimatedDays: 5 };
  }
}

// ─────────────────────────────────────────────────────
// MOCK (for testing)
// ─────────────────────────────────────────────────────
export class MockDeliveryProvider implements DeliveryProvider {
  async createShipment(data: ShipmentRequest): Promise<ShipmentResponse> {
    return {
      id: `mock_ship_${Date.now()}`, trackingNumber: `MOCK${Date.now()}`,
      awb: `MOCK${Date.now()}`, provider: 'mock', status: 'created',
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(),
    };
  }
  async trackShipment(trackingId: string): Promise<TrackingResponse> {
    return {
      trackingNumber: trackingId, status: 'in_transit', currentLocation: 'Mock Hub',
      events: [{ timestamp: new Date().toISOString(), status: 'In Transit', location: 'Mock City', description: 'Package in transit' }],
    };
  }
  async cancelShipment(): Promise<any> { return { success: true, message: 'Mock cancelled' }; }
  async getServiceability(): Promise<ServiceabilityResponse> {
    return { available: true, cod: true, prepaid: true, estimatedDays: 5 };
  }
  async getShippingRates(rateReq: RateRequest): Promise<RateResponse> {
    return { totalCharge: 50, codCharge: rateReq.cod ? 20 : 0, freightCharge: 30, estimatedDays: 5 };
  }
}

export default DeliveryProviderFactory;
