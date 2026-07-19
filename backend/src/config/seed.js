import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import Hero from '../models/Hero.js';
import About from '../models/About.js';
import Contact from '../models/Contact.js';
import Settings from '../models/Settings.js';
import MenuItem from '../models/MenuItem.js';
import Gallery from '../models/Gallery.js';
import Testimonial from '../models/Testimonial.js';
import connectDB from './database.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    await Admin.deleteMany();
    await Category.deleteMany();
    await Hero.deleteMany();
    await About.deleteMany();
    await Contact.deleteMany();
    await Settings.deleteMany();
    await MenuItem.deleteMany();
    await Gallery.deleteMany();
    await Testimonial.deleteMany();

    console.log('Database cleared');

    await Admin.create({
      name: 'Admin User',
      email: 'admin@restaurant.com',
      password: 'Admin@123',
      role: 'super_admin'
    });
    console.log('Admin created: admin@restaurant.com / Admin@123');

    const categories = [
      { name: 'Starter', slug: 'starter', displayOrder: 1 },
      { name: 'Soup', slug: 'soup', displayOrder: 2 },
      { name: 'Pizza', slug: 'pizza', displayOrder: 3 },
      { name: 'Burger', slug: 'burger', displayOrder: 4 },
      { name: 'Indian', slug: 'indian', displayOrder: 5 },
      { name: 'Chinese', slug: 'chinese', displayOrder: 6 },
      { name: 'Dessert', slug: 'dessert', displayOrder: 7 },
      { name: 'Drinks', slug: 'drinks', displayOrder: 8 }
    ];

    const createdCategories = [];
    for (const cat of categories) {
      const c = await Category.create(cat);
      createdCategories.push(c);
    }
    console.log('Categories created');

    const menuItems = [
      { categoryId: createdCategories[0]._id, name: 'Truffle Arancini', description: 'Crispy risotto balls, mozzarella, black truffle', price: 22, veg: true, popular: true, image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&q=80' },
      { categoryId: createdCategories[0]._id, name: 'Beef Carpaccio', description: 'Aged beef, arugula, parmesan, lemon', price: 28, veg: false, popular: false, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
      { categoryId: createdCategories[1]._id, name: 'Lobster Bisque', description: 'Velvety shellfish broth, cognac, creme fraiche', price: 24, veg: false, popular: true, image: 'https://images.unsplash.com/photo-1584812080170-4cd12975d95a?w=400&q=80' },
      { categoryId: createdCategories[1]._id, name: 'Tomato & Basil', description: 'Heirloom tomato, basil oil, croutons', price: 16, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1574484284002-1b16c5df6ee3?w=400&q=80' },
      { categoryId: createdCategories[2]._id, name: 'Margherita', description: 'San Marzano, fior di latte, basil', price: 19, veg: true, popular: true, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&q=80' },
      { categoryId: createdCategories[2]._id, name: 'Diavola', description: 'Spicy salami, black olives, chili', price: 22, veg: false, popular: false, image: 'https://images.unsplash.com/photo-1595853035070-59a39fe84de3?w=400&q=80' },
      { categoryId: createdCategories[3]._id, name: 'Wagyu Burger', description: 'A5 wagyu, cheddar, caramelized onion', price: 32, veg: false, popular: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
      { categoryId: createdCategories[3]._id, name: 'Plant-Based Deluxe', description: 'Beyond meat, vegan cheese, avocado', price: 24, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80' },
      { categoryId: createdCategories[4]._id, name: 'Butter Chicken', description: 'Tandoori chicken, tomato gravy, fenugreek', price: 26, veg: false, popular: true, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80' },
      { categoryId: createdCategories[4]._id, name: 'Paneer Tikka', description: 'Cottage cheese, bell peppers, mint chutney', price: 20, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1567186937675-a5138c8c89b3?w=400&q=80' },
      { categoryId: createdCategories[5]._id, name: 'Sichuan Noodles', description: 'Hand-pulled noodles, chili oil, ground pork', price: 21, veg: false, popular: false, image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&q=80' },
      { categoryId: createdCategories[5]._id, name: 'Dim Sum Platter', description: 'Steamed dumplings, soy-ginger dip', price: 25, veg: true, popular: true, image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400&q=80' },
      { categoryId: createdCategories[6]._id, name: 'Chocolate Fondant', description: 'Molten dark chocolate, vanilla ice cream', price: 14, veg: true, popular: true, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80' },
      { categoryId: createdCategories[6]._id, name: 'Tiramisu', description: 'Coffee-soaked ladyfingers, mascarpone', price: 13, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80' },
      { categoryId: createdCategories[7]._id, name: 'Espresso Martini', description: 'Vodka, espresso, coffee liqueur', price: 16, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80' },
      { categoryId: createdCategories[7]._id, name: 'Fresh Mint Lemonade', description: 'Muddled mint, lemon, soda', price: 9, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80' }
    ];

    for (const item of menuItems) {
      await MenuItem.create(item);
    }
    console.log('Menu items created');

    await Hero.create({
      title: 'Culinary Artistry',
      subtitle: 'Where tradition meets innovation — a Michelin-inspired journey.',
      buttonText: 'Explore Menu',
      buttonLink: '#menu',
      backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
      overlayOpacity: 0.4,
      status: true
    });
    console.log('Hero section created');

    await About.create({
      heading: 'Our Story',
      description: 'Established in 2022, LUXE is a sanctuary of contemporary gastronomy. Our kitchen marries classic techniques with bold global flavors, using only the finest seasonal ingredients. Every dish tells a story of craftsmanship and passion.',
      chefImage: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=600&q=80',
      experience: '12+ years',
      features: ['100% farm-to-table', 'Michelin-starred service', 'Award-winning cuisine']
    });
    console.log('About section created');

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
    console.log('Contact info created');

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
    console.log('Gallery images created');

    const testimonials = [
      { customerName: 'Elena V.', rating: 5, review: 'An unforgettable dining experience. The truffle arancini and the service were impeccable.', displayOrder: 1 },
      { customerName: 'Marcus T.', rating: 5, review: 'The wagyu burger is simply the best. LUXE redefines luxury dining.', displayOrder: 2 },
      { customerName: 'Sophia L.', rating: 4, review: 'Beautiful ambiance, creative dishes. Will come back for the dim sum!', displayOrder: 3 }
    ];

    for (const t of testimonials) {
      await Testimonial.create(t);
    }
    console.log('Testimonials created');

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
    console.log('Settings created');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
