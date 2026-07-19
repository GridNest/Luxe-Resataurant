import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection failed!`);
    console.error(`❌ Error Details: ${error.message}`);
    console.error(`💡 Troubleshooting tips for MongoDB Atlas:`);
    console.error(`   1. Ensure your IP address is whitelisted in MongoDB Atlas under Network Access (e.g. allow 0.0.0.0/0 for testing).`);
    console.error(`   2. Verify that the username and password in the connection string are correct and URL-encoded if they contain special characters.`);
    console.error(`   3. Verify that the connection URI in backend/.env is correct.`);
    process.exit(1);
  }
};

export default connectDB;
