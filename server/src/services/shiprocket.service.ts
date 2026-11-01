import axios from 'axios';

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

interface ShiprocketAuthConfig {
  email?: string;
  password?: string;
  pickupLocation?: string;
}

export interface PincodeCheckPayload {
  pickupPostcode?: string;
  deliveryPostcode: string;
  weight?: number; // in kg
  cod?: boolean;
}

export interface ShiprocketOrderItem {
  name: string;
  sku?: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: number;
}

export interface CreateShiprocketOrderPayload {
  orderId: string; // Avoro Order Number or ID
  orderDate: Date | string;
  channelId?: string;
  comment?: string;

  // Customer / Shipping Details
  customerName: string;
  customerLastName?: string;
  address: string;
  address2?: string;
  city: string;
  pincode: string;
  state?: string;
  country?: string;
  email: string;
  phone: string;

  // Order breakdown
  orderItems: ShiprocketOrderItem[];
  paymentMethod: 'Prepaid' | 'COD';
  subTotal: number;
  shippingCharges?: number;
  discount?: number;

  // Package specs
  pickupLocation?: string;
  length?: number; // cm
  breadth?: number; // cm
  height?: number; // cm
  weight?: number; // kg
}

class ShiprocketService {
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  private getCredentials(): ShiprocketAuthConfig {
    return {
      email: process.env.SHIPROCKET_EMAIL || 'shudhanshup2004@gmail.com',
      password: process.env.SHIPROCKET_PASSWORD || 'q5xDiaq8Tvf9%YBWyXEJ89LXcLMn6oBD',
      pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || 'work-1',
    };
  }

  /**
   * Get valid Shiprocket Bearer authentication token
   */
  async getAuthToken(): Promise<string> {
    const { email, password } = this.getCredentials();

    if (!email || !password) {
      throw new Error(
        'Shiprocket credentials missing. Please set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in environment.'
      );
    }

    // Return cached token if valid (valid for 9 days to be safe)
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data && response.data.token) {
        this.token = response.data.token;
        // Cache token for 9 days (Shiprocket tokens expire in 10 days)
        this.tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
        return response.data.token as string;
      }

