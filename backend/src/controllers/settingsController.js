import Settings from '../models/Settings.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteImage, uploadToCloudinary, isLocalUpload } from '../services/imageService.js';
import fs from 'fs';

export const getSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne().lean();
  if (!settings) {
    settings = await Settings.create({});
    settings = settings.toObject();
  }
  res.status(200).json({ success: true, data: settings });
});

export const updateSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined && key !== 'removeLogo' && key !== 'removeFavicon') {
      settings[key] = req.body[key];
    }
  });

  if (req.files) {
    if (req.files.logo) {
      if (settings.logo && isLocalUpload(settings.logo)) {
        deleteImage(settings.logo);
      }
      let logoUrl = `/uploads/${req.files.logo[0].filename}`;
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const cloudUrl = await uploadToCloudinary(req.files.logo[0].path);
        if (cloudUrl) {
          logoUrl = cloudUrl;
          fs.unlinkSync(req.files.logo[0].path);
        }
      }
      settings.logo = logoUrl;
    }
    if (req.files.favicon) {
      if (settings.favicon && isLocalUpload(settings.favicon)) {
        deleteImage(settings.favicon);
      }
      let faviconUrl = `/uploads/${req.files.favicon[0].filename}`;
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const cloudUrl = await uploadToCloudinary(req.files.favicon[0].path);
        if (cloudUrl) {
          faviconUrl = cloudUrl;
          fs.unlinkSync(req.files.favicon[0].path);
        }
      }
      settings.favicon = faviconUrl;
    }
  }

  if (req.body.removeLogo === 'true') {
    if (settings.logo && isLocalUpload(settings.logo)) {
      deleteImage(settings.logo);
    }
    settings.logo = '/uploads/logo.png';
  }
  if (req.body.removeFavicon === 'true') {
    if (settings.favicon && isLocalUpload(settings.favicon)) {
      deleteImage(settings.favicon);
    }
    settings.favicon = '/uploads/favicon.ico';
  }

  await settings.save();
  res.status(200).json({ success: true, data: settings });
});
