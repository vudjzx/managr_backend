import mongoose, {ConnectOptions} from 'mongoose';

const connectDataBase = async () => {
  const url = process.env.MONGO_URL ?? '';
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    console.log('MongoDB connected');
  } catch (error: any) {
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDataBase;
