-- ============================================================
-- Nio Tea — Supabase / PostgreSQL Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- pgcrypto provides gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Shared trigger: keeps updated_at in sync on every UPDATE
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(50) NOT NULL,
  phone       VARCHAR(15) NOT NULL UNIQUE,
  is_verified BOOLEAN     NOT NULL DEFAULT false,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── ADMINS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL DEFAULT 'Admin',
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20)  NOT NULL DEFAULT 'admin'
                CHECK (role IN ('superadmin', 'admin')),
  is_active   BOOLEAN      NOT NULL DEFAULT true,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── PRODUCTS ─────────────────────────────────────────────────────────────────
-- variants, images, tags, ingredients, ratings, and seo are stored as JSONB
CREATE TABLE IF NOT EXISTS products (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 VARCHAR(100) NOT NULL,
  slug                 VARCHAR(200) NOT NULL UNIQUE,
  description          TEXT         NOT NULL,
  short_description    VARCHAR(300),
  category             VARCHAR(50)  NOT NULL,
  leaf_grade           VARCHAR(20),
  origin               VARCHAR(100),
  ingredients          JSONB        NOT NULL DEFAULT '[]',
  brewing_instructions JSONB        NOT NULL DEFAULT '{}',
  variants             JSONB        NOT NULL DEFAULT '[]',
  images               JSONB        NOT NULL DEFAULT '[]',
  tags                 JSONB        NOT NULL DEFAULT '[]',
  ratings              JSONB        NOT NULL DEFAULT '{"average":0,"count":0}',
  seo                  JSONB        NOT NULL DEFAULT '{}',
  is_featured          BOOLEAN      NOT NULL DEFAULT false,
  is_active            BOOLEAN      NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Full-text search column (auto-maintained, never stored explicitly)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(category, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS products_fts_idx  ON products USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS products_cat_idx  ON products (category);
CREATE INDEX IF NOT EXISTS products_slug_idx ON products (slug);
CREATE INDEX IF NOT EXISTS products_active_idx ON products (is_active);

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── ENQUIRIES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID         REFERENCES users(id)    ON DELETE SET NULL,
  product_id   UUID         REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(200) NOT NULL DEFAULT '',
  type         VARCHAR(20)  NOT NULL
                CHECK (type IN ('enquiry', 'callback', 'contact')),
  name         VARCHAR(100) NOT NULL,
  phone        VARCHAR(20)  NOT NULL DEFAULT '',
  email        VARCHAR(255) NOT NULL DEFAULT '',
  subject      VARCHAR(200) NOT NULL DEFAULT '',
  message      TEXT         NOT NULL DEFAULT '',
  status       VARCHAR(20)  NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'contacted', 'resolved')),
  admin_notes  TEXT         NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_enquiries_updated_at
  BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── SITE CONTENT ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_content (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  section    VARCHAR(50) NOT NULL UNIQUE,
  data       JSONB       NOT NULL,
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL UNIQUE,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  description TEXT        NOT NULL DEFAULT '',
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Seed default categories
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Black Tea',    'black-tea',    1),
  ('Green Tea',    'green-tea',    2),
  ('White Tea',    'white-tea',    3),
  ('Oolong Tea',   'oolong-tea',   4),
  ('Herbal Tea',   'herbal-tea',   5),
  ('Masala Tea',   'masala-tea',   6),
  ('Flavored Tea', 'flavored-tea', 7),
  ('Specialty Tea','specialty-tea',8)
ON CONFLICT (slug) DO NOTHING;

-- ─── OTPs ─────────────────────────────────────────────────────────────────────
-- No native TTL index — expired rows are deleted in application code.
-- OPTIONAL: Schedule a periodic cleanup with pg_cron:
--   SELECT cron.schedule('cleanup-otps', '*/15 * * * *',
--     $$DELETE FROM otps WHERE expires_at < NOW()$$);
CREATE TABLE IF NOT EXISTS otps (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      VARCHAR(15) NOT NULL,
  otp        VARCHAR(10) NOT NULL,
  purpose    VARCHAR(20) NOT NULL DEFAULT 'login'
              CHECK (purpose IN ('login', 'register')),
  expires_at TIMESTAMPTZ NOT NULL,
  attempts   INTEGER     NOT NULL DEFAULT 0,
  verified   BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS otps_phone_idx ON otps (phone);
