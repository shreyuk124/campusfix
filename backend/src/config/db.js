import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('[Database] MONGO_URI is not set in environment. Running without database connection.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

export default connectDB;
