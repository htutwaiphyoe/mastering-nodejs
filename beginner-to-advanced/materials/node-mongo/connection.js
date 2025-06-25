import mongoose from 'mongoose';

export const connectMongoDB = async (connectionURL) => {
  const connection = await mongoose.connect(connectionURL);
  return connection;
};
