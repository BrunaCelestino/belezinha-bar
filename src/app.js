const express = require('express');

const app = express();
const cors = require('cors');

app.use(cors());
require('dotenv-safe').config();

const db = require('./database/databaseConfig');

const initializeCounters = async () => {
  await db.connect();

  const counters = [
    { _id: 'productCode', seq: 0 },
    { _id: 'orderCode', seq: 0 },
  ];

  for (const counter of counters) {
    const existing = await mongoose.connection.collection('counters').findOne({ _id: counter._id });
    if (!existing) {
      await mongoose.connection.collection('counters').insertOne(counter);
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


const { default: mongoose } = require('mongoose');

app.use(express.json());


app.use('/user', userRoutes);
app.use('/customer', customerRoutes);
app.use('/product', productRoutes);
app.use('/order', orderRoutes);


app.get('/', (req, res) => {
    res.status(200).json({ message: 'API Belezinha funcionando!' });
});

module.exports = app;