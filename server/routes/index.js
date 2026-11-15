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

export default router;
