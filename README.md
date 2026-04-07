# Nio Tea — Full-Stack MERN Website

A production-ready, fully responsive tea trading catalog website for **Nio Tea**, built with the MERN stack (MongoDB · Express · React · Node.js) and TailwindCSS.

---

## ✨ Features

### Public Website
- **Animated Hero** — Premium logo animation with floating tea leaf effects and steam
- **About Us** — Vision, Mission, Goals, Values, and full company story
- **Our Team** — Team section with role cards
- **Product Catalog** — Filterable catalog with category, leaf grade, and search filters
- **Price Lock** — Product prices are hidden for guests; revealed after sign-in
- **Contact Page** — Contact form + Google Maps embed
- **Testimonials** — Customer review section
- **SEO** — Meta tags, Open Graph, canonical URLs on every page
- **Scroll Animations** — AOS + Framer Motion animations throughout
- **Fully Responsive** — Mobile, tablet, desktop optimised

### Authentication (OTP-based)
- Mobile number + 6-digit OTP verification
- New users provide their name at signup
- Existing users are detected automatically
- Works with Twilio, Fast2SMS, or dev mock (OTP logged to console)
- JWT-based session, stored in localStorage

### Admin Panel (`/admin`)
- **Secure login** with separate admin JWT
- **Dashboard** — Analytics: user trends chart, products by category pie chart, recent users
- **Products CRUD** — Add / Edit / Delete products with full details:
  - Image upload with **crop & preview** (react-image-crop + Sharp + Cloudinary)
  - Variants (weight × price × SKU)
  - Brewing instructions, ingredients, tags, SEO fields
- **Users Management** — View, search, edit, activate/deactivate, delete users
- **Export** — Download user list as Excel (XLSX) or CSV
- **Site Content** — Edit hero tagline, about section, contact info, SEO settings

---

## 🏗 Tech Stack

| Layer       | Technology |
|-------------|-----------|
| Frontend    | React 18 + Vite + TailwindCSS + Framer Motion |
| UI Libs     | react-icons, react-hot-toast, recharts, react-image-crop |
| Backend     | Node.js + Express 4 |
| Database    | MongoDB + Mongoose |
| Auth        | JWT (user + admin separate secrets) |
| OTP         | Twilio / Fast2SMS / Dev Mock |
| Images      | Multer + Sharp (resize/WebP) + Cloudinary |
| Excel       | SheetJS (xlsx) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- OTP service: Twilio or Fast2SMS (optional for dev)

### 1. Clone & Setup Environment

```bash
# Install all dependencies
npm run install:all

# Configure server
cd server
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, Cloudinary keys, OTP credentials, and Supabase keys

# Configure frontend
cd ../client
cp .env.example .env
# Edit .env with VITE_API_URL, VITE_SUPABASE_URL, and VITE_SUPABASE_ANON_KEY
```

### 2. Start Development Servers

```bash
# From project root — starts both server (port 5000) and client (port 5173)
npm run dev

# Or individually:
npm run dev:server   # Backend on http://localhost:5000
npm run dev:client   # Frontend on http://localhost:5173
```

The API server auto-seeds the admin account on first boot:
- **Email:** `admin@niotea.com`
- **Password:** `Admin@123`
> ⚠ Change these immediately in production via the `.env` file.

### 3. OTP in Development

In dev mode, the OTP is printed to the server console AND returned in the API response as `devOTP` — visible in the login form for easy testing. **Never enable this in production.**

Set `OTP_PROVIDER=twilio` or `OTP_PROVIDER=fast2sms` in `.env` for real SMS.

---

## 📁 Project Structure

```
nio-tea/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── api/               # Axios instances (user + admin)
│   │   ├── components/
│   │   │   ├── home/          # Hero, About, Featured, Team, Testimonials, Stats
│   │   │   ├── layout/        # Navbar, Footer, AdminLayout, MainLayout
│   │   │   └── ui/            # ProductCard, etc.
│   │   ├── context/           # AuthContext, AdminContext
│   │   └── pages/
│   │       ├── admin/         # AdminLogin, Dashboard, Products, Users, Content
│   │       ├── Home.jsx
│   │       ├── About.jsx
│   │       ├── Products.jsx
│   │       ├── ProductDetail.jsx
│   │       ├── Contact.jsx
│   │       └── Login.jsx
│   ├── tailwind.config.js     # Custom Nio Tea color palette + animations
│   └── vite.config.js         # API proxy to backend
│
└── server/                    # Express backend
    ├── config/db.js            # MongoDB connection
    ├── controllers/            # authController, productController, adminController
    ├── middleware/             # auth.js, adminAuth.js, upload.js
    ├── models/                 # User, OTP, Admin, Product, SiteContent
    ├── routes/                 # /api/auth, /api/products, /api/admin
    ├── utils/sendOTP.js        # Multi-provider OTP utility
    └── index.js                # Express app entry
```

---

## 🎨 Design System

**Color Palette (Nio Tea brand):**

| Token           | Value     | Usage |
|----------------|-----------|-------|
| `nio-green-950` | `#0e2010` | Deep dark background |
| `nio-green-900` | `#1B3A18` | Primary brand green |
| `nio-green-800` | `#26451c` | Buttons, nav |
| `nio-gold-500`  | `#D4A017` | Accent, badges, CTA |
| `nio-cream`     | `#F8F4E9` | Backgrounds |

**Typography:**
- Headlines: *Playfair Display* (serif)
- Display: *Cormorant Garamond*
- Body: *Inter* (sans-serif)

---

## 🔐 Security

- Helmet.js for HTTP headers
- CORS restricted to `CLIENT_URL`
- Global & per-route rate limiting
- OTP rate limit (3 requests/minute per IP)
- OTP max attempts (5 tries before invalidation)
- OTP expiry (10 minutes TTL via MongoDB index)
- Separate JWT secrets for users vs. admin
- Admin password hashed with bcrypt (12 rounds)
- Image upload: type validation + 10MB limit + Sharp sanitisation
- Input sanitisation via express-validator

---

## 📦 Deployment Notes

1. Set `NODE_ENV=production` in server `.env`
2. Set Supabase env vars in both frontend and backend:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Set `CLIENT_URL` to your deployed frontend domain in backend env / Vercel server settings
4. Remove `devOTP` from API responses (already guarded by `NODE_ENV`)
5. Use MongoDB Atlas for cloud database
6. Configure Cloudinary for images
7. Set real Twilio/Fast2SMS credentials
8. Change default admin email/password
9. `npm run build` generates `client/dist/` for static hosting (Vercel, Nginx, etc.)
10. Serve static build from Express or a CDN

---

## 📝 License

MIT © Nio Tea 2024
