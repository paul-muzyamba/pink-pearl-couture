-- ================================================================
--  PINK PEARL COUTURE ZM — SUPABASE DATABASE SCHEMA
--  File: supabase-schema.sql
-- ================================================================


-- ── PRODUCTS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (

  -- Identity
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Core fields (required)
  name            TEXT NOT NULL,
  category        TEXT NOT NULL
                    CHECK (category IN (
                      'dresses','tops','skirts','suits',
                      'bags','shoes','sandals'
                    )),
  price_zmw       INTEGER NOT NULL CHECK (price_zmw >= 0),

  -- Media
  image_url       TEXT,          -- Cloudinary URL; null = use emoji fallback
  emoji           TEXT DEFAULT '🛍️',

  -- Display metadata
  badge           TEXT DEFAULT '',
  badge_type      TEXT DEFAULT ''
                    CHECK (badge_type IN ('','gold','sale')),
  bg_class        TEXT DEFAULT '',
  colors          TEXT[] DEFAULT '{}',

  -- Stock & logistics
  in_stock        BOOLEAN DEFAULT TRUE NOT NULL,
  store_location  TEXT DEFAULT 'both'
                    CHECK (store_location IN ('northmead','chilenje','both')),

  -- Admin control
  sort_order      INTEGER DEFAULT 0,  -- lower = appears first on public site

  -- Timestamps (auto-managed)
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ── AUTO-UPDATE updated_at ON EVERY EDIT ──────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ── INDEXES (fast filtering for the public storefront) ─────────
CREATE INDEX IF NOT EXISTS idx_products_category
  ON products (category);

CREATE INDEX IF NOT EXISTS idx_products_in_stock
  ON products (in_stock);

CREATE INDEX IF NOT EXISTS idx_products_sort
  ON products (sort_order ASC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_name_search
  ON products USING gin(to_tsvector('english', name));


-- ── ROW LEVEL SECURITY ─────────────────────────────────────────
--  Public visitors: read in-stock items only
--  Authenticated admins: full read/write access

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can SELECT in-stock items only
CREATE POLICY "public_read_in_stock"
  ON products
  FOR SELECT
  TO anon
  USING (in_stock = TRUE);

-- Authenticated admins can SELECT everything (including sold-out)
CREATE POLICY "admin_read_all"
  ON products
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Authenticated admins can INSERT
CREATE POLICY "admin_insert"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Authenticated admins can UPDATE
CREATE POLICY "admin_update"
  ON products
  FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Authenticated admins can DELETE
CREATE POLICY "admin_delete"
  ON products
  FOR DELETE
  TO authenticated
  USING (TRUE);


-- ── SAMPLE DATA (optional — delete this block if not needed) ───
INSERT INTO products
  (name, category, price_zmw, emoji, badge, badge_type, bg_class, colors, in_stock, store_location, sort_order)
VALUES
  ('Black Velvet Dress',    'dresses', 450, '🖤', 'New In',      '',     'bg-ink',   ARRAY['#1a1818'],            TRUE,  'both',      1),
  ('Black Sequin Gown',     'dresses', 550, '✨', 'Best Seller', '',     'bg-ink',   ARRAY['#1a1818'],            TRUE,  'northmead', 2),
  ('Silk Slip Dress',       'dresses', 310, '🩶', 'Silk',        'gold', 'bg-dusty', ARRAY['#6b5b5b','#b08070'], TRUE,  'both',      3),
  ('Hot Pink Maxi Dress',   'dresses', 450, '💗', '',            '',     'bg-pink',  ARRAY['#e8408a'],            TRUE,  'both',      4),
  ('Pink Halter Mini',      'dresses', 290, '🌸', '',            '',     'bg-blush', ARRAY['#f4a8c8','#fff'],     TRUE,  'chilenje',  5),
  ('Black Corset Top',      'tops',    260, '🖤', 'Best Seller', '',     'bg-ink',   ARRAY['#1a1818'],            TRUE,  'both',      10),
  ('Cream Silk Blouse',     'tops',    220, '🤍', 'Silk',        'gold', '',         ARRAY['#e8d8b8','#1a1818'], TRUE,  'northmead', 11),
  ('Pink Ruffle Skirt',     'skirts',  200, '🌸', 'New In',      '',     'bg-blush', ARRAY['#f0a0c0'],            TRUE,  'both',      20),
  ('Black Slit Skirt',      'skirts',  240, '🖤', '',            '',     'bg-ink',   ARRAY['#1a1818'],            TRUE,  'both',      21),
  ('Pink Power Suit',       'suits',   720, '💗', 'New In',      '',     'bg-pink',  ARRAY['#e8408a'],            TRUE,  'both',      30),
  ('Formal Ladies Suit',    'suits',   680, '🤍', 'Best Seller', '',     '',         ARRAY['#d4c0b8','#1a1818'], TRUE,  'northmead', 31),
  ('Luxury Tote Bag',       'bags',    390, '👜', 'Best Seller', '',     'bg-dusty', ARRAY['#8c6a50','#1a1818'], TRUE,  'both',      40),
  ('Pearl Chain Clutch',    'bags',    340, '💎', 'New In',      '',     '',         ARRAY['#d4c0b0','#c4506a'], TRUE,  'both',      41),
  ('Black Stilettos',       'shoes',   320, '👠', 'Best Seller', '',     'bg-ink',   ARRAY['#1a1818'],            TRUE,  'both',      50),
  ('Nude Pointed Heels',    'shoes',   280, '🤍', 'Last 3',      'sale', '',         ARRAY['#d4b090'],            TRUE,  'northmead', 51),
  ('Gold Block Heels',      'shoes',   350, '✨', '',            'gold', '',         ARRAY['#b8922e'],            TRUE,  'chilenje',  52),
  ('Luxury Slides',         'sandals', 250, '🌸', '',            '',     'bg-blush', ARRAY['#c4506a','#1a1818'], TRUE,  'both',      60),
  ('Gold Flat Sandals',     'sandals', 220, '✨', 'New In',      'gold', '',         ARRAY['#b8922e'],            TRUE,  'both',      61)
ON CONFLICT DO NOTHING;
