/**
 * OTP Sender Utility
 * Supports: MSG91 or Dev Mock
 * Set OTP_PROVIDER in .env to switch between providers
 */

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─── MSG91 Provider ──────────────────────────────────────────────────────────
const sendViaMSG91 = async (phone, otp) => {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  if (!authKey || !templateId) {
    throw new Error('MSG91 credentials are not configured.');
  }

  const qs = new URLSearchParams({
    authkey: authKey,
    template_id: templateId,
    mobile: `91${phone}`,
    otp,
  });

  const resp = await fetch(`https://control.msg91.com/api/v5/otp?${qs.toString()}`, {
    method: 'POST',
  });

  const json = await resp.json().catch(() => ({}));
  if (!resp.ok || json.type === 'error') {
    throw new Error(json.message || 'Failed to send OTP via MSG91.');
  }
};

const verifyViaMSG91 = async (phone, otp) => {
  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) {
    throw new Error('MSG91 credentials are not configured.');
  }

  const qs = new URLSearchParams({
    authkey: authKey,
    mobile: `91${phone}`,
    otp,
  });

  const resp = await fetch(`https://control.msg91.com/api/v5/otp/verify?${qs.toString()}`, {
    method: 'GET',
  });

  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) return { ok: false, message: json.message || 'OTP verification failed.' };
  if (json.type === 'success') return { ok: true };
  return { ok: false, message: json.message || 'Invalid OTP.' };
};

// ─── Mock Provider (Development) ─────────────────────────────────────────────
const sendViaMock = async (phone, otp) => {
  console.log(`\n📱 [DEV OTP] Phone: ${phone} → OTP: ${otp}\n`);
  // In dev mode OTP is also logged and returned — never do this in production
};

// ─── Main Export ──────────────────────────────────────────────────────────────
const sendOTP = async (phone, otp) => {
  const provider = process.env.OTP_PROVIDER || 'msg91';

  switch (provider) {
    case 'msg91':
      await sendViaMSG91(phone, otp);
      break;
    default:
      await sendViaMock(phone, otp);
  }
};

const verifyOTPWithProvider = async (phone, otp, expectedOtp) => {
  const provider = process.env.OTP_PROVIDER || 'msg91';

  if (provider === 'msg91') {
    return verifyViaMSG91(phone, otp);
  }

  // Mock/dev fallback: verify with server-stored OTP.
  return { ok: otp === expectedOtp, message: 'Invalid OTP. Please try again.' };
};

module.exports = { generateOTP, sendOTP, verifyOTPWithProvider };
