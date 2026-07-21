import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import heroRoutes from './routes/heroRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5500',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5500',
  'https://luxe-resataurant.onrender.com',
  'https://luxe-restaurant-backend.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  const origin = req.header('Origin');
  if (!origin || origin === 'null') {
    corsOptions = { origin: true, credentials: false };
  } else if (allowedOrigins.indexOf(origin) !== -1) {
    corsOptions = { origin: true, credentials: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Access-Control-Allow-Origin', '*');
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    if (mimeTypes[ext]) {
      res.set('Content-Type', mimeTypes[ext]);
    }
  }
}));

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect fill="#1a1818" width="400" height="300"/>
  <text fill="#666" font-family="sans-serif" font-size="16" x="200" y="150" text-anchor="middle" dominant-baseline="middle">Image Not Found</text>
</svg>`;

app.get('/uploads/:filename', (req, res, next) => {
  const filePath = path.join(uploadsPath, req.params.filename);
  if (!fs.existsSync(filePath)) {
    res.set('Content-Type', 'image/svg+xml');
    res.set('Cache-Control', 'no-store');
    return res.status(200).send(placeholderSvg);
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'LUXE Restaurant API is running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      hero: '/api/hero',
      about: '/api/about',
      categories: '/api/categories',
      menu: '/api/menu',
      gallery: '/api/gallery',
      testimonials: '/api/testimonials',
      contact: '/api/contact',
      settings: '/api/settings'
    }
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
