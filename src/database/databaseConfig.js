const mongoose = require('mongoose');

const { MONGODB_URI } = process.env;

const connect = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('database connected');
  } catch (error) {
    console.error(error);
  }
};

module.exports = { connect };