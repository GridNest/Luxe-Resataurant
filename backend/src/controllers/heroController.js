import Hero from '../models/Hero.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteImage, uploadToCloudinary, isLocalUpload } from '../services/imageService.js';
import fs from 'fs';

export const getHero = catchAsync(async (req, res, next) => {
  const hero = await Hero.findOne().lean();
  if (!hero) {
    return next(new AppError('Hero section not found', 404));
  }
  res.status(200).json({ success: true, data: hero });
});

export const updateHero = catchAsync(async (req, res, next) => {
  const hero = await Hero.findOne();
  if (!hero) {
    return next(new AppError('Hero section not found', 404));
  }

  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      hero[key] = req.body[key];
    }
  });

  if (req.file) {
    if (hero.backgroundImage && isLocalUpload(hero.backgroundImage)) {
      deleteImage(hero.backgroundImage);
    }
    let imageUrl = `/uploads/${req.file.filename}`;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const cloudUrl = await uploadToCloudinary(req.file.path);
      if (cloudUrl) {
        imageUrl = cloudUrl;
        fs.unlinkSync(req.file.path);
      }
    }
    hero.backgroundImage = imageUrl;
  } else if (req.body.removeImage === 'true') {
    if (hero.backgroundImage && isLocalUpload(hero.backgroundImage)) {
      deleteImage(hero.backgroundImage);
    }
    hero.backgroundImage = '/uploads/hero-bg.jpg';
  }

  await hero.save();
  res.status(200).json({ success: true, data: hero });
});
