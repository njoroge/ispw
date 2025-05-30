const express = require('express');
const router = express.Router();
const Package = require('../models/Package'); // Adjust path if your Package model is elsewhere
const authMiddleware = require('../middleware/authMiddleware'); // Import authMiddleware
const adminMiddleware = require('../middleware/adminMiddleware'); // Import adminMiddleware

// GET /api/packages - Fetch all packages
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (err) {
    console.error('Error fetching packages:', err.message);
    res.status(500).json({ message: 'Server error while fetching packages' });
  }
});

// POST /api/packages - Add a new package
// Protected route: requires authentication and admin role
router.post('/', [authMiddleware, adminMiddleware], async (req, res) => {
  const { name, speed, price, dataAllowance, description } = req.body;

  // Basic validation
  if (!name || !speed || !price || !dataAllowance) {
    return res.status(400).json({ message: 'Please provide name, speed, price, and data allowance' });
  }

  try {
    // Check if package with the same name already exists
    let existingPackage = await Package.findOne({ name });
    if (existingPackage) {
      return res.status(400).json({ message: 'Package with this name already exists' });
    }

    const newPackage = new Package({
      name,
      speed,
      price,
      dataAllowance,
      description,
    });

    const savedPackage = await newPackage.save();
    res.status(201).json(savedPackage);
  } catch (err) {
    console.error('Error creating package:', err.message);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error while creating package' });
  }
});

// GET /api/packages/:id - Fetch a single package by ID
router.get('/:id', async (req, res) => {
  try {
    const packageItem = await Package.findById(req.params.id);
    if (!packageItem) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json(packageItem);
  } catch (err) {
    console.error('Error fetching package by ID:', err.message);
    if (err.kind === 'ObjectId') { // Handle invalid ObjectId format
      return res.status(400).json({ message: 'Invalid Package ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching package' });
  }
});

// PUT /api/packages/:id - Update a package by ID
// Protected route: requires authentication and admin role
router.put('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  const { name, speed, price, dataAllowance, description } = req.body;

  // Basic validation: Ensure at least one field to update is provided
  // More specific validation can be added if needed
  if (!name && !speed && !price && !dataAllowance && !description) {
    return res.status(400).json({ message: 'Please provide at least one field to update' });
  }

  try {
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      req.body, // Pass the entire body; Mongoose will only update fields defined in schema
      { new: true, runValidators: true } // Return updated doc, run schema validators
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json(updatedPackage);
  } catch (err) {
    console.error('Error updating package:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    if (err.kind === 'ObjectId') { // Handle invalid ObjectId format
      return res.status(400).json({ message: 'Invalid Package ID format' });
    }
    res.status(500).json({ message: 'Server error while updating package' });
  }
});

// DELETE /api/packages/:id - Delete a package by ID
// Protected route: requires authentication and admin role
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const deletedPackage = await Package.findByIdAndDelete(req.params.id);

    if (!deletedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json({ message: 'Package deleted successfully' });
  } catch (err) {
    console.error('Error deleting package:', err.message);
    if (err.kind === 'ObjectId') { // Handle invalid ObjectId format
      return res.status(400).json({ message: 'Invalid Package ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting package' });
  }
});

module.exports = router;
