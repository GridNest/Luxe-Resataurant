import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  title: {
    type: String,
    trim: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
