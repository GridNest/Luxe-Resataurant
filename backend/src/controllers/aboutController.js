import About from '../models/About.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteImage, uploadToCloudinary, isLocalUpload } from '../services/imageService.js';
import fs from 'fs';

export const getAbout = catchAsync(async (req, res, next) => {
  const about = await About.findOne().lean();
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
    if (about.chefImage && isLocalUpload(about.chefImage)) {
      deleteImage(about.chefImage);
    }
    let imageUrl = `/uploads/${req.file.filename}`;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const cloudUrl = await uploadToCloudinary(req.file.path);
      if (cloudUrl) {
        imageUrl = cloudUrl;
        fs.unlinkSync(req.file.path);
      }
    }
    about.chefImage = imageUrl;
  } else if (req.body.removeImage === 'true') {
    if (about.chefImage && isLocalUpload(about.chefImage)) {
      deleteImage(about.chefImage);
    }
    about.chefImage = '/uploads/chef.jpg';
  }

  await about.save();
  res.status(200).json({ success: true, data: about });
});
