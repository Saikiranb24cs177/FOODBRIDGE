
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing from Render Environment Variables!');
  }

  console.log('[DB] Connecting to MongoDB Atlas...');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log('[DB] Connected successfully:', conn.connection.host);
    return conn;
  } catch (err) {
    console.error('[DB ERROR]', err.message);
    throw err;
  }
};
