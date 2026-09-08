import { prisma } from "../server";
import { PaymentProviderFactory, PaymentProvider } from './paymentProvider';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_CURRENCY = 'usd';

/**
 * Checkout Service
 * Handles the complete checkout flow for multi-vendor marketplace
 */
export class CheckoutService {
  private paymentProvider: PaymentProvider;

  constructor(providerType: string = 'mock', providerConfig?: any) {
    this.paymentProvider = PaymentProviderFactory.createProvider(providerType, providerConfig);
  }

  /**
   * Main checkout function - orchestrates the entire process
   * @param userId - ID of the user checking out
   * @param shippingAddress - Shipping address for the order
   * @param providerType - Payment provider choice
   * @returns Checkout result with order details and payment information
   */
  async checkout(userId: string, shippingAddress: Record<string, unknown>, providerType: string = 'mock') {
    // Start a transaction to ensure data consistency
    return await prisma.$transaction(async (tx: any) => {
      // Step 1: Get user's cart
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              vendor: true
            }
          }
        }
      });

      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // Step 2: Validate stock and calculate totals
      const validationResult = await this.validateCartAndStock(tx, cartItems);
      if (!validationResult.valid) {
        throw new Error(validationResult.message);
      }

      // Fetch Marketplace Settings to get dynamic commission rate
      const commissionSetting = await tx.marketplaceSettings.findUnique({
        where: { key: 'PLATFORM_COMMISSION_RATE' }
      });
      let platformCommissionRate = 0.0; // Default 0% commission (100% earnings to seller)
      if (commissionSetting && commissionSetting.value) {
        const rate = parseFloat((commissionSetting.value as any).rate);
        if (!isNaN(rate)) {
          platformCommissionRate = rate;
        }
      }

      // Step 3: Group items by vendor
      const groupedItems = this.groupItemsByVendor(cartItems);

      // Step 4: Calculate totals for each vendor and overall
      const totals = this.calculateTotals(groupedItems, platformCommissionRate);

      // Step 5: Create parent order
      const parentOrder = await this.createParentOrder(tx, userId, shippingAddress, totals);

      // Step 6: Create vendor sub-orders
      const vendorOrders = await this.createVendorOrders(tx, parentOrder.id, groupedItems, totals);

      // Step 7: Create order items and update inventory
      await this.createOrderItemsAndUpdateInventory(tx, parentOrder.id, cartItems);

      // Step 8: Create commission records
      await this.createCommissions(tx, parentOrder.id, totals.vendorTotals, platformCommissionRate);

      // Step 9: Clear the cart
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      // Step 10: Prepare payment request
      const paymentRequest = await this.preparePayment(totals.grandTotal, parentOrder.id, providerType);

      // Return checkout response
      return {
        success: true,
        orderId: parentOrder.id,
        totalAmount: totals.grandTotal,
        currency: DEFAULT_CURRENCY,
        paymentClientSecret: paymentRequest.clientSecret,
        paymentSessionId: paymentRequest.paymentSessionId,
        paymentId: paymentRequest.id,
        provider: paymentRequest.provider,
        vendorOrders: vendorOrders.map((vo: any) => ({
          id: vo.id,
          vendorId: vo.vendorId,
          total: vo.total
        }))
      };
    });
  }

  private async validateCartAndStock(tx: any, cartItems: any[]) {
    for (const item of cartItems) {
      if (!item.product.isActive) {
        return { valid: false, message: `Product ${item.product.name} is no longer available` };
      }
      if (item.product.stock < item.quantity) {
        return { valid: false, message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}` };
      }
    }
    return { valid: true };
  }

  private groupItemsByVendor(cartItems: any[]) {
    const grouped: Record<string, any[]> = {};
    for (const item of cartItems) {
      const vendorId = item.product.vendorId;
      if (!grouped[vendorId]) {
        grouped[vendorId] = [];
      }
      grouped[vendorId].push(item);
    }
    return grouped;
  }

  private calculateTotals(groupedItems: Record<string, any[]>, commissionRate: number) {
    let grandTotal = 0;
    let grandTax = 0;
    let grandShipping = 0;
    let grandDiscount = 0;

    const vendorTotals: Record<string, { subtotal: number; tax: number; shipping: number; discount: number; total: number; commission: number; vendorEarnings: number }> = {};

    for (const [vendorId, items] of Object.entries(groupedItems)) {
      let vendorSubtotal = 0;

      for (const item of items) {
        vendorSubtotal += item.product.price * item.quantity;
      }

      // Mock tax/shipping for now
      const vendorTax = vendorSubtotal * 0.05; // 5% tax
      const vendorShipping = 0; // Free shipping
      const vendorDiscount = 0;

      const vendorTotal = vendorSubtotal + vendorTax + vendorShipping - vendorDiscount;

      const commission = vendorTotal * commissionRate;
      const vendorEarnings = vendorTotal - commission;

      vendorTotals[vendorId] = {
        subtotal: vendorSubtotal,
        tax: vendorTax,
        shipping: vendorShipping,
        discount: vendorDiscount,
        total: vendorTotal,
        commission,
        vendorEarnings
      };

      grandTotal += vendorTotal;
      grandTax += vendorTax;
      grandShipping += vendorShipping;
      grandDiscount += vendorDiscount;
    }

    return {
      grandTotal,
      grandSubtotal: grandTotal - grandTax - grandShipping + grandDiscount,
      grandTax,
      grandShipping,
      grandDiscount,
      vendorTotals
    };
  }

  private async createParentOrder(tx: any, userId: string, shippingAddress: Record<string, unknown>, totals: any) {
    return await tx.order.create({
      data: {
        userId,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        subtotal: totals.grandSubtotal,
        taxAmount: totals.grandTax,
        shippingCost: totals.grandShipping,
        discountAmount: totals.grandDiscount,
        total: totals.grandTotal,
        shippingAddress: JSON.stringify(shippingAddress),
      }
    });
  }

  private async createVendorOrders(tx: any, orderId: string, groupedItems: Record<string, any[]>, totals: any) {
    const vendorOrders = [];
    for (const [vendorId, items] of Object.entries(groupedItems)) {
      const vTotal = totals.vendorTotals[vendorId];
      const vendorOrder = await tx.vendorOrder.create({
        data: {
          orderId,
          vendorId,
          subtotal: vTotal.subtotal,
          discount: vTotal.discount,
          shipping: vTotal.shipping,
          tax: vTotal.tax,
          total: vTotal.total,
          status: 'pending',
          paymentStatus: 'pending'
        }
      });
      vendorOrders.push(vendorOrder);
    }
    return vendorOrders;
  }

  private async createOrderItemsAndUpdateInventory(tx: any, orderId: string, cartItems: any[]) {
    for (const item of cartItems) {
      await tx.orderItem.create({
        data: {
          orderId,
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity
        }
      });

      await tx.product.update({
        where: { id: item.product.id },
        data: {
          stock: { decrement: item.quantity }
        }
      });
    }
  }

  private async createCommissions(tx: any, orderId: string, vendorTotals: Record<string, any>, rate: number) {
    for (const [vendorId, vTotal] of Object.entries(vendorTotals)) {
      await tx.commission.create({
        data: {
          orderId,
          vendorId,
          rate: rate,
          vendorEarnings: vTotal.vendorEarnings,
          platformEarnings: vTotal.commission
        }
      });
    }
  }

  private async preparePayment(amount: number, orderId: string, providerType: string) {
    const paymentData = {
      amount, // Not converting to cents here, cashfree uses standard units, razorpay needs cents but we handle it in provider
      currency: DEFAULT_CURRENCY,
      orderId,
      metadata: { orderId }
    };
    return await this.paymentProvider.createCheckout(paymentData);
  }

  /**
   * Confirm payment after user completes payment flow
   */
  async confirmPayment(paymentId: string, orderId: string, providerPaymentId?: string) {
    return await prisma.$transaction(async (tx: any) => {
      // Get the provider type from the pending transaction if we can, or just verify
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { vendorOrders: true }
      });

      if (!order) throw new Error('Order not found');

      // Update parent order
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'COMPLETED' }
      });

      // Update vendor orders
      await tx.vendorOrder.updateMany({
        where: { orderId },
        data: { paymentStatus: 'COMPLETED' }
      });

      // Create Payment Transaction
      await tx.paymentTransaction.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          amount: order.total,
          currency: DEFAULT_CURRENCY,
          status: 'COMPLETED',
          provider: 'STRIPE', // Mock value, in real scenario passed from frontend
          providerPaymentId: providerPaymentId || paymentId,
          netAmount: order.total
        }
      });

      // Create Invoices for each Vendor Order
      const vendorOrders = await tx.vendorOrder.findMany({
        where: { orderId }
      });

      const orderItems = await tx.orderItem.findMany({
        where: { orderId },
        include: { product: true }
      });

      for (const vOrder of vendorOrders) {
        // Find items for this vendor
        const vItems = orderItems.filter((i: any) => i.product.vendorId === vOrder.vendorId);
        
        const invoiceNumber = `INV-${Date.now()}-${vOrder.vendorId.substring(0,4).toUpperCase()}`;
        
        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            orderId: order.id,
            vendorId: vOrder.vendorId,
            customerId: order.userId,
            status: 'paid',
            subtotal: vOrder.subtotal,
            taxAmount: vOrder.tax,
            shippingAmount: vOrder.shipping,
            discountAmount: vOrder.discount,
            totalAmount: vOrder.total,
            paidAmount: vOrder.total,
            balanceDue: 0,
            issueDate: new Date()
          }
        });

        // Create Invoice Items
        for (const item of vItems) {
          await tx.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              productId: item.productId,
              name: item.product.name,
              sku: item.product.sku,
              quantity: item.quantity,
              unitPrice: item.price,
              discount: 0,
              tax: (item.total * 0.05), // Mock 5% tax
              total: item.total + (item.total * 0.05)
            }
          });
        }
      }

      return {
        success: true,
        orderId: order.id,
        paymentStatus: 'COMPLETED'
      };
    });
  }
}

export default CheckoutService;