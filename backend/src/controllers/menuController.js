import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteImage, uploadToCloudinary, isLocalUpload } from '../services/imageService.js';
import fs from 'fs';

export const getMenuItems = catchAsync(async (req, res, next) => {
  const { category } = req.query;
  const filter = { available: true };
  if (category) {
    const cat = await Category.findOne({ slug: category }).lean();
    if (cat) filter.categoryId = cat._id;
  }

  const items = await MenuItem.find(filter)
    .populate('categoryId', 'name slug')
    .sort('displayOrder')
    .lean();

  res.status(200).json({ success: true, data: items });
});

export const getAllMenuItems = catchAsync(async (req, res, next) => {
  const items = await MenuItem.find()
    .populate('categoryId', 'name slug')
    .sort('displayOrder')
    .lean();
  res.status(200).json({ success: true, data: items });
});

export const createMenuItem = catchAsync(async (req, res, next) => {
  if (req.file) {
    let imageUrl = `/uploads/${req.file.filename}`;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const cloudUrl = await uploadToCloudinary(req.file.path);
      if (cloudUrl) {
        imageUrl = cloudUrl;
        fs.unlinkSync(req.file.path);
      }
    }
    req.body.image = imageUrl;
  } else if (req.body.imageUrl && !req.body.image) {
    req.body.image = req.body.imageUrl;
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
    if (item.image && isLocalUpload(item.image)) {
      deleteImage(item.image);
    }
    let imageUrl = `/uploads/${req.file.filename}`;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const cloudUrl = await uploadToCloudinary(req.file.path);
      if (cloudUrl) {
        imageUrl = cloudUrl;
        fs.unlinkSync(req.file.path);
      }
    }
    req.body.image = imageUrl;
  } else if (req.body.removeImage === 'true') {
    if (item.image && isLocalUpload(item.image)) {
      deleteImage(item.image);
    }
    req.body.image = '/uploads/default-food.jpg';
  } else if (req.body.image && !req.body.image.startsWith('/uploads/')) {
    // If a URL is provided and it's not a local path, use it
    if (item.image && isLocalUpload(item.image) && req.body.image !== item.image) {
      deleteImage(item.image);
    }
  }

  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined && key !== 'removeImage' && key !== 'imageUrl') {
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

  if (item.image && isLocalUpload(item.image)) {
    deleteImage(item.image);
  }

  await MenuItem.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Menu item deleted successfully' });
});
