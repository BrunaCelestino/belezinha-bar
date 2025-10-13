const mongoose = require('mongoose');

const countersSchema = new mongoose.Schema({
  _id: {
    type: String
  },
  seq: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Counters', countersSchema);