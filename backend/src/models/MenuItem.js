import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    default: '/uploads/default-food.jpg'
  },
  veg: {
    type: Boolean,
    default: true
  },
  popular: {
    type: Boolean,
    default: false
  },
  available: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

menuItemSchema.index({ categoryId: 1, displayOrder: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
