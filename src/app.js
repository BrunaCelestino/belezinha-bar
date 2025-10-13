const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const db = require('./database/databaseConfig');

const app = express();
app.use(cors());
app.use(express.json());

const initializeCounters = async () => {
  await db.connect();
  const countersCollection = mongoose.connection.collection('counters');

  const counters = [
    { _id: 'productCode', seq: 0 },
    { _id: 'orderCode', seq: 0 },
  ];

  for (const counter of counters) {
    const existing = await countersCollection.findOne({ _id: counter._id });
    if (!existing) {
      await countersCollection.insertOne(counter);
      console.log(`Counter "${counter._id}" initialized`);
    }
  }

  console.log('Counters initialized!');
};

initializeCounters().catch(err => console.error(err));

const userRoutes = require('./routes/user/userRoutes');
const customerRoutes = require('./routes/customer/customerRoutes');
const productRoutes = require('./routes/product/productRoutes');
const orderRoutes = require('./routes/order/orderRoutes');

app.use('/user', userRoutes);
app.use('/customer', customerRoutes);
app.use('/product', productRoutes);
app.use('/order', orderRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API Belezinha funcionando!' });
});

module.exports = app;
