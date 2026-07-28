import mongoose from 'mongoose';

/**
 * Middleware to check if MongoDB is connected before handling requests.
 * Prevents Mongoose buffering timeout (10000ms) when database connection fails or is pending.
 */
export const checkDbConnection = (req, res, next) => {
  // Allow health check endpoint to respond even if DB is connecting
  if (req.path === '/health') {
    return next();
  }

  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection error: MongoDB is not connected. Ensure 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access and MONGO_URI is configured correctly on Render.'
    });
  }
  next();
};
