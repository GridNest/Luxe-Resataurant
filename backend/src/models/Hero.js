import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  buttonText: {
    type: String,
    default: 'Explore Menu'
  },
  buttonLink: {
    type: String,
    default: '#menu'
  },
  backgroundImage: {
    type: String,
    default: '/uploads/hero-bg.jpg'
  },
  overlayOpacity: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.4
  },
  status: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Hero = mongoose.model('Hero', heroSchema);
export default Hero;
