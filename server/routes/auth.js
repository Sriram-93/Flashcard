const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.json({ message: 'Signup success' });
  } catch (err) {
    res.status(400).json({ message: 'Signup failed', error: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login success', user });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;
