-- =============================================
-- Fix RLS: make all tables publicly accessible
-- Frontend already handles auth via secret code
-- =============================================

-- 1. DOCTORS
DROP POLICY IF EXISTS "doctors_read_public" ON doctors;
CREATE POLICY "doctors_read_public" ON doctors FOR SELECT USING (true);

-- 2. APPOINTMENTS - read & update public
DROP POLICY IF EXISTS "appointments_read_own" ON appointments;
DROP POLICY IF EXISTS "appointments_read_public" ON appointments;
CREATE POLICY "appointments_read_public" ON appointments FOR SELECT USING (true);

DROP POLICY IF EXISTS "appointments_update_own" ON appointments;
DROP POLICY IF EXISTS "appointments_update_public" ON appointments;
CREATE POLICY "appointments_update_public" ON appointments FOR UPDATE USING (true);

-- 3. EXPENSES - full CRUD public
DROP POLICY IF EXISTS "expenses_read_own" ON expenses;
DROP POLICY IF EXISTS "expenses_read_public" ON expenses;
CREATE POLICY "expenses_read_public" ON expenses FOR SELECT USING (true);

DROP POLICY IF EXISTS "expenses_insert_own" ON expenses;
DROP POLICY IF EXISTS "expenses_insert_public" ON expenses;
CREATE POLICY "expenses_insert_public" ON expenses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "expenses_update_own" ON expenses;
DROP POLICY IF EXISTS "expenses_update_public" ON expenses;
CREATE POLICY "expenses_update_public" ON expenses FOR UPDATE USING (true);

-- 4. TRIAGE RESULTS - read public
DROP POLICY IF EXISTS "triage_results_read_own" ON triage_results;
DROP POLICY IF EXISTS "triage_results_read_public" ON triage_results;
CREATE POLICY "triage_results_read_public" ON triage_results FOR SELECT USING (true);

-- 5. Add patient_age & patient_gender columns to appointments (if not exist)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_age TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_gender TEXT;
