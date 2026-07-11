const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

// Helper to generate a JWT for a given user id
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// REGISTER a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are all required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LOGIN an existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- OTP-based login ----------

// Helper to generate a random 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Basic format check: 10-digit Indian mobile number starting with 6-9
function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

// SEND OTP
// purpose = 'register' -> creates a brand new account (fails if phone already registered)
// purpose = 'login'    -> sends OTP for an existing account (fails if phone not found)
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, purpose } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
    }

    let user = await User.findOne({ phone });

    if (purpose === 'register') {
      if (user) {
        return res.status(400).json({ error: 'This number is already registered. Please login instead.' });
      }
      user = new User({ phone });
    } else {
      if (!user) {
        return res.status(404).json({ error: 'No account found with this number. Please register first.' });
      }
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // valid for 5 minutes
    await user.save({ validateBeforeSave: false });

    // DEMO MODE: no real SMS provider is connected, so the OTP is logged
    // on the server and also returned in the response so the frontend can
    // display it. In a production app this line would be replaced with a
    // call to an SMS provider (e.g. Twilio) and the otp would NOT be sent
    // back in the API response.
    console.log(`OTP for ${phone}: ${otp}`);

    res.json({
      message: 'OTP generated successfully',
      demoOtp: otp // remove this field once a real SMS provider is connected
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VERIFY OTP - checks the OTP, saves the name on first-time registration, and logs the user in
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, purpose, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const user = await User.findOne({ phone });
    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({ error: 'No OTP request found for this number' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ error: 'OTP has expired, please request a new one' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Incorrect OTP' });
    }

    // On registration, save the name that was collected in step 1
    if (purpose === 'register') {
      if (!name) {
        return res.status(400).json({ error: 'Name is required to complete registration' });
      }
      user.name = name;
    }

    // OTP correct - clear it so it can't be reused, then issue a token
    user.otp = null;
    user.otpExpiry = null;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
