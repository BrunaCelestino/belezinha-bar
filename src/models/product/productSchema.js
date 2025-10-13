const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  name: {
    type: String,
    required: true,
  },
  productCode: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  available: {
    type: Boolean,
    required: true,
    default: true
  },
  category: {
    type: String,
    required: true,
     enum: ['BAR', 'COZINHA']
  },
  tags: {
    type: [String],
    required: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);