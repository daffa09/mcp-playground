import express from 'express';
import { ProductService } from '../services/ProductService';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * Get all products with pagination
 * @route GET /api/products
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const products = await ProductService.findAll({
      page: Number(page),
      limit: Number(limit),
      category: category as string,
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get product by ID
 * @route GET /api/products/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await ProductService.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create new product (admin only)
 * @route POST /api/products
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newProduct = await ProductService.create(req.body);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Update product (admin only)
 * @route PUT /api/products/:id
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await ProductService.update(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
