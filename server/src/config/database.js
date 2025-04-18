import mongoose from 'mongoose';
mongoose.set('strictQuery', true);

const connectDatabase = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDatabase;