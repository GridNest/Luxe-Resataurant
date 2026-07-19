import Testimonial from '../models/Testimonial.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const getTestimonials = catchAsync(async (req, res, next) => {
  const testimonials = await Testimonial.find().sort('displayOrder');
  res.status(200).json({ success: true, data: testimonials });
});

export const createTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.create(req.body);
  res.status(201).json({ success: true, data: testimonial });
});

export const updateTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    return next(new AppError('Testimonial not found', 404));
  }

  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      testimonial[key] = req.body[key];
    }
  });

  await testimonial.save();
  res.status(200).json({ success: true, data: testimonial });
});

export const deleteTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    return next(new AppError('Testimonial not found', 404));
  }

  await Testimonial.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
});
