import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5']
  },
  review: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true
  },
  image: {
    type: String,
    default: '/uploads/default-user.jpg'
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;
