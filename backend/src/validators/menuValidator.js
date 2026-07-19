import { body } from 'express-validator';

export const createMenuValidation = [
  body('name').notEmpty().withMessage('Item name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('categoryId').notEmpty().withMessage('Category is required')
];

export const updateMenuValidation = [
  body('name').optional().notEmpty().withMessage('Item name cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number')
];
