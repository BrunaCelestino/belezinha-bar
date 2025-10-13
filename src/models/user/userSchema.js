const e = require('cors');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: true,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  },
  token: {
    type: String,
    required: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);