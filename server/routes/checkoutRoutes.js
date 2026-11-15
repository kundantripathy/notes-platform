import { Router } from 'express';
import { applyCoupon, createOrder, verifyPayment } from '../controllers/checkoutController.js';

const router = Router();
router.post('/apply-coupon', applyCoupon);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
export default router;
