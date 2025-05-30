const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    unique: true,
    trim: true,
  },
  speed: {
    type: String,
    required: [true, 'Speed is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  dataAllowance: {
    type: String,
    required: [true, 'Data allowance is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  dataAllowanceNumeric: {
    type: Number, // Represents data allowance in GB
    default: null // null or -1 can represent "Unlimited"
  }
});

module.exports = mongoose.model('Package', PackageSchema);
