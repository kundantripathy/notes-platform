import { Router } from 'express';
import mongoose from 'mongoose';
import productRoutes from './productRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import { seller } from '../config/seller.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

router.get('/seller', (req, res) => res.json({ success: true, seller }));
router.use('/products', productRoutes);
router.use('/checkout', checkoutRoutes);

// Later phases mount: /auth (5), /downloads + /orders (8), /admin (9-10).
// The Razorpay webhook (7) is mounted in app.js with a raw body.

export default router;
