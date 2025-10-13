const mongoose = require('mongoose');

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log('database connected');
  } catch (error) {
    console.error(error);
  }
};

module.exports = { connect };