import express from 'express';
import { body } from 'express-validator';
import {
  getMenuItems,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getMenuItems);
router.get('/all', protect, getAllMenuItems);

router.post('/', protect, upload.single('image'), [
  body('name').notEmpty().withMessage('Item name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('categoryId').notEmpty().withMessage('Category is required')
], validate, createMenuItem);

router.put('/:id', protect, upload.single('image'), [
  body('name').optional().notEmpty().withMessage('Item name cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number')
], validate, updateMenuItem);

router.delete('/:id', protect, deleteMenuItem);

export default router;
