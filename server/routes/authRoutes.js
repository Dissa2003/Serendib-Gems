// routes/authRoutes.js
import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Staff from '../model/staffModel.js';

dotenv.config();

const router = express.Router();

// Store OTPs temporarily (in production, use Redis or a database)
const otpStore = new Map();

// Generate OTP function
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Normalize email to ensure consistent format
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

// Login route to generate JWT token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find staff by username
    const staff = await Staff.findOne({ username });
    if (!staff) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const payload = {
      userId: staff._id,
      username: staff.username,
      role: staff.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return token and staff details (excluding sensitive fields)
    const { password: _, confirmPassword: __, ...staffDetails } = staff._doc;
    res.status(200).json({ token, staff: staffDetails, message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Send OTP route
router.post('/send-otp', async (req, res) => {
  try {
    let { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }
    
    email = normalizeEmail(email);
    console.log('Received request to send OTP to email:', email);

    // Check if email configuration is present
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing email configuration');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log('Generated OTP for', email, ':', otp);
    
    // Store OTP with timestamp
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      attempts: 0
    });

    try {
      // Create email transporter
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Payment Verification OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Payment Verification</h2>
            <p>Your OTP for payment verification is:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px;">
              ${otp}
            </div>
            <p>This code is valid for 5 minutes.</p>
            <p>If you did not request this code, please ignore this email.</p>
          </div>
        `
      };
      
      // Send email
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', email);
      
      // For development, also return the OTP in the response
      if (process.env.NODE_ENV === 'development') {
        return res.json({ 
          message: 'OTP sent successfully to your email',
          otp: otp // Remove this in production
        });
      }
      
      res.json({ message: 'OTP sent successfully to your email' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // If email fails but we're in development, still return the OTP
      if (process.env.NODE_ENV === 'development') {
        return res.json({ 
          message: 'OTP generated but email failed to send. Using development fallback.',
          otp: otp,
          error: emailError.message
        });
      }
      
      return res.status(500).json({ 
        message: 'Failed to send OTP email',
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      message: 'Failed to send OTP',
      error: error.message 
    });
  }
});

// Verify OTP route
router.post('/verify-otp', (req, res) => {
  try {
    let { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    email = normalizeEmail(email);
    console.log('Verifying OTP for:', email, 'OTP:', otp);

    const storedData = otpStore.get(email);
    console.log('Stored OTP data:', storedData);

    if (!storedData) {
      return res.status(400).json({ 
        message: 'No OTP found for this email address',
        debug: {
          providedEmail: email,
          storedKeys: Array.from(otpStore.keys())
        }
      });
    }

    // Check if OTP has expired (5 minutes = 300000 ms)
    const now = Date.now();
    if (now - storedData.timestamp > 300000) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check maximum attempts (limit to 3)
    if (storedData.attempts >= 3) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'Maximum verification attempts reached. Please request a new OTP.' });
    }

    // Increment attempts
    storedData.attempts += 1;
    otpStore.set(email, storedData);

    // Verify OTP
    if (storedData.otp !== otp) {
      console.log('Invalid OTP. Expected:', storedData.otp, 'Received:', otp);
      return res.status(400).json({ 
        message: 'Invalid OTP. Please try again.',
        attemptsLeft: 3 - storedData.attempts
      });
    }

    // OTP verification successful, clean up
    otpStore.delete(email);
    console.log('OTP verified successfully for:', email);

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

export default router;