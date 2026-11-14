import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { getRazorpay } from '../config/razorpay.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

// POST /api/checkout/create-order
export async function createOrder(req, res, next) {
  try {
    const { productId } = req.body;
    if (!productId) throw new AppError('productId is required', 400, 'MISSING_PRODUCT');
    if (!mongoose.isValidObjectId(productId)) throw new AppError('Product not found', 404, 'NOT_FOUND');

    const product = await Product.findOne({ _id: productId, status: 'active' }).lean();
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');

    // Amount is always taken from the DB — never trust the frontend.
    const amountPaise = Math.round(product.sellingPrice * 100);

    const receipt = `rcpt_${productId}_${Date.now()}`;

    const order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: {
        seller: 'Aman Singh Nayak',
        product_id: String(product._id),
        product_name: product.name,
        purpose: 'Purchase of Digital Educational Notes and Study Materials',
      },
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,       // paise
        currency: order.currency,
        receipt: order.receipt,
      },
      product: {
        id: String(product._id),
        name: product.name,
        description: product.shortDescription || product.description || '',
        sellingPrice: product.sellingPrice,
        originalPrice: product.originalPrice,
        discount: product.discount,
      },
      // Public key is safe to send — it is already in the client env var too.
      keyId: env.razorpayKeyId,
    });
  } catch (err) { next(err); }
}

// POST /api/checkout/verify
export async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError('Missing payment verification fields', 400, 'MISSING_FIELDS');
    }

    const expected = crypto
      .createHmac('sha256', env.razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      throw new AppError('Payment verification failed', 400, 'SIGNATURE_MISMATCH');
    }

    // TODO Phase 7: persist Order record to DB here.
    res.json({ success: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id });
  } catch (err) { next(err); }
}
