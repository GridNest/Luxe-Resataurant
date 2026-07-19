import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  googleMap: {
    type: String,
    trim: true
  },
  openingHours: {
    type: String,
    required: [true, 'Opening hours are required'],
    trim: true
  },
  facebook: { type: String, trim: true },
  instagram: { type: String, trim: true },
  youtube: { type: String, trim: true },
  twitter: { type: String, trim: true }
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
