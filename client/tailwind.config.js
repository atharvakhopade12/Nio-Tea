/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'nio-green': {
          50:  '#f0f7ec',
          100: '#ddefd4',
          200: '#bddead',
          300: '#94c87d',
          400: '#6aad52',
          500: '#4a8f34',
          600: '#386e27',
          700: '#2d5520',
          800: '#26451c',
          900: '#1B3A18',
          950: '#0e2010',
        },
        'nio-gold': {
          50:  '#fdf8ed',
          100: '#f9edcc',
          200: '#f2d994',
          300: '#ebc05c',
          400: '#e4a830',
          500: '#D4A017',
          600: '#b87e10',
          700: '#985f10',
          800: '#7d4c14',
          900: '#693f14',
        },
        'nio-cream': '#F8F4E9',
        'nio-dark':  '#1A1A1A',
      },
      fontFamily: {
        serif:  ['Playfair Display', 'Georgia', 'serif'],
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        display:['Cormorant Garamond', 'serif'],
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'spin-slow':    'spin 12s linear infinite',
        'pulse-slow':   'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in-up':   'fadeInUp 0.8s ease-out forwards',
        'shimmer':      'shimmer 2s linear infinite',
        'steam1':       'steam 3s ease-in infinite',
        'steam2':       'steam 3s ease-in 1s infinite',
        'steam3':       'steam 3s ease-in 2s infinite',
        'leaf-rotate':  'leafRotate 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-20px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        steam: {
          '0%':   { transform: 'translateY(0) scaleX(1)', opacity: '0.6' },
          '50%':  { transform: 'translateY(-30px) scaleX(1.4)', opacity: '0.3' },
          '100%': { transform: 'translateY(-60px) scaleX(0.8)', opacity: '0' },
        },
        leafRotate: {
          '0%, 100%': { transform: 'rotate(-5deg) scale(1)' },
          '50%':       { transform: 'rotate(5deg) scale(1.05)' },
        },
      },
      backgroundImage: {
        'hero-pattern': "url('/assets/tea-pattern.svg')",
        'leaf-pattern': "url('/assets/leaf-pattern.svg')",
      },
      boxShadow: {
        'nio':    '0 4px 30px rgba(27,58,24,0.15)',
        'nio-lg': '0 8px 50px rgba(27,58,24,0.2)',
        'gold':   '0 4px 20px rgba(212,160,23,0.3)',
      },
    },
  },
  plugins: [],
};
