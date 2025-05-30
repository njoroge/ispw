const axios = require('axios');
// Ensure dotenv is configured at the root of your application (e.g., in server.js)
// For standalone testing of this file, you might need:
// require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Helper function to get Daraja API base URL based on environment
const getDarajaBaseURL = () => {
  const env = process.env.MPESA_API_ENV || 'sandbox'; // Default to sandbox
  return env === 'sandbox' 
    ? 'https://sandbox.safaricom.co.ke' 
    : 'https://api.safaricom.co.ke';
};

// Function to get Daraja API access token
const getDarajaToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    console.error('MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET is not defined in .env');
    throw new Error('M-Pesa API credentials missing.');
  }

  const authURL = `${getDarajaBaseURL()}/oauth/v1/generate?grant_type=client_credentials`;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(authURL, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching M-Pesa token:', error.response ? error.response.data : error.message);
    throw new Error(`Failed to get M-Pesa token: ${error.response ? error.response.data.errorMessage || error.message : error.message}`);
  }
};

// Function to initiate STK Push
const initiateSTKPush = async (phoneNumber, amount, accountReference, transactionDesc) => {
  const accessToken = await getDarajaToken();
  if (!accessToken) {
    // Error is already thrown by getDarajaToken, but as a safeguard:
    throw new Error('Failed to get M-Pesa access token for STK Push.');
  }

  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const transactionType = process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline';
  const callbackURLBase = process.env.MPESA_CALLBACK_URL_BASE;

  if (!shortCode || !passkey || !callbackURLBase) {
    console.error('MPESA_SHORTCODE, MPESA_PASSKEY, or MPESA_CALLBACK_URL_BASE is not defined in .env');
    throw new Error('M-Pesa STK Push configuration missing.');
  }
  
  const now = new Date();
  const timestamp = 
    now.getFullYear() +
    ('0' + (now.getMonth() + 1)).slice(-2) +
    ('0' + now.getDate()).slice(-2) +
    ('0' + now.getHours()).slice(-2) +
    ('0' + now.getMinutes()).slice(-2) +
    ('0' + now.getSeconds()).slice(-2);

  const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');
  const stkPushURL = `${getDarajaBaseURL()}/mpesa/stkpush/v1/processrequest`;
  const callBackURL = `${callbackURLBase}/api/payments/stk-callback`; // As per subtask

  // Ensure phone number is in the correct format (e.g., 2547xxxxxxxx)
  // Basic validation - more robust validation might be needed
  const formattedPhoneNumber = phoneNumber.startsWith('0') 
    ? `254${phoneNumber.substring(1)}` 
    : (phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber);

  if (!/^(254)\d{9}$/.test(formattedPhoneNumber)) {
    throw new Error('Invalid phone number format. Expected 254xxxxxxxxx.');
  }

  const requestBody = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: transactionType,
    Amount: String(Math.round(amount)), // Ensure amount is a string and rounded if it's a float
    PartyA: formattedPhoneNumber,
    PartyB: shortCode,
    PhoneNumber: formattedPhoneNumber,
    CallBackURL: callBackURL,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };

  try {
    const response = await axios.post(stkPushURL, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data; // This is Daraja's acknowledgement of the request
  } catch (error) {
    console.error('Error initiating STK Push:', error.response ? error.response.data : error.message);
    // Daraja often returns HTML for errors or specific JSON structures
    const darajaError = error.response?.data?.errorMessage || error.response?.data || error.message;
    throw new Error(`Failed to initiate STK Push: ${darajaError}`);
  }
};


module.exports = { getDarajaToken, initiateSTKPush };
