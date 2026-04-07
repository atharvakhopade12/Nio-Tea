import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiCheckCircle, HiPhone, HiChatAlt2, HiArrowRight } from 'react-icons/hi';
import { useSiteContent } from '../hooks/useSiteContent';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const DEFAULT = {
  showInNav: true,
  heroLabel: 'Transform Your Brand',
  heroTitle: 'Premium Tea Rebranding Services',
  heroSubtitle: 'We help businesses reimagine their tea products — from packaging and identity to formulation — with expertise trusted by leading distributors across India.',
  description: 'Nio Tea offers end-to-end rebranding solutions for tea businesses, distributors, and retailers. Whether you want to create a private label, refresh your existing packaging, or launch a new tea range under your brand, our team of experts will guide you every step of the way.',
  services: [
    { icon: '🎨', title: 'Packaging Design', desc: 'Custom packaging that tells your brand story — from pouches and caddies to gift boxes and premium tins.' },
    { icon: '🏷️', title: 'Private Labelling', desc: "Launch your own premium tea line using Nio Tea's curated blends and expert-quality standards." },
    { icon: '🍃', title: 'Custom Blending', desc: 'Signature tea blends crafted exclusively for your brand — unique flavours that set you apart.' },
    { icon: '📋', title: 'Brand Identity', desc: 'Logo, colour palette, typography and messaging tailored specifically for the tea market.' },
    { icon: '🚀', title: 'Market Launch Support', desc: 'From strategy to shelf — we support your go-to-market plan with industry expertise.' },
    { icon: '♻️', title: 'Sustainable Options', desc: 'Eco-friendly packaging and sustainable sourcing options to align with modern consumer values.' },
  ],
  whyTitle: 'Why Choose Nio Tea for Rebranding?',
  whyPoints: [
    'Over 5 years of experience in premium tea branding and distribution',
    'Access to 50+ curated tea varieties from certified garden sources',
    'End-to-end service from concept to delivery',
    'Competitive pricing for bulk and wholesale orders',
    'Dedicated account manager throughout the project',
  ],
  ctaTitle: 'Ready to Transform Your Brand?',
  ctaSubtitle: "Let's talk. Our rebranding specialists are ready to help you create something extraordinary.",
};

export default function Rebranding() {
  const { data } = useSiteContent('rebranding', DEFAULT);
  const { isLoggedIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(null); // 'callback' | 'enquiry'
  const [message, setMessage]       = useState('');

  const handleAction = async (type) => {
    if (!isLoggedIn) {
      toast.error('Please sign in to submit a request.');
      return;
    }
    setSubmitting(true);
    try {
      await API.post('/enquiries', {
        type,
        message: message || (type === 'callback' ? 'Please call me back regarding rebranding services.' : 'I would like to enquire about rebranding services.'),
        productName: 'Rebranding Services',
      });
      setSubmitted(type);
      setMessage('');
      toast.success(type === 'callback' ? 'Callback request sent! We\'ll call you soon.' : 'Enquiry submitted! We\'ll get back to you within 24 hours.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const services = data.services || DEFAULT.services;
  const whyPoints = data.whyPoints || DEFAULT.whyPoints;

  return (
    <div className="pt-20">
      {/* ── Hero ── */}
      <section
        className="py-28 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B3A18 0%, #2d5520 50%, #1a3317 100%)' }}
      >
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-nio-gold-500/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3" />

        <div className="container-custom relative z-10">
          <motion.p
            className="text-nio-gold-400 text-xs tracking-[0.3em] uppercase mb-3"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            {data.heroLabel || DEFAULT.heroLabel}
          </motion.p>
          <motion.h1
            className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            {data.heroTitle || DEFAULT.heroTitle}
          </motion.h1>
          <div className="gold-divider" />
          <motion.p
            className="text-nio-green-200 text-lg mt-4 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            {data.heroSubtitle || DEFAULT.heroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* ── Description ── */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-3xl text-center">
          <p
            className="text-gray-600 text-lg leading-relaxed"
            data-aos="fade-up"
          >
            {data.description || DEFAULT.description}
          </p>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="py-16 bg-nio-cream">
        <div className="container-custom">
          <div className="text-center mb-12" data-aos="fade-up">
            <p className="text-nio-gold-600 text-xs tracking-[0.3em] uppercase mb-2">What We Offer</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-nio-green-900">Our Rebranding Services</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-nio hover:shadow-nio-lg transition-all duration-300 group"
                data-aos="fade-up"
                data-aos-delay={i * 60}
                whileHover={{ y: -4 }}
              >
                <div className="text-4xl mb-4">{svc.icon}</div>
                <h3 className="font-serif font-bold text-nio-green-900 text-lg mb-2 group-hover:text-nio-green-700 transition-colors">
                  {svc.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{svc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-10" data-aos="fade-up">
            <h2 className="text-3xl font-serif font-bold text-nio-green-900">
              {data.whyTitle || DEFAULT.whyTitle}
            </h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whyPoints.map((point, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 bg-nio-green-50 rounded-xl p-4 border border-nio-green-100"
                data-aos="fade-up"
                data-aos-delay={i * 50}
              >
                <HiCheckCircle className="w-5 h-5 text-nio-green-600 shrink-0 mt-0.5" />
                <p className="text-nio-green-800 text-sm leading-relaxed">{point}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / Action ── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B3A18, #2d5520)' }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #D4A017 0%, transparent 50%), radial-gradient(circle at 80% 50%, #D4A017 0%, transparent 50%)' }}
        />
        <div className="container-custom max-w-2xl text-center relative z-10">
          <motion.div data-aos="fade-up">
            <p className="text-nio-gold-400 text-xs tracking-[0.3em] uppercase mb-3">Get In Touch</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
              {data.ctaTitle || DEFAULT.ctaTitle}
            </h2>
            <p className="text-nio-green-200 mb-8 text-lg">
              {data.ctaSubtitle || DEFAULT.ctaSubtitle}
            </p>

            {submitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur"
              >
                <HiCheckCircle className="w-14 h-14 text-nio-gold-400 mx-auto mb-4" />
                <p className="text-white font-semibold text-lg">
                  {submitted === 'callback' ? "We'll call you back shortly!" : 'Enquiry received!'}
                </p>
                <p className="text-nio-green-200 text-sm mt-2">Our team will get in touch with you within 24 hours.</p>
                <button
                  onClick={() => setSubmitted(null)}
                  className="mt-6 text-nio-gold-400 text-sm hover:underline"
                >
                  Submit another request
                </button>
              </motion.div>
            ) : (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Tell us about your rebranding requirements (optional)…"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-nio-gold-400 resize-none"
                />
                {isLoggedIn ? (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => handleAction('callback')}
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-nio-gold-500 hover:bg-nio-gold-400 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg"
                    >
                      <HiPhone className="w-4 h-4" />
                      Request a Callback
                    </button>
                    <button
                      onClick={() => handleAction('enquiry')}
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold text-sm transition-all disabled:opacity-50"
                    >
                      <HiChatAlt2 className="w-4 h-4" />
                      Enquire Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-nio-green-200 text-sm">Sign in to submit a request</p>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-nio-gold-500 hover:bg-nio-gold-400 text-white font-semibold text-sm transition-all shadow-lg"
                    >
                      Sign In <HiArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
