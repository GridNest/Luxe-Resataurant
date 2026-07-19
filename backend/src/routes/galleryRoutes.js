import express from 'express';
import { getGalleryImages, createGalleryImage, deleteGalleryImage } from '../controllers/galleryController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getGalleryImages);
router.post('/', protect, upload.single('image'), createGalleryImage);
router.delete('/:id', protect, deleteGalleryImage);

export default router;
