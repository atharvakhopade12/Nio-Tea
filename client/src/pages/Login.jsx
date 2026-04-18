import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { HiPhone, HiArrowRight, HiArrowLeft, HiCheckCircle } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = { PHONE: 1, OTP: 2, SUCCESS: 3 };

export default function Login() {
  const [step, setStep]       = useState(STEPS.PHONE);
  const [phone, setPhone]     = useState('');
  const [name, setName]       = useState('');
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [isNew, setIsNew]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [devOTP, setDevOTP]   = useState('');
  const { sendOTP, verifyOTP, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (isLoggedIn) { navigate('/products'); return null; }

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setLoading(true);
    try {
      const res = await sendOTP(phone, name);
      // Existing users are logged in directly without OTP.
      if (res.requiresOTP === false) {
        setIsNew(false);
        setStep(STEPS.SUCCESS);
        setTimeout(() => navigate('/products'), 1200);
        return;
      }

      setIsNew(res.purpose === 'register');
      if (res.devOTP) setDevOTP(res.devOTP);
      toast.success(`OTP sent to +91 ${phone}`);
      setStep(STEPS.OTP);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPInput = (val, i) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleOTPKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) { toast.error('Enter the 6-digit OTP.'); return; }
    setLoading(true);
    try {
      await verifyOTP(phone, otpStr, name);
      setStep(STEPS.SUCCESS);
      setTimeout(() => navigate('/products'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-nio-cream px-4 pt-16">
      <div className="w-full max-w-md">
        {/* Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-nio-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Green top banner */}
          <div className="tea-gradient px-8 py-8 text-center">
            <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-white/60 shadow-xl mb-4">
              <img
                src="/nio-tea-logo.jpg"
                alt="Nio Tea"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-white/20', 'flex', 'items-center', 'justify-center');
                }}
              />
            </div>
            <p className="text-nio-green-200 text-sm mt-1">
              {step === STEPS.PHONE ? 'Sign in to unlock prices' :
               step === STEPS.OTP ? 'Enter your verification code' :
               'Welcome to Nio Tea!'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Phone */}
            {step === STEPS.PHONE && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-8 py-8"
              >
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="label">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="input-field pl-14"
                        maxLength={10}
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">We'll send a 6-digit OTP to verify your number.</p>
                  </div>

                  {/* Show name field only for new users (detected after first OTP attempt) */}
                  <div>
                    <label className="label">Your Name <span className="text-gray-400 font-normal">(for new users)</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Arjun Mehta"
                      className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">Existing users can leave this blank.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length !== 10}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Please wait...' : 'Continue'} <HiArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-6">
                  By continuing, you agree to our{' '}
                  <Link to="/contact" className="text-nio-green-700 hover:underline">Terms of Service</Link>
                </p>
              </motion.div>
            )}

            {/* Step 2: OTP */}
            {step === STEPS.OTP && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-8 py-8"
              >
                <p className="text-sm text-gray-500 mb-6 text-center">
                  OTP sent to <span className="font-semibold text-nio-green-800">+91 {phone}</span>
                </p>

                {devOTP && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 mb-5 text-center">
                    🛠 Dev Mode — OTP: <span className="font-mono font-bold text-base">{devOTP}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOTP}>
                  <div className="flex justify-center gap-2.5 mb-6">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPInput(e.target.value, i)}
                        onKeyDown={(e) => handleOTPKeyDown(e, i)}
                        className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all focus:border-nio-green-600 border-gray-200 bg-nio-cream"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="btn-primary w-full disabled:opacity-50 mb-4"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep(STEPS.PHONE); setOtp(['','','','','','']); }}
                    className="flex items-center gap-1 mx-auto text-nio-green-700 text-sm hover:underline"
                  >
                    <HiArrowLeft className="w-3.5 h-3.5" /> Change Number
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === STEPS.SUCCESS && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-8 py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                >
                  <HiCheckCircle className="w-20 h-20 text-nio-green-600 mx-auto mb-4" />
                </motion.div>
                <h3 className="font-serif font-bold text-2xl text-nio-green-900 mb-2">
                  {isNew ? 'Welcome to Nio Tea!' : 'Welcome back!'}
                </h3>
                <p className="text-gray-500 text-sm">Redirecting to products...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/" className="hover:text-nio-green-700 transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
