import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const admin = await Admin.findById(decoded.id).select('-password');
  if (!admin) {
    return next(new AppError('The admin belonging to this token no longer exists.', 401));
  }

  req.admin = admin;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};
