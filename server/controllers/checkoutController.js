import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { getRazorpay } from '../config/razorpay.js';
import { env } from '../config/env.js';
import { seller } from '../config/seller.js';
import { AppError } from '../middleware/errorHandler.js';

// Simple in-memory coupon table — move to DB / env as needed.
const COUPONS = {
  SAVE10: { type: 'percent', value: 10 },
  FLAT50: { type: 'flat',    value: 50 },
  NOTES20: { type: 'percent', value: 20 },
};

function applyCouponToPrice(sellingPrice, code) {
  const c = COUPONS[code?.toUpperCase()];
  if (!c) return null;
  const discountAmount = c.type === 'percent'
    ? Math.round(sellingPrice * c.value / 100)
    : Math.min(c.value, sellingPrice);
  return { code: code.toUpperCase(), discountAmount, finalPrice: sellingPrice - discountAmount };
}

// POST /api/checkout/apply-coupon
export async function applyCoupon(req, res, next) {
  try {
    const { productId, couponCode } = req.body;
    if (!productId || !couponCode) throw new AppError('productId and couponCode are required', 400, 'MISSING_FIELDS');
    if (!mongoose.isValidObjectId(productId)) throw new AppError('Product not found', 404, 'NOT_FOUND');

    const product = await Product.findOne({ _id: productId, status: 'active' }).lean();
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');

    const result = applyCouponToPrice(product.sellingPrice, couponCode);
    if (!result) throw new AppError('Invalid or expired coupon', 400, 'INVALID_COUPON');

    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

// POST /api/checkout/create-order
export async function createOrder(req, res, next) {
  try {
    const { productId, couponCode } = req.body;
    if (!productId) throw new AppError('productId is required', 400, 'MISSING_PRODUCT');
    if (!mongoose.isValidObjectId(productId)) throw new AppError('Product not found', 404, 'NOT_FOUND');

    const product = await Product.findOne({ _id: productId, status: 'active' }).lean();
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');

    let finalPrice = product.sellingPrice;
    let couponResult = null;
    if (couponCode) {
      couponResult = applyCouponToPrice(product.sellingPrice, couponCode);
      if (couponResult) finalPrice = couponResult.finalPrice;
    }

    const amountPaise = Math.round(finalPrice * 100);
    const receipt = `rcpt_${productId}_${Date.now()}`;

    const ascii = (s) => String(s).replace(/[^\x20-\x7E]/g, '').trim();
    const order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: {
        product_id: String(product._id),
        product_name: ascii(product.name),
        coupon: couponResult?.code || '',
      },
    });

    res.json({
      success: true,
      sellerName: seller.name,
      order: { id: order.id, amount: order.amount, currency: order.currency, receipt: order.receipt },
      product: {
        id: String(product._id),
        name: product.name,
        description: product.shortDescription || product.description || '',
        sellingPrice: product.sellingPrice,
        originalPrice: product.originalPrice,
        discount: product.discount,
      },
      coupon: couponResult,
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
