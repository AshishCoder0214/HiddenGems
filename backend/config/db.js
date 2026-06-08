import mongoose from 'mongoose';
import { logger } from './logger.js';

export const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || '';
  if (!MONGODB_URI) {
    logger.error('CRITICAL: MONGODB_URI is not set in environment variables! Server shutting down.');
    process.exit(1);
  }
  
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    logger.info(`MongoDB connected successfully: ${conn.connection.host}`);
    return true;
  } catch (err) {
    logger.error('CRITICAL: MongoDB connection failed! Server shutting down.', { error: err.message });
    process.exit(1);
  }
};
