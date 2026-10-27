import mongoose from 'mongoose';

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const isMemoryFallbackEnabled = () => {
  return process.env.USE_MEMORY_FALLBACK === 'true';
};

export const shouldUseFallback = () => {
  return !isDbConnected() && isMemoryFallbackEnabled();
};

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/anksetu';
  const fallbackEnabled = isMemoryFallbackEnabled();

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    const safeURI = mongoURI.replace(/\/\/(.*?)@/, '//***:***@');
    console.error(`[MongoDB Error] Could not connect to database at ${safeURI}: ${error.message}`);
    if (fallbackEnabled) {
      console.warn(`[MongoDB Info] Application running with in-memory fallback data because USE_MEMORY_FALLBACK=true.`);
    } else {
      console.error(`[MongoDB Info] Memory fallback is DISABLED (USE_MEMORY_FALLBACK=false). Database operations will report connection errors.`);
    }
    return false;
  }
};

