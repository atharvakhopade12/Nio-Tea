/**
 * OTP Sender Utility
 * Supports: Twilio, Fast2SMS, or Dev Mock
 * Set OTP_PROVIDER in .env to switch between providers
 */

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─── Twilio Provider ────────────────────────────────────────────────────────
const sendViaTwilio = async (phone, otp) => {
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: `Your Nio Tea OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${phone}`,
  });
};

// ─── Fast2SMS Provider ───────────────────────────────────────────────────────
const sendViaFast2SMS = async (phone, otp) => {
  const axios = require('axios');
  await axios.get('https://www.fast2sms.com/dev/bulkV2', {
    params: {
      authorization: process.env.FAST2SMS_API_KEY,
      variables_values: otp,
      route: 'otp',
      numbers: phone,
    },
    headers: { 'cache-control': 'no-cache' },
  });
};

// ─── Mock Provider (Development) ─────────────────────────────────────────────
const sendViaMock = async (phone, otp) => {
  console.log(`\n📱 [DEV OTP] Phone: ${phone} → OTP: ${otp}\n`);
  // In dev mode OTP is also logged and returned — never do this in production
};

// ─── Main Export ──────────────────────────────────────────────────────────────
const sendOTP = async (phone, otp) => {
  const provider = process.env.OTP_PROVIDER || 'mock';

  switch (provider) {
    case 'twilio':
      await sendViaTwilio(phone, otp);
      break;
    case 'fast2sms':
      await sendViaFast2SMS(phone, otp);
      break;
    default:
      await sendViaMock(phone, otp);
  }
};

module.exports = { generateOTP, sendOTP };
