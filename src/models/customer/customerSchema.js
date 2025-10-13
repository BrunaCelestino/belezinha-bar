const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  customerCode: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);