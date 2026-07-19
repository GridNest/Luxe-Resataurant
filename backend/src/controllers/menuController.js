import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteImage } from '../services/imageService.js';

export const getMenuItems = catchAsync(async (req, res, next) => {
  const { category } = req.query;
  const filter = { available: true };
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.categoryId = cat._id;
  }

  const items = await MenuItem.find(filter)
    .populate('categoryId', 'name slug')
    .sort('displayOrder');

  res.status(200).json({ success: true, data: items });
});

export const getAllMenuItems = catchAsync(async (req, res, next) => {
  const items = await MenuItem.find()
    .populate('categoryId', 'name slug')
    .sort('displayOrder');
  res.status(200).json({ success: true, data: items });
});

export const createMenuItem = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.image = `/uploads/${req.file.filename}`;
  }

  const item = await MenuItem.create(req.body);
  const populated = await item.populate('categoryId', 'name slug');

  res.status(201).json({ success: true, data: populated });
});

export const updateMenuItem = catchAsync(async (req, res, next) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return next(new AppError('Menu item not found', 404));
  }

  if (req.file) {
    if (item.image && item.image.startsWith('/uploads/')) {
      deleteImage(item.image);
    }
    req.body.image = `/uploads/${req.file.filename}`;
  }

  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      item[key] = req.body[key];
    }
  });

  await item.save();
  const populated = await item.populate('categoryId', 'name slug');

  res.status(200).json({ success: true, data: populated });
});

export const deleteMenuItem = catchAsync(async (req, res, next) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return next(new AppError('Menu item not found', 404));
  }

  if (item.image && item.image.startsWith('/uploads/')) {
    deleteImage(item.image);
  }

  await MenuItem.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Menu item deleted successfully' });
});
