const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

const gemRequests = [];

app.post('/api/gem-cutting', (req, res) => {
  const formData = req.body;
  gemRequests.push(formData);
  res.status(200).json({ message: 'Gem cutting request submitted successfully' });
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, message } = req.body;
  const mailOptions = {
    from: 'your-email@gmail.com',
    to,
    subject,
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));