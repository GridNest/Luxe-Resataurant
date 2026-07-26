import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI environment variable is missing on Render dashboard!');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection failed! Error: ${error.message}`);
    console.error(`💡 Ensure 0.0.0.0/0 is added in MongoDB Atlas -> Network Access.`);
  }
};

export default connectDB;
