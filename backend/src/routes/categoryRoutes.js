import express from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/all', protect, getAllCategories);

router.post('/', protect, [
  body('name').notEmpty().withMessage('Category name is required')
], validate, createCategory);

router.put('/:id', protect, [
  body('name').optional().notEmpty().withMessage('Category name cannot be empty')
], validate, updateCategory);

router.delete('/:id', protect, deleteCategory);

export default router;
