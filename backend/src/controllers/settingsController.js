import Settings from '../models/Settings.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteImage } from '../services/imageService.js';

export const getSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.status(200).json({ success: true, data: settings });
});

export const updateSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      settings[key] = req.body[key];
    }
  });

  if (req.files) {
    if (req.files.logo) {
      if (settings.logo && settings.logo.startsWith('/uploads/')) {
        deleteImage(settings.logo);
      }
      settings.logo = `/uploads/${req.files.logo[0].filename}`;
    }
    if (req.files.favicon) {
      if (settings.favicon && settings.favicon.startsWith('/uploads/')) {
        deleteImage(settings.favicon);
      }
      settings.favicon = `/uploads/${req.files.favicon[0].filename}`;
    }
  }

  await settings.save();
  res.status(200).json({ success: true, data: settings });
});
