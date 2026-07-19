import express from 'express';
import { getHero, updateHero } from '../controllers/heroController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getHero);
router.put('/', protect, upload.single('backgroundImage'), updateHero);

export default router;
