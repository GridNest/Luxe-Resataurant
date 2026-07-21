import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cloudinary = null;
const CLOUDINARY_ENABLED = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (CLOUDINARY_ENABLED) {
  try {
    const mod = await import('cloudinary');
    cloudinary = mod.v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  } catch (e) {
    console.warn('Cloudinary not available, using local storage only');
  }
}

export const isCloudinaryEnabled = () => CLOUDINARY_ENABLED && cloudinary !== null;

export const uploadToCloudinary = async (filePath, folder = 'luxe-restaurant') => {
  if (!isCloudinaryEnabled()) return null;
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
      transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }]
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

export const deleteFromCloudinary = async (imageUrl) => {
  if (!isCloudinaryEnabled() || !imageUrl) return false;
  if (!imageUrl.includes('cloudinary.com')) return false;
  try {
    const parts = imageUrl.split('/');
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx === -1) return false;
    const publicIdWithExt = parts.slice(uploadIdx + 2).join('/');
    const publicId = publicIdWithExt.replace(/\.[^.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

export const deleteImage = (imagePath) => {
  if (!imagePath) return false;
  if (imagePath.includes('cloudinary.com')) {
    deleteFromCloudinary(imagePath);
    return true;
  }
  try {
    if (imagePath.startsWith('/uploads/')) {
      const fullPath = path.join(__dirname, '../..', imagePath);
      if (fs.existsSync(fullPath)) {
        const defaultImages = ['default-food.jpg', 'hero-bg.jpg', 'chef.jpg', 'default-user.jpg', 'logo.png', 'favicon.ico'];
        const filename = path.basename(fullPath);
        if (!defaultImages.includes(filename)) {
          fs.unlinkSync(fullPath);
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

export const getImageUrl = (filename) => {
  return `/uploads/${filename}`;
};

export const isLocalUpload = (imagePath) => {
  return imagePath && imagePath.startsWith('/uploads/');
};

export const isExternalUrl = (imagePath) => {
  return imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'));
};
