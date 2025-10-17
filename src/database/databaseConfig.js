const mongoose = require('mongoose');
const { attachDatabasePool } = require('@vercel/functions');

let connection = null;

const connect = async () => {
  if (connection) {
    return connection;
  }

  try {
    connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      maxIdleTimeMS: 5000,
      appName: 'devrel.vercel.integration',
    });

    console.log('✅ Database connected');

    attachDatabasePool(mongoose.connection.client);

    return connection;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error);
    throw error;
  }
};

module.exports = { connect };
