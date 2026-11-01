import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { shiprocketService } from '../services/shiprocket.service';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Public: Check pincode serviceability and EDD
 * GET /api/shipping/serviceability?pincode=400001&weight=0.5&cod=0
 */
export const checkPincodeServiceability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pincode, weight, cod } = req.query;

    if (!pincode || typeof pincode !== 'string') {
      res.status(400).json({ message: 'Delivery pincode is required' });
      return;
    }

    const result = await shiprocketService.checkServiceability({
      deliveryPostcode: pincode,
      weight: weight ? parseFloat(weight as string) : 0.5,
      cod: cod === '1' || cod === 'true',
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Pincode serviceability check error:', error?.message);
    res.status(500).json({
      message: error?.message || 'Failed to check pincode serviceability',
    });
  }
};

/**
 * Admin: Manually sync an order to Shiprocket
 * POST /api/shipping/orders/:orderId/sync
 */
export const syncOrderToShiprocket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId as string;

    const order: any = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: true } }, user: true },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const shippingAddress: any = order.shippingAddress || {};
    const fullName = shippingAddress.fullName || shippingAddress.name || 'Customer';
    const email = shippingAddress.email || order.guestEmail || order.user?.email || 'customer@example.com';
    const phone = shippingAddress.phone || shippingAddress.mobile || '9999999999';

    // Calculate total item price sum
    const itemsTotal = (order.orderItems || []).reduce(
      (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );

    // Calculate discount: itemsPrice + shippingPrice + (taxPrice || 0) - totalPrice
    const orderSubTotal = order.itemsPrice || itemsTotal;
    const orderShipping = order.shippingPrice || 0;
    const orderTax = order.taxPrice || 0;
    const calculatedDiscount = Math.max(
      0,
      Math.round((orderSubTotal + orderShipping + orderTax - order.totalPrice) * 100) / 100
    );

    // Get tax rate from store settings or default to standard 18% GST for perfumes
    let taxRate = 18;
    try {
      const taxSetting = await prisma.storeSetting.findUnique({ where: { key: 'tax_rate' } });
      if (taxSetting && taxSetting.value && !isNaN(parseFloat(taxSetting.value))) {
        const parsed = parseFloat(taxSetting.value);
        if (parsed > 0) taxRate = parsed;
      }
    } catch {
      taxRate = 18;
    }

    // Build items payload with correct product SKU, HSN, 18% GST Tax, and proportional item discount
    const items = (order.orderItems || []).map((item: any) => {
      let itemSku = item.sku;
      if (!itemSku && item.product && Array.isArray(item.product.variants)) {
        const matchingVariant = item.product.variants.find(
          (v: any) => v.size?.trim()?.toLowerCase() === item.size?.trim()?.toLowerCase() || v.size === item.size
        );
        itemSku = matchingVariant?.sku || item.product.variants[0]?.sku;
      }
      if (!itemSku) {
        itemSku = item.name.replace(/\s+/g, '-').toUpperCase();
      }

      // Distribute total discount proportionally across items
      const itemTotalPrice = (item.price || 0) * (item.quantity || 1);
      const itemDiscountTotal =
        itemsTotal > 0 && calculatedDiscount > 0
          ? Math.round((itemTotalPrice / itemsTotal) * calculatedDiscount * 100) / 100
          : 0;
      const unitDiscount =
        item.quantity > 0 ? Math.round((itemDiscountTotal / item.quantity) * 100) / 100 : 0;

      return {
        name: item.size ? `${item.name} (${item.size})` : item.name,
        sku: itemSku,
        units: item.quantity,
        selling_price: item.price,
        discount: unitDiscount,
        tax: taxRate,
        hsn: 33072000,
      };
    });

    const response = await shiprocketService.createCustomOrder({
      orderId: order.orderNumber || order.id,
      orderDate: order.createdAt,
      customerName: fullName,
      address: shippingAddress.address || shippingAddress.street || 'Address',
      address2: shippingAddress.address2 || shippingAddress.apartment || '',
      city: shippingAddress.city || 'City',
      pincode: shippingAddress.postalCode || shippingAddress.pincode || '110001',
      state: shippingAddress.state || 'State',
      country: shippingAddress.country || 'India',
      email: email,
      phone: phone,
      orderItems: items,
      paymentMethod: order.paymentMethod?.toLowerCase().includes('cod') ? 'COD' : 'Prepaid',
      subTotal: orderSubTotal,
      discount: calculatedDiscount,
      shippingCharges: orderShipping,
    });

    // Update order with Shiprocket details
    const srOrderId = response?.order_id?.toString() || response?.payload?.order_id?.toString();
    const srShipmentId = response?.shipment_id?.toString() || response?.payload?.shipment_id?.toString();
    const srAwbCode = response?.awb_code || null;

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        shiprocketOrderId: srOrderId || order.shiprocketOrderId,
        shiprocketShipmentId: srShipmentId || order.shiprocketShipmentId,
        shiprocketAwbCode: srAwbCode || order.shiprocketAwbCode,
        shiprocketStatus: response?.status || 'ORDER_CREATED',
        status: 'PROCESSING',
      },
    });

    res.status(200).json({
      message: 'Order synced to Shiprocket successfully',
      shiprocketResponse: response,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Shiprocket sync error:', error);
    res.status(500).json({ message: error?.message || 'Failed to sync order to Shiprocket' });
  }
};

/**
 * Admin: Assign AWB Code for a shipment
 * POST /api/shipping/orders/:orderId/assign-awb
 */
export const assignAWB = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId as string;
    const { courierId } = req.body || {};

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || !order.shiprocketShipmentId) {
      res.status(400).json({ message: 'Order has no active Shiprocket shipment ID. Sync order first.' });
      return;
    }

    const response = await shiprocketService.assignAWB(order.shiprocketShipmentId, courierId);

    const awbCode = response?.response?.data?.awb_code || response?.awb_code;
    const courierName = response?.response?.data?.courier_name || response?.courier_name;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        shiprocketAwbCode: awbCode || order.shiprocketAwbCode,
        shiprocketCourierName: courierName || order.shiprocketCourierName,
        shiprocketStatus: 'AWB_ASSIGNED',
      },
    });

    res.status(200).json({
      message: 'AWB assigned successfully',
      response,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('AWB assignment error:', error);
    res.status(500).json({ message: error?.message || 'Failed to assign AWB' });
  }
};

/**
 * Admin: Get shipping label URL
 * GET /api/shipping/orders/:orderId/label
 */
export const getShippingLabel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId as string;
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || !order.shiprocketShipmentId) {
      res.status(400).json({ message: 'Order has no active Shiprocket shipment ID.' });
      return;
    }

    const response = await shiprocketService.generateLabel([order.shiprocketShipmentId]);
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Shipping label generation error:', error);
    res.status(500).json({ message: error?.message || 'Failed to generate shipping label' });
  }
};

/**
 * Admin: Generate Pickup for shipment
 * POST /api/shipping/orders/:orderId/generate-pickup
 */
export const generatePickup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId as string;
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || !order.shiprocketShipmentId) {
      res.status(400).json({ message: 'Order has no active Shiprocket shipment ID.' });
      return;
    }

    const response = await shiprocketService.generatePickup([order.shiprocketShipmentId]);

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        shiprocketStatus: 'PICKUP_SCHEDULED',
      },
    });

    res.status(200).json({
      message: 'Pickup generated successfully',
      response,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Generate pickup error:', error);
    res.status(500).json({ message: error?.message || 'Failed to generate pickup' });
  }
};

/**
 * Public/User: Track Order by order ID
 * GET /api/shipping/orders/:orderId/track
 */
export const trackOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId as string;
    const cleanId = orderId ? orderId.trim() : '';

    if (!cleanId) {
      res.status(400).json({ message: 'Order ID or tracking code is required' });
      return;
    }

    // Search by ID, orderNumber, shiprocketAwbCode, or shiprocketOrderId
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { orderNumber: cleanId },
          { orderNumber: cleanId.toUpperCase() },
          { shiprocketAwbCode: cleanId },
          { shiprocketOrderId: cleanId }
        ]
      },
      include: {
        orderItems: true
      }
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found. Please check your Order Number or Tracking ID.' });
      return;
    }

    let trackingData: any = null;
    if (order.shiprocketAwbCode) {
      try {
        trackingData = await shiprocketService.trackByAWB(order.shiprocketAwbCode);
      } catch (e) {
        console.error('Shiprocket tracking fetch by AWB failed:', e);
      }
    } else if (order.shiprocketOrderId) {
      try {
        trackingData = await shiprocketService.trackByOrderId(order.shiprocketOrderId);
      } catch (e) {
        console.error('Shiprocket tracking fetch by OrderId failed:', e);
      }
    }

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`,
        status: order.status,
        createdAt: order.createdAt,
        totalPrice: order.totalPrice,
        isPaid: order.isPaid,
        shippingAddress: order.shippingAddress,
        shiprocketCourierName: order.shiprocketCourierName,
        shiprocketAwbCode: order.shiprocketAwbCode,
        shiprocketTrackingUrl: order.shiprocketTrackingUrl,
        items: (order.orderItems || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price
        }))
      },
      tracking: trackingData,
      // Fallback top-level properties for backward compatibility
      shiprocketAwbCode: order.shiprocketAwbCode,
      shiprocketCourierName: order.shiprocketCourierName,
      shiprocketTrackingUrl: order.shiprocketTrackingUrl,
      tracking_data: trackingData?.tracking_data || trackingData
    });
  } catch (error: any) {
    console.error('Tracking error:', error);
    res.status(500).json({ message: error?.message || 'Failed to fetch tracking info' });
  }
};

/**
 * Webhook: Receive real-time tracking updates from Shiprocket
 * POST /api/shipping/webhook/shiprocket
 */
export const handleShiprocketWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;
    console.log('Received Shiprocket Webhook:', JSON.stringify(body, null, 2));

    const srOrderId = body?.order_id?.toString();
    const awbCode = body?.awb || body?.awb_code;
    const currentStatus = body?.current_status || body?.status;
    const courierName = body?.courier_name;
    const trackingUrl = body?.tracking_url;

    if (!srOrderId && !awbCode) {
      res.status(400).json({ message: 'Missing order_id or awb in webhook payload' });
      return;
    }

    // Find order in database
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(srOrderId ? [{ shiprocketOrderId: srOrderId }, { orderNumber: srOrderId }, { id: srOrderId }] : []),
          ...(awbCode ? [{ shiprocketAwbCode: awbCode }] : []),
        ],
      },
    });

    if (order) {
      let avoroStatus = order.status;

      // Map Shiprocket status to Avoro OrderStatus enum
      if (currentStatus) {
        const normalized = currentStatus.toUpperCase();
        if (normalized.includes('DELIVERED')) {
          avoroStatus = 'DELIVERED';
        } else if (
          normalized.includes('SHIPPED') ||
          normalized.includes('IN TRANSIT') ||
          normalized.includes('OUT FOR DELIVERY') ||
          normalized.includes('PICKED UP')
        ) {
          avoroStatus = 'SHIPPED';
        } else if (normalized.includes('CANCELED') || normalized.includes('CANCELLED')) {
          avoroStatus = 'CANCELLED';
        }
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          shiprocketStatus: currentStatus || order.shiprocketStatus,
          shiprocketAwbCode: awbCode || order.shiprocketAwbCode,
          shiprocketCourierName: courierName || order.shiprocketCourierName,
          shiprocketTrackingUrl: trackingUrl || order.shiprocketTrackingUrl,
          status: avoroStatus,
          isDelivered: avoroStatus === 'DELIVERED' ? true : order.isDelivered,
          deliveredAt: avoroStatus === 'DELIVERED' && !order.deliveredAt ? new Date() : order.deliveredAt,
        },
      });
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error: any) {
    console.error('Shiprocket Webhook handling error:', error);
    res.status(500).json({ message: 'Error processing webhook' });
  }
};

/**
 * Admin: Get all registered pickup locations from Shiprocket
 * GET /api/shipping/pickup-locations
 */
export const getPickupLocations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const locations = await shiprocketService.getPickupLocations();
    res.status(200).json(locations);
  } catch (error: any) {
    console.error('Fetch pickup locations error:', error);
    res.status(500).json({ message: error?.message || 'Failed to fetch pickup locations' });
  }
};

/**
 * Admin: Get Shiprocket Tax Invoice URL
 * GET /api/shipping/orders/:orderId/invoice
 */
export const getShiprocketInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId as string;
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order || !order.shiprocketOrderId) {
      res.status(400).json({ message: 'Order has no active Shiprocket order ID. Sync order first.' });
      return;
    }

    const response = await shiprocketService.generateInvoice([order.shiprocketOrderId]);
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Shiprocket invoice generation error:', error);
    res.status(500).json({ message: error?.message || 'Failed to generate Shiprocket tax invoice' });
  }
};