      throw new Error('Invalid authentication response from Shiprocket API.');
    } catch (error: any) {
      console.error('Shiprocket Authentication Error:', error?.response?.data || error.message);
      throw new Error(`Shiprocket Auth Failed: ${error?.response?.data?.message || error.message}`);
    }
  }

  /**
   * Helper to make authenticated requests to Shiprocket API
   */
  private async apiRequest(method: 'GET' | 'POST' | 'PUT', endpoint: string, data?: any, params?: any) {
    const token = await this.getAuthToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      params,
    };

    try {
      if (method === 'GET') {
        const response = await axios.get(`${SHIPROCKET_BASE_URL}${endpoint}`, config);
        return response.data;
      } else if (method === 'POST') {
        const response = await axios.post(`${SHIPROCKET_BASE_URL}${endpoint}`, data, config);
        return response.data;
      }
    } catch (error: any) {
      // If 401 Unauthorized, clear cached token
      if (error?.response?.status === 401) {
        this.token = null;
        this.tokenExpiry = null;
      }
      console.error(`Shiprocket API Error [${endpoint}]:`, error?.response?.data || error.message);
      throw new Error(
        error?.response?.data?.message ||
          (typeof error?.response?.data === 'string' ? error.response.data : JSON.stringify(error?.response?.data)) ||
          error.message
      );
    }
  }

  /**
   * Get registered pickup locations from Shiprocket account
   */
  async getPickupLocations() {
    return await this.apiRequest('GET', '/settings/company/pickup');
  }

  /**
   * Check courier serviceability & estimated delivery time for a delivery pincode
   */
  async checkServiceability(payload: PincodeCheckPayload) {
    const pickupPostcode = payload.pickupPostcode || process.env.SHIPROCKET_PICKUP_POSTCODE || '231001';
    const weight = payload.weight || 0.5; // default 0.5kg
    const cod = payload.cod ? 1 : 0;

    return await this.apiRequest('GET', '/courier/serviceability/', null, {
      pickup_postcode: pickupPostcode,
      delivery_postcode: payload.deliveryPostcode,
      weight: weight,
      cod: cod,
    });
  }

  /**
   * Create Custom / Adhoc Order in Shiprocket
   */
  async createCustomOrder(payload: CreateShiprocketOrderPayload) {
    const { pickupLocation } = this.getCredentials();

    // Format date as "YYYY-MM-DD HH:mm"
    const dateObj = new Date(payload.orderDate);
    const formattedDate =
      dateObj.getFullYear() +
      '-' +
      String(dateObj.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(dateObj.getDate()).padStart(2, '0') +
      ' ' +
      String(dateObj.getHours()).padStart(2, '0') +
      ':' +
      String(dateObj.getMinutes()).padStart(2, '0');

    // Split customer name into first & last name if needed
    const nameParts = payload.customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = payload.customerLastName || nameParts.slice(1).join(' ') || '.';

    // Format items
    const items = payload.orderItems.map((item) => ({
      name: item.name,
      sku: item.sku || item.name.replace(/\s+/g, '-').toUpperCase(),
      units: item.units,
      selling_price: item.selling_price,
      discount: item.discount ?? 0,
      tax: item.tax !== undefined && item.tax !== null ? Number(item.tax) : 18,
      hsn: item.hsn ? Number(item.hsn) : 33072000,
    }));

    const shiprocketBody = {
      order_id: payload.orderId,
      order_date: formattedDate,
      pickup_location: payload.pickupLocation || pickupLocation,
      channel_id: payload.channelId || '',
      comment: payload.comment || 'Avoro Order',
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: payload.address,
      billing_address_2: payload.address2 || '',
      billing_city: payload.city,
      billing_pincode: payload.pincode,
      billing_state: payload.state || 'State',
      billing_country: payload.country || 'India',
      billing_email: payload.email,
      billing_phone: payload.phone.replace(/[^0-9]/g, '').slice(-10), // Clean 10-digit mobile number
      shipping_is_billing: true,
      order_items: items,
      payment_method: payload.paymentMethod,
      shipping_charges: payload.shippingCharges || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: payload.discount || 0,
      sub_total: payload.subTotal,
      length: payload.length || 15,
      breadth: payload.breadth || 10,
      height: payload.height || 5,
      weight: payload.weight || 0.5,
    };

    try {
      return await this.apiRequest('POST', '/orders/create/adhoc', shiprocketBody);
    } catch (error: any) {
      // If error is about pickup location, attempt auto-fallback to primary location registered in Shiprocket
      const errorMsg = error?.message || '';
      if (errorMsg.toLowerCase().includes('pickup location')) {
        console.warn(`Shiprocket pickup location error: "${errorMsg}". Fetching valid pickup locations...`);
        try {
          const pickupRes = await this.getPickupLocations();
          const addresses = pickupRes?.data?.shipping_address || [];
          if (addresses.length > 0) {
            // Find primary location or first available location
            const primaryLoc = addresses.find((loc: any) => loc.is_primary_location === 1) || addresses[0];
            const validLocationName = primaryLoc.pickup_location;

            console.info(`Retrying Shiprocket order creation with valid pickup location: "${validLocationName}"`);
            shiprocketBody.pickup_location = validLocationName;
            return await this.apiRequest('POST', '/orders/create/adhoc', shiprocketBody);
          }
        } catch (fallbackError: any) {
          console.error('Failed auto-fallback for pickup locations:', fallbackError?.message);
        }
      }
      throw error;
    }
  }

  /**
   * Request AWB Assignment for a shipment
   */
  async assignAWB(shipmentId: number | string, courierId?: number | string) {
    const data: any = { shipment_id: shipmentId };
    if (courierId) {
      data.courier_id = courierId;
    }
    return await this.apiRequest('POST', '/courier/assign/awb', data);
  }

  /**
   * Generate Shipping Label PDF
   */
  async generateLabel(shipmentIds: (number | string)[]) {
    return await this.apiRequest('POST', '/courier/generate/label', {
      shipment_id: shipmentIds,
    });
  }

  /**
   * Generate Shiprocket Tax Invoice PDF
   */
  async generateInvoice(orderIds: (number | string)[]) {
    return await this.apiRequest('POST', '/orders/print/invoice', {
      order_ids: orderIds,
    });
  }

  /**
   * Request Pickup for shipment(s)
   */
  async generatePickup(shipmentIds: (number | string)[]) {
    return await this.apiRequest('POST', '/courier/generate/pickup', {
      shipment_id: shipmentIds,
    });
  }

  /**
   * Track Shipment by AWB Code
   */
  async trackByAWB(awbCode: string) {
    return await this.apiRequest('GET', `/courier/track/awb/${awbCode}`);
  }

  /**
   * Track Order by Shiprocket Order ID
   */
  async trackByOrderId(shiprocketOrderId: string | number) {
    return await this.apiRequest('GET', `/orders/show/${shiprocketOrderId}`);
  }
}

export const shiprocketService = new ShiprocketService();
