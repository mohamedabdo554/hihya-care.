-- =============================================
-- Disable RLS on all tables permanently
-- Frontend handles auth via secret code
-- =============================================

ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE triage_results DISABLE ROW LEVEL SECURITY;

-- Add patient_age & patient_gender columns to appointments (if not exist)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_age TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_gender TEXT;
