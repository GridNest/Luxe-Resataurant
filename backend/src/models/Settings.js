import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  logo: { type: String, default: '/uploads/logo.png' },
  favicon: { type: String, default: '/uploads/favicon.ico' },
  copyright: { type: String, default: '© 2026 LUXE. All rights reserved.' },
  metaTitle: { type: String, default: 'LUXE · Premium Fine Dining Restaurant' },
  metaDescription: { type: String, default: 'Experience Michelin-inspired fine dining at LUXE.' },
  keywords: { type: String, default: 'fine dining, luxury restaurant, gourmet' },
  businessName: { type: String, default: 'LUXE Restaurant' },
  businessEmail: { type: String, trim: true, lowercase: true },
  businessPhone: { type: String, trim: true }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
