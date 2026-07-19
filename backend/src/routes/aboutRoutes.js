import express from 'express';
import { getAbout, updateAbout } from '../controllers/aboutController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAbout);
router.put('/', protect, upload.single('chefImage'), updateAbout);

export default router;
