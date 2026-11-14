import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';

const TYPES = ['digital', 'video_call'];

export async function listProducts(req, res, next) {
  try {
    const filter = { status: 'active' };
    if (req.query.type && req.query.type !== 'all') {
      if (!TYPES.includes(req.query.type)) throw new AppError('Invalid product type', 400, 'INVALID_TYPE');
      filter.type = req.query.type;
    }
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: products.length, products });
  } catch (err) { next(err); }
}

export async function getProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('Product not found', 404, 'NOT_FOUND');
    const product = await Product.findOne({ _id: req.params.id, status: 'active' }).lean();
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
    res.json({ success: true, product });
  } catch (err) { next(err); }
}
