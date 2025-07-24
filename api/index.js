const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ SEND OTP (uses MSG91's OTP API)
app.post('/send-otp', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ success: false, error: 'Invalid mobile number' });
  }

  try {
    const response = await axios.post(
      'https://api.msg91.com/api/v5/otp',
      {
        mobile: '91' + mobile,
        sender: 'CCCAKL',
        template_id: process.env.MSG91_TEMPLATE_ID
      },
      {
        headers: {
          authkey: process.env.MSG91_AUTHKEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('MSG91 OTP sent:', response.data);
    res.json({ success: true, request_id: response.data.request_id });
  } catch (err) {
    console.error('MSG91 send OTP error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
});

// ✅ VERIFY OTP (MSG91's verification)
app.post('/verify-otp', async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
  }

  try {
    const response = await axios.get(
      `https://api.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${mobile}`,
      {
        headers: {
          authkey: process.env.MSG91_AUTHKEY
        }
      }
    );

    console.log('MSG91 verify response:', response.data);

    if (response.data && response.data.type === 'success') {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: response.data.message || 'OTP verification failed' });
    }
  } catch (err) {
    console.error('MSG91 verify OTP error:', err.response?.data || err.message);
    res.status(400).json({
      success: false,
      message: err.response?.data?.message || 'OTP verification failed'
    });
  }
});

module.exports = app;  // ✅ Export app for Vercel
