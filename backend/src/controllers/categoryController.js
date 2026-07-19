import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ active: true }).sort('displayOrder');
  res.status(200).json({ success: true, data: categories });
});

export const getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find().sort('displayOrder');
  res.status(200).json({ success: true, data: categories });
});

export const createCategory = catchAsync(async (req, res, next) => {
  const { name, displayOrder } = req.body;
  const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');

  const category = await Category.create({ name, slug, displayOrder: displayOrder || 0 });
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      category[key] = req.body[key];
    }
  });

  if (req.body.name) {
    category.slug = req.body.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  }

  await category.save();
  res.status(200).json({ success: true, data: category });
});

export const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Category deleted successfully' });
});
