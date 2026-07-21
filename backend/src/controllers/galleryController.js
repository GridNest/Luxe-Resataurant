import Gallery from '../models/Gallery.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteImage, uploadToCloudinary, isLocalUpload } from '../services/imageService.js';
import fs from 'fs';

export const getGalleryImages = catchAsync(async (req, res, next) => {
  const images = await Gallery.find().sort('displayOrder').lean();
  res.status(200).json({ success: true, data: images });
});

export const createGalleryImage = catchAsync(async (req, res, next) => {
  let imagePath = '';

  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const cloudUrl = await uploadToCloudinary(req.file.path);
      if (cloudUrl) {
        imagePath = cloudUrl;
        fs.unlinkSync(req.file.path);
      }
    }
  } else if (req.body.image) {
    imagePath = req.body.image;
  } else {
    return next(new AppError('Please upload an image or provide an image URL', 400));
  }

  const image = await Gallery.create({
    image: imagePath,
    title: req.body.title || '',
    displayOrder: req.body.displayOrder || 0
  });

  res.status(201).json({ success: true, data: image });
});

export const deleteGalleryImage = catchAsync(async (req, res, next) => {
  const image = await Gallery.findById(req.params.id);
  if (!image) {
    return next(new AppError('Image not found', 404));
  }

  if (image.image && isLocalUpload(image.image)) {
    deleteImage(image.image);
  }

  await Gallery.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Image deleted successfully' });
});
