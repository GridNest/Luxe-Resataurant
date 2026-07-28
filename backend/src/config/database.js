import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI environment variable is missing on Render dashboard!');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed default admin if database contains no admin users
    try {
      const adminCount = await Admin.countDocuments();
      if (adminCount === 0) {
        await Admin.create({
          name: 'Admin User',
          email: 'admin@restaurant.com',
          password: 'Admin@123',
          role: 'super_admin'
        });
        console.log('👑 Default admin auto-created: admin@restaurant.com / Admin@123');
      }
    } catch (seedError) {
      console.error('⚠️ Could not check/auto-seed default admin:', seedError.message);
    }

  } catch (error) {
    console.error(`❌ Database connection failed! Error: ${error.message}`);
    console.error(`💡 Ensure 0.0.0.0/0 is added in MongoDB Atlas -> Network Access.`);
  }
};

export default connectDB;
