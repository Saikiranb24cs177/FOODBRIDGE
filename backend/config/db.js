const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodbridge';

  console.log(`[DB] Connecting to MongoDB at ${uri}...`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    console.log(`[DB] Connected successfully to MongoDB host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`\n======================================================`);
    console.error(`[DB ERROR] Failed to connect to MongoDB!`);
    console.error(`URI: ${uri}`);
    console.error(`Reason: ${err.message}`);
    console.error(`Please ensure MongoDB is running:`);
    console.error(`  - Local: start MongoDB Community Server via "mongod --dbpath <path>"`);
    console.error(`  - Cloud: set MONGODB_URI=mongodb+srv://... in backend/.env`);
    console.error(`======================================================\n`);
    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[DB] Disconnected from MongoDB');
  } catch (e) {
    console.error('[DB] Error disconnecting DB:', e);
  }
};

module.exports = { connectDB, disconnectDB };
