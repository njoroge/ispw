const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  packageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Package', 
    required: true 
  },
  merchantRequestId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  checkoutRequestId: { 
    type: String, 
    unique: true, 
    sparse: true // Allows multiple documents to have null/missing checkoutRequestId
  },
  amount: { 
    type: Number, 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  }, // M-Pesa phone number
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Cancelled', 'Expired'], 
    default: 'Pending' 
  },
  mpesaReceiptNumber: { 
    type: String 
  },
  resultCode: { 
    type: String 
  }, // From Daraja callback
  resultDesc: { 
    type: String 
  }, // From Daraja callback
  darajaInitiationResponse: { 
    type: mongoose.Schema.Types.Mixed 
  }, // Raw response from STK push initiation
  darajaCallbackResponse: { 
    type: mongoose.Schema.Types.Mixed 
  } // Raw response from STK callback
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

module.exports = mongoose.model('Transaction', TransactionSchema);
