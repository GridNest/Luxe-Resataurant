import Hero from '../models/Hero.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteImage } from '../services/imageService.js';

export const getHero = catchAsync(async (req, res, next) => {
  const hero = await Hero.findOne();
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
    if (hero.backgroundImage && hero.backgroundImage.startsWith('/uploads/')) {
      deleteImage(hero.backgroundImage);
    }
    hero.backgroundImage = `/uploads/${req.file.filename}`;
  }

  await hero.save();
  res.status(200).json({ success: true, data: hero });
});
