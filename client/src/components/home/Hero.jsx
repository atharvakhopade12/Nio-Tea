import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useSiteContent } from '../../hooks/useSiteContent';

export default function Hero() {
  const { data } = useSiteContent('hero', {
    subTagline: 'Est. 2020 • Premium Tea Estate',
    tagline: 'Where every leaf tells a story of nature, tradition, and excellence.',
    ctaPrimary: 'Explore Collection',
    ctaSecondary: 'Our Story',
  });

  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start from 1 second on first load
    const handleCanPlay = () => {
      if (video.currentTime < 3) video.currentTime = 3;
    };

    // Loop back to 1 second when reaching 19 seconds
    const handleTimeUpdate = () => {
      if (video.currentTime >= 19) {
        video.currentTime = 3;
      }
    };

    video.addEventListener('canplay', handleCanPlay, { once: true });
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-nio-green-950">

      {/* ── Video Background ── */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.38) saturate(1.1)' }}
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* ── Gradient overlay for depth ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(14,32,16,0.55) 0%, rgba(14,32,16,0.15) 40%, rgba(14,32,16,0.15) 60%, rgba(14,32,16,0.75) 100%), radial-gradient(ellipse at 50% 50%, rgba(212,160,23,0.08) 0%, transparent 70%)',
        }}
      />

      {/* ── Gold left accent line ── */}
      <motion.div
        className="absolute left-0 top-1/2 w-1 h-40 bg-gradient-to-b from-transparent via-nio-gold-500 to-transparent"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 1.8, delay: 0.6 }}
      />
      <motion.div
        className="absolute right-0 top-1/2 w-1 h-40 bg-gradient-to-b from-transparent via-nio-gold-500/50 to-transparent"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 1.8, delay: 0.8 }}
      />

      {/* ── Main Content ── */}
      <div className="container-custom relative z-10 text-center pt-28 pb-20">

        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0.6, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1.2, type: 'spring', stiffness: 80 }}
        >
          <div className="relative flex items-center justify-center">
            {/* Outer pulsing glow ring */}
            <motion.div
              className="absolute w-80 h-80 rounded-full border border-nio-gold-400/20"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Spinning decorative ring */}
            <motion.div
              className="absolute w-72 h-72 rounded-full border border-nio-gold-400/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              style={{ borderStyle: 'dashed' }}
            />
            {/* Logo image */}
            <motion.div
              className="relative w-52 h-52 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden border-4 border-nio-gold-400/60 shadow-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img
                src="/nio-tea-logo.jpg"
                alt="Nio Tea"
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Steam */}
            <div className="absolute -top-6 inset-x-0 flex justify-center gap-3">
              {[0, 0.5, 1].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 h-5 bg-white/40 rounded-full origin-bottom"
                  animate={{ scaleY: [0, 1, 0], opacity: [0, 0.6, 0], y: [0, -8, -16] }}
                  transition={{ duration: 2, delay, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sub tagline */}
        <motion.p
          className="text-nio-gold-400 text-xs font-sans tracking-[0.45em] uppercase mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          {data.subTagline || 'Est. 2020 • Premium Tea Estate'}
        </motion.p>

        {/* Gold divider */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-6"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-nio-gold-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-nio-gold-400" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-nio-gold-500" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-white/80 text-lg md:text-2xl font-light max-w-2xl mx-auto leading-relaxed mb-12 drop-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {data.tagline || 'Where every leaf tells a story of nature, tradition, and excellence.'}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.15 }}
        >
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-nio-gold-500 hover:bg-nio-gold-400 text-white font-semibold text-base tracking-wide shadow-lg hover:shadow-nio-gold-500/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            {data.ctaPrimary || 'Explore Collection'}
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full border-2 border-white/40 text-white font-medium text-base tracking-wide backdrop-blur-sm hover:bg-white/10 hover:border-white/70 transition-all duration-300 hover:-translate-y-0.5"
          >
            {data.ctaSecondary || 'Our Story'}
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <span className="text-white/40 text-xs tracking-[0.3em] uppercase">Scroll</span>
          <motion.div
            className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"
            animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 80" className="w-full fill-white">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}

// Animated tea leaf SVG paths
const LeafSVG = ({ className }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <g opacity="0.15">
      <ellipse cx="40" cy="40" rx="28" ry="38" fill="#4a8f34" transform="rotate(-30 40 40)" />
      <line x1="40" y1="10" x2="40" y2="70" stroke="#2d5520" strokeWidth="1.5" />
      <line x1="32" y1="25" x2="48" y2="38" stroke="#2d5520" strokeWidth="1" />
      <line x1="30" y1="38" x2="50" y2="48" stroke="#2d5520" strokeWidth="1" />
    </g>
  </svg>
);

// Steam animation component
const Steam = ({ delay = 0, x = 0 }) => (
  <motion.div
    className="absolute bottom-full"
    style={{ left: x }}
    initial={{ y: 0, opacity: 0.5, scaleX: 1 }}
    animate={{ y: -60, opacity: 0, scaleX: 1.4 }}
    transition={{ duration: 3, repeat: Infinity, delay, ease: 'easeOut' }}
  >
    <div className="w-0.5 h-8 bg-white/50 rounded-full" />
  </motion.div>
);
