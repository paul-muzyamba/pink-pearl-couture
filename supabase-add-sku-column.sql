-- ================================================================
--  PINK PEARL COUTURE ZM — ADD SKU / BARCODE COLUMN
--  File: supabase-add-sku-column.sql
--  Run this once in the Supabase SQL editor.
-- ================================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sku TEXT;

-- Fast lookup + prevents accidentally reusing the same barcode twice
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku
  ON products (sku)
  WHERE sku IS NOT NULL;
