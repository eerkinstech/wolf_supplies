const Order = require('../models/Order');
const crypto = require('crypto');
const { sendOrderStatusUpdateEmail, sendOrderWithPDF } = require('../utils/emailService');
const { generateOrderPDF } = require('../utils/pdfGenerator');
const EventLog = require('../models/EventLog');

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('orderItems.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders by guestId (for order history without login)
const getOrdersByGuestId = async (req, res) => {
  try {
    const guestId = req.guestId;

    const orders = await Order.find({ guestId })
      .populate('orderItems.product', 'name price image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order (anyone can view any order)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let order = null;

    // First try to find by orderId (guest order lookup)
    if (id && typeof id === 'string' && id.startsWith('ORD-')) {
      order = await Order.findOne({ orderId: id })
        .populate('user', 'name email')
        .populate('orderItems.product', 'name price image');
    }

    // If not found and id looks like MongoDB ObjectId, try findById
    if (!order && id && id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id)
        .populate('user', 'name email')
        .populate('orderItems.product', 'name price image');
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new order (guest or authenticated users)
const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalAmount, billingAddress, couponCode, discountAmount } = req.body;

  try {
    const guestId = req.guestId;
    const userId = req.user?._id;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // create deterministic-ish unique order id
    const orderId = `ORD-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;

    // Clean selectedVariants for non-variant products before saving
    const cleanedOrderItems = await Promise.all(orderItems.map(async (it) => {
      const itemData = {
        name: it.name,
        qty: it.qty || it.quantity || 1,
        price: it.price,
        product: it.product || it._id || null,
        image: it.image,
        variantImage: it.variantImage || null,
        selectedVariants: it.selectedVariants || null,
        selectedSize: it.selectedSize || null,
        selectedColor: it.selectedColor || null,
        colorCode: it.colorCode || null,
        variant: it.variant || null,
        sku: it.sku || null,
        variantId: it.variantId || null,
      };

      // Check if this product actually has variants defined
      if (itemData.product) {
        try {
          const Product = (await import('../models/Product.js')).default;
          const product = await Product.findById(itemData.product).select('variants');

          // If product has no variants array or empty variants, clear selectedVariants
          if (!product || !product.variants || product.variants.length === 0) {
            itemData.selectedVariants = null;
            itemData.variant = null;
          }
        } catch (err) {

          // On error, be conservative and keep the data as-is
        }
      }

      return itemData;
    }));

    const order = new Order({
      orderId,
      user: userId || null, // Allow null user for guest orders
      guestId: guestId, // Always set guestId for tracking
      orderItems: cleanedOrderItems,
      contactDetails: {
        firstName: shippingAddress?.firstName || '',
        lastName: shippingAddress?.lastName || '',
        email: shippingAddress?.email || '',
        phone: shippingAddress?.phone || '',
      },
      shippingAddress: {
        address: shippingAddress?.address || '',
        apartment: shippingAddress?.apartment || '',
        city: shippingAddress?.city || '',
        stateRegion: shippingAddress?.stateRegion || '',
        postalCode: shippingAddress?.postalCode || '',
        country: shippingAddress?.country || '',
      },
      billingAddress: billingAddress ? {
        address: billingAddress?.address || '',
        apartment: billingAddress?.apartment || '',
        city: billingAddress?.city || '',
        stateRegion: billingAddress?.stateRegion || '',
        postalCode: billingAddress?.postalCode || '',
        country: billingAddress?.country || '',
      } : null,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice: totalAmount,
      couponCode: couponCode || null,
      discountAmount: discountAmount || 0,
      status: 'pending',
    });

    const createdOrder = await order.save();

    // Log purchase event
    try {
      await EventLog.create({
        guestId,
        eventType: 'purchase',
        metadata: {
          orderId: createdOrder.orderId,
          cartValue: totalAmount,
          itemCount: orderItems.length,
        },
      });
    } catch (eventErr) {

    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send status update email to customer (in background - don't wait)
    sendOrderStatusUpdateEmail(order, status).catch(emailErr => {
      console.error(`✗ Failed to send status update email for order ${order.orderId}:`, emailErr.message);
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order payment status (admin only)
const updateOrderPayment = async (req, res) => {
  try {
    const { isPaid, paidAt } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isPaid, paidAt: isPaid ? paidAt || Date.now() : null },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order delivery status (admin only)
const updateOrderDelivery = async (req, res) => {
  try {
    const { deliveryStatus } = req.body;

    const updateData = { deliveryStatus };

    // Set deliveredAt timestamp when marking as delivered
    if (deliveryStatus === 'delivered') {
      updateData.deliveredAt = Date.now();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send status update email to customer (in background - don't wait)
    sendOrderStatusUpdateEmail(order).catch(emailErr => {
      console.error(`✗ Failed to send delivery status email for order ${order.orderId}:`, emailErr.message);
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order refund status (admin only)
const updateOrderRefund = async (req, res) => {
  try {
    const { deliveryStatus } = req.body;

    const updateData = { deliveryStatus };

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send status update email to customer (in background - don't wait)
    sendOrderStatusUpdateEmail(order).catch(emailErr => {
      console.error(`✗ Failed to send refund status email for order ${order.orderId}:`, emailErr.message);
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order fulfillment status (admin only)
const updateOrderFulfillment = async (req, res) => {
  try {
    const { fulfillmentStatus } = req.body;

    if (!['unfulfilled', 'fulfilled'].includes(fulfillmentStatus)) {
      return res.status(400).json({ message: 'Invalid fulfillment status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { fulfillmentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send status update email to customer (in background - don't wait)
    sendOrderStatusUpdateEmail(order).catch(emailErr => {
      console.error(`✗ Failed to send fulfillment status email for order ${order.orderId}:`, emailErr.message);
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete order (admin only)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order remarks (admin only)
const updateOrderRemarks = async (req, res) => {
  try {
    const { remarks } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { remarks: remarks || '' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update contact details (admin only)
const updateOrderContact = async (req, res) => {
  try {
    const { contactDetails } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { contactDetails },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update shipping address (admin only)
const updateOrderShipping = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { shippingAddress },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update billing address (admin only)
const updateOrderBilling = async (req, res) => {
  try {
    const { billingAddress } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { billingAddress },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resend order invoice PDF to customer (admin only)
const resendOrderPDF = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Generate PDF and send
    const pdfBuffer = await generateOrderPDF(order);
    await sendOrderWithPDF(order, pdfBuffer);

    res.json({ message: 'Order invoice PDF sent successfully to customer' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllOrders,
  getUserOrders,
  getOrdersByGuestId,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderPayment,
  updateOrderDelivery,
  updateOrderRefund,
  updateOrderFulfillment,
  deleteOrder,
  updateOrderRemarks,
  updateOrderContact,
  updateOrderShipping,
  updateOrderBilling,
  resendOrderPDF
};

