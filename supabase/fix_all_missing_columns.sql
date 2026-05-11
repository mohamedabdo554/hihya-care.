-- =============================================
-- Hihya Care — Fix all missing columns
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. APPOINTMENTS: add service_type, pet_name, pet_type
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'normal';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pet_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pet_type TEXT;

-- 2. DOCTORS: add home_visit, base_price, and other missing columns
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS home_visit BOOLEAN DEFAULT false;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS base_price NUMERIC;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'human';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS veterinary_team JSONB;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS working_days TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS working_hours TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS rescue_discount TEXT;

-- 3. Sync base_price from price_value for existing rows
UPDATE doctors SET base_price = price_value WHERE base_price IS NULL AND price_value IS NOT NULL;
UPDATE doctors SET base_price = 100 WHERE base_price IS NULL;

-- 4. Enable tele_consultation for specific doctors
UPDATE doctors SET tele_consultation = true WHERE id IN ('dr-sara-adel', 'dr-ahmed-ghazy', 'dr-mohamed-shabrawy', 'dr-ayman-makawi');
UPDATE doctors SET home_visit = true WHERE id IN ('dr-mostafa-elshamy', 'dr-ayman-makawi');
