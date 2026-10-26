import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);

    // Clean up legacy priorityScore and priorityBand fields from existing MongoDB documents
    try {
      const result = await conn.connection.collection('issues').updateMany(
        { $or: [{ priorityScore: { $exists: true } }, { priorityBand: { $exists: true } }] },
        { $unset: { priorityScore: '', priorityBand: '' } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[Database] Cleaned legacy priority fields from ${result.modifiedCount} issues in MongoDB Atlas.`);
      }
    } catch (cleanupErr) {
      console.warn('[Database] Priority cleanup notice:', cleanupErr.message);
    }
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
