import Contact from '../models/Contact.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const getContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findOne();
  if (!contact) {
    return next(new AppError('Contact info not found', 404));
  }
  res.status(200).json({ success: true, data: contact });
});

export const updateContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findOne();
  if (!contact) {
    return next(new AppError('Contact info not found', 404));
  }

  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      contact[key] = req.body[key];
    }
  });

  await contact.save();
  res.status(200).json({ success: true, data: contact });
});
