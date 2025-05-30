const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); // For generating unique request IDs

// Middlewares and Models
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Package = require('../models/Package');
const Transaction = require('../models/Transaction');

// M-Pesa Helper
const { initiateSTKPush } = require('../utils/mpesaHelper');

// POST /api/payments/initiate-stk - Initiate STK Push for a package
// @desc   Initiate M-Pesa STK Push for a selected package
// @access Private (User must be logged in)
router.post('/initiate-stk', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { packageId, phoneNumber } = req.body;

  // 1. Validate Input
  if (!packageId || !phoneNumber) {
    return res.status(400).json({ message: 'Package ID and phone number are required.' });
  }

  // Basic phone number validation (can be more robust, or rely on mpesaHelper's validation)
  // Assuming mpesaHelper will format it correctly to 254xxxxxxxxx
  if (!/^(0\d{9}|254\d{9}|\+\d{12})$/.test(phoneNumber)) {
    return res.status(400).json({ message: 'Invalid phone number format.' });
  }

  try {
    // 2. Fetch Package Details
    const packageToPurchase = await Package.findById(packageId);
    if (!packageToPurchase) {
      return res.status(404).json({ message: 'Package not found.' });
    }
    const amount = packageToPurchase.price; // Assuming 'price' is the numeric field

    // 3. Generate Unique Request IDs (for internal tracking, Daraja provides its own)
    const merchantRequestId = uuidv4(); // Our internal MerchantRequestID

    // 4. Create Initial Transaction Record
    let newTransaction = new Transaction({
      userId,
      packageId,
      merchantRequestId, // Our internal ID for this initiation attempt
      // checkoutRequestId will be updated by Daraja's actual response
      amount,
      phoneNumber, // The phone number provided by the user for the STK push
      status: 'Pending',
    });
    await newTransaction.save();

    // 5. Call initiateSTKPush
    const accountReference = `USER${userId.substring(0,6)}_PKG${packageId.substring(0,6)}`; // Example reference
    const transactionDesc = `Payment for ${packageToPurchase.name}`;
    
    let darajaResponse;
    try {
      darajaResponse = await initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc);
      
      // Update transaction with Daraja's response
      newTransaction.checkoutRequestId = darajaResponse.CheckoutRequestID; // Daraja's ID
      newTransaction.darajaInitiationResponse = darajaResponse;
      newTransaction.status = 'Processing'; // STK Push initiated, awaiting callback
      await newTransaction.save();

      res.json({ 
        message: 'STK push initiated successfully. Please check your phone.', 
        transactionId: newTransaction._id, // Send our transaction ID back
        merchantRequestId: newTransaction.merchantRequestId, // Our internal ID
        checkoutRequestId: newTransaction.checkoutRequestId // Daraja's ID
      });

    } catch (stkError) {
      // If initiateSTKPush fails
      console.error('STK Push Initiation Error:', stkError.message);
      newTransaction.status = 'Failed';
      newTransaction.resultDesc = stkError.message || 'Failed to initiate STK push.';
      // Daraja error object might be complex, store what's relevant or the whole thing
      newTransaction.darajaInitiationResponse = stkError.response?.data || stkError.message || stkError; 
      await newTransaction.save();
      
      return res.status(500).json({ 
        message: stkError.message || 'Failed to initiate M-Pesa STK push.',
        transactionId: newTransaction._id,
        errorDetails: stkError.response?.data // Provide Daraja error if available
      });
    }

  } catch (error) {
    // Catch errors from Package.findById or initial Transaction.save()
    console.error('Error in /initiate-stk route:', error.message);
    res.status(500).json({ message: 'Server error during payment initiation.' });
  }
});

module.exports = router;
