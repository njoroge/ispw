require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose'); // Added for MongoDB connection
const authRoutes = require('./routes/auth'); // Import auth routes
const packageRoutes = require('./routes/packages'); // Import package routes
const subscriptionRoutes = require('./routes/subscriptions'); // Import subscription routes
const adminUserRoutes = require('./routes/adminUsers'); // Import admin user routes
const userRoutes = require('./routes/users'); // Import user self-update routes

const cors = require('cors');

const app = express();

const port = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(cors()); 
app.use(express.json());

// MongoDB Connection
async function connectDB(){
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 6+ defaults these options to true, so they are not strictly necessary
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

connectDB(); // Call the function to connect to DB

// Basic test route (can be kept or removed)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running and MongoDB should be connected if no errors shown!' });
});

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount package routes
app.use('/api/packages', packageRoutes);

// Mount subscription routes
app.use('/api/subscriptions', subscriptionRoutes);

// Mount admin user management routes
app.use('/api/admin/users', adminUserRoutes);

// Mount user self-profile update routes
app.use('/api/users', userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
