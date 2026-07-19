import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
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
import Admin from './models/Admin.js';
import Category from './models/Category.js';
import Hero from './models/Hero.js';
import About from './models/About.js';
import Contact from './models/Contact.js';
import Settings from './models/Settings.js';
import MenuItem from './models/MenuItem.js';
import Gallery from './models/Gallery.js';
import Testimonial from './models/Testimonial.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
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

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

app.get('/api/seed-temp', async (req, res) => {
  try {
    if (req.query.key !== 'luxe_seed_2026') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Admin.deleteMany();
    await Category.deleteMany();
    await Hero.deleteMany();
    await About.deleteMany();
    await Contact.deleteMany();
    await Settings.deleteMany();
    await MenuItem.deleteMany();
    await Gallery.deleteMany();
    await Testimonial.deleteMany();

    await Admin.create({
      name: 'Admin User',
      email: 'admin@restaurant.com',
      password: 'Admin@123',
      role: 'super_admin'
    });

    const categories = await Category.insertMany([
      { name: 'Starter', slug: 'starter', displayOrder: 1 },
      { name: 'Soup', slug: 'soup', displayOrder: 2 },
      { name: 'Pizza', slug: 'pizza', displayOrder: 3 },
      { name: 'Burger', slug: 'burger', displayOrder: 4 },
      { name: 'Indian', slug: 'indian', displayOrder: 5 },
      { name: 'Chinese', slug: 'chinese', displayOrder: 6 },
      { name: 'Dessert', slug: 'dessert', displayOrder: 7 },
      { name: 'Drinks', slug: 'drinks', displayOrder: 8 }
    ]);

    await MenuItem.insertMany([
      { categoryId: categories[0]._id, name: 'Truffle Arancini', description: 'Crispy risotto balls, mozzarella, black truffle', price: 22, veg: true, popular: true, image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&q=80' },
      { categoryId: categories[0]._id, name: 'Beef Carpaccio', description: 'Aged beef, arugula, parmesan, lemon', price: 28, veg: false, popular: false, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
      { categoryId: categories[1]._id, name: 'Lobster Bisque', description: 'Velvety shellfish broth, cognac, creme fraiche', price: 24, veg: false, popular: true, image: 'https://images.unsplash.com/photo-1584812080170-4cd12975d95a?w=400&q=80' },
      { categoryId: categories[1]._id, name: 'Tomato & Basil', description: 'Heirloom tomato, basil oil, croutons', price: 16, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1574484284002-1b16c5df6ee3?w=400&q=80' },
      { categoryId: categories[2]._id, name: 'Margherita', description: 'San Marzano, fior di latte, basil', price: 19, veg: true, popular: true, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&q=80' },
      { categoryId: categories[2]._id, name: 'Diavola', description: 'Spicy salami, black olives, chili', price: 22, veg: false, popular: false, image: 'https://images.unsplash.com/photo-1595853035070-59a39fe84de3?w=400&q=80' },
      { categoryId: categories[3]._id, name: 'Wagyu Burger', description: 'A5 wagyu, cheddar, caramelized onion', price: 32, veg: false, popular: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
      { categoryId: categories[3]._id, name: 'Plant-Based Deluxe', description: 'Beyond meat, vegan cheese, avocado', price: 24, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80' },
      { categoryId: categories[4]._id, name: 'Butter Chicken', description: 'Tandoori chicken, tomato gravy, fenugreek', price: 26, veg: false, popular: true, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80' },
      { categoryId: categories[4]._id, name: 'Paneer Tikka', description: 'Cottage cheese, bell peppers, mint chutney', price: 20, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1567186937675-a5138c8c89b3?w=400&q=80' },
      { categoryId: categories[5]._id, name: 'Sichuan Noodles', description: 'Hand-pulled noodles, chili oil, ground pork', price: 21, veg: false, popular: false, image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&q=80' },
      { categoryId: categories[5]._id, name: 'Dim Sum Platter', description: 'Steamed dumplings, soy-ginger dip', price: 25, veg: true, popular: true, image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400&q=80' },
      { categoryId: categories[6]._id, name: 'Chocolate Fondant', description: 'Molten dark chocolate, vanilla ice cream', price: 14, veg: true, popular: true, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80' },
      { categoryId: categories[6]._id, name: 'Tiramisu', description: 'Coffee-soaked ladyfingers, mascarpone', price: 13, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80' },
      { categoryId: categories[7]._id, name: 'Espresso Martini', description: 'Vodka, espresso, coffee liqueur', price: 16, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80' },
      { categoryId: categories[7]._id, name: 'Fresh Mint Lemonade', description: 'Muddled mint, lemon, soda', price: 9, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80' }
    ]);

    await Hero.create({
      title: 'Culinary Artistry',
      subtitle: 'Where tradition meets innovation — a Michelin-inspired journey.',
      buttonText: 'Explore Menu',
      buttonLink: '#menu',
      backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
      overlayOpacity: 0.4,
      status: true
    });

    await About.create({
      heading: 'Our Story',
      description: 'Established in 2022, LUXE is a sanctuary of contemporary gastronomy. Our kitchen marries classic techniques with bold global flavors, using only the finest seasonal ingredients. Every dish tells a story of craftsmanship and passion.',
      chefImage: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=600&q=80',
      experience: '12+ years',
      features: ['100% farm-to-table', 'Michelin-starred service', 'Award-winning cuisine']
    });

    await Contact.create({
      restaurantName: 'LUXE',
      phone: '+1 (212) 555-0199',
      whatsapp: '+12125550199',
      email: 'reservations@luxe.restaurant',
      address: '101 Park Ave, New York, NY 10022',
      googleMap: 'https://maps.google.com/maps?q=101+Park+Ave+New+York&t=&z=13&ie=UTF8&iwloc=&output=embed',
      openingHours: 'Mon-Sun: 5:00 PM - 11:00 PM',
      facebook: '#',
      instagram: '#',
      youtube: '#',
      twitter: '#'
    });

    const galleryImages = [
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80',
      'https://images.unsplash.com/photo-1547919307-1b3149f6be7c?w=400&q=80',
      'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=400&q=80',
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&q=80'
    ];
    for (let i = 0; i < galleryImages.length; i++) {
      await Gallery.create({ image: galleryImages[i], displayOrder: i });
    }

    await Testimonial.insertMany([
      { customerName: 'Elena V.', rating: 5, review: 'An unforgettable dining experience. The truffle arancini and the service were impeccable.', displayOrder: 1 },
      { customerName: 'Marcus T.', rating: 5, review: 'The wagyu burger is simply the best. LUXE redefines luxury dining.', displayOrder: 2 },
      { customerName: 'Sophia L.', rating: 4, review: 'Beautiful ambiance, creative dishes. Will come back for the dim sum!', displayOrder: 3 }
    ]);

    await Settings.create({
      logo: '/uploads/logo.png',
      favicon: '/uploads/favicon.ico',
      copyright: '© 2026 LUXE. All rights reserved.',
      metaTitle: 'LUXE · Premium Fine Dining Restaurant',
      metaDescription: 'Experience Michelin-inspired fine dining at LUXE. Book your table for an unforgettable culinary journey.',
      keywords: 'fine dining, luxury restaurant, gourmet, Michelin, culinary',
      businessName: 'LUXE Restaurant',
      businessEmail: 'info@luxe.restaurant',
      businessPhone: '+1 (212) 555-0199'
    });

    res.json({ success: true, message: 'Database seeded successfully! Admin: admin@restaurant.com / Admin@123' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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
