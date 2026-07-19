import About from '../models/About.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteImage } from '../services/imageService.js';

export const getAbout = catchAsync(async (req, res, next) => {
  const about = await About.findOne();
  if (!about) {
    return next(new AppError('About section not found', 404));
  }
  res.status(200).json({ success: true, data: about });
});

export const updateAbout = catchAsync(async (req, res, next) => {
  const about = await About.findOne();
  if (!about) {
    return next(new AppError('About section not found', 404));
  }

  if (req.body.features && typeof req.body.features === 'string') {
    try {
      req.body.features = JSON.parse(req.body.features);
    } catch (e) {
      req.body.features = req.body.features.split('\n').map(f => f.trim()).filter(Boolean);
    }
  }

  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      about[key] = req.body[key];
    }
  });

  if (req.file) {
    if (about.chefImage && about.chefImage.startsWith('/uploads/')) {
      deleteImage(about.chefImage);
    }
    about.chefImage = `/uploads/${req.file.filename}`;
  }

  await about.save();
  res.status(200).json({ success: true, data: about });
});
