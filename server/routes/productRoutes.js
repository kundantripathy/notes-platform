import { Router } from 'express';
import { listProducts, getProduct } from '../controllers/productController.js';

const router = Router();
router.get('/', listProducts);
router.get('/:id', getProduct);
// POST/PUT/DELETE (admin) are added in Phase 9.
export default router;
