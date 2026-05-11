-- Add service_type column to appointments table
-- Values: 'normal' | 'phone' | 'urgent'
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'normal';

-- Add home_visit column to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS home_visit BOOLEAN DEFAULT false;

-- Add base_price column (numeric, defaults to price_value if not set)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS base_price NUMERIC;

-- Sync base_price from price_value for existing rows
UPDATE doctors SET base_price = price_value WHERE base_price IS NULL AND price_value IS NOT NULL;
UPDATE doctors SET base_price = 100 WHERE base_price IS NULL;

-- Update some seed doctors to enable tele_consultation and home_visit
UPDATE doctors SET tele_consultation = true WHERE id IN ('dr-sara-adel', 'dr-ahmed-ghazy', 'dr-mohamed-shabrawy', 'dr-ayman-makawi');
UPDATE doctors SET home_visit = true WHERE id IN ('dr-mostafa-elshamy', 'dr-ayman-makawi');

