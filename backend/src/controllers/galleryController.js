import Gallery from '../models/Gallery.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { deleteImage } from '../services/imageService.js';

export const getGalleryImages = catchAsync(async (req, res, next) => {
  const images = await Gallery.find().sort('displayOrder');
  res.status(200).json({ success: true, data: images });
});

export const createGalleryImage = catchAsync(async (req, res, next) => {
  let imagePath = '';

  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
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

  if (image.image && image.image.startsWith('/uploads/')) {
    deleteImage(image.image);
  }

  await Gallery.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Image deleted successfully' });
});
