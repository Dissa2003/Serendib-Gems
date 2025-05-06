// server/routes/emailRoute.js
import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// Create a transporter with your actual email credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Route to send emails
router.post("/send", async (req, res) => {
  const { to, subject, message } = req.body;
  
  if (!to || !subject || !message) {
    return res.status(400).json({ message: 'Missing required email fields' });
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to,
    subject,
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

export default router;
