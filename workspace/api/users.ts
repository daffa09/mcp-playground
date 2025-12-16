import express from 'express';
import { validateUser } from '../utils/validation';
import { UserService } from '../services/UserService';

const router = express.Router();

/**
 * Get all users
 * @route GET /api/users
 */
router.get('/', async (req, res) => {
  try {
    const users = await UserService.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await UserService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create new user
 * @route POST /api/users
 */
router.post('/', validateUser, async (req, res) => {
  try {
    const newUser = await UserService.create(req.body);
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
