import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: [true, 'Heading is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  chefImage: {
    type: String,
    default: '/uploads/chef.jpg'
  },
  experience: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

const About = mongoose.model('About', aboutSchema);
export default About;
