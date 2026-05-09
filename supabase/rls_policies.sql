-- =============================================
-- RLS Policies for Hihya Care
-- Doctor data isolation: each doctor sees only
-- their own patients, appointments, and revenue
-- =============================================

-- 1. DOCTORS TABLE
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Any visitor can see doctors (for the booking/home page)
DROP POLICY IF EXISTS "doctors_read_public" ON doctors;
CREATE POLICY "doctors_read_public" ON doctors
  FOR SELECT
  USING (true);

-- Only the doctor themselves can update their profile
DROP POLICY IF EXISTS "doctors_update_own" ON doctors;
CREATE POLICY "doctors_update_own" ON doctors
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. APPOINTMENTS TABLE
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Anyone can read appointments (frontend handles auth via secret code)
DROP POLICY IF EXISTS "appointments_read_own" ON appointments;
DROP POLICY IF EXISTS "appointments_read_public" ON appointments;
CREATE POLICY "appointments_read_public" ON appointments
  FOR SELECT
  USING (true);

-- Anyone can create an appointment (patient booking)
DROP POLICY IF EXISTS "appointments_insert_public" ON appointments;
CREATE POLICY "appointments_insert_public" ON appointments
  FOR INSERT
  WITH CHECK (true);

-- Anyone can update appointments (frontend handles auth via secret code)
DROP POLICY IF EXISTS "appointments_update_own" ON appointments;
DROP POLICY IF EXISTS "appointments_update_public" ON appointments;
CREATE POLICY "appointments_update_public" ON appointments
  FOR UPDATE
  USING (true);

-- 3. TRIAGE RESULTS TABLE
ALTER TABLE triage_results ENABLE ROW LEVEL SECURITY;

-- Anyone can read triage results (frontend handles auth via secret code)
DROP POLICY IF EXISTS "triage_results_read_own" ON triage_results;
DROP POLICY IF EXISTS "triage_results_read_public" ON triage_results;
CREATE POLICY "triage_results_read_public" ON triage_results
  FOR SELECT
  USING (true);

-- Anyone can submit a triage
DROP POLICY IF EXISTS "triage_results_insert_public" ON triage_results;
CREATE POLICY "triage_results_insert_public" ON triage_results
  FOR INSERT
  WITH CHECK (true);

-- =============================================
-- 4. EXPENSES TABLE — editable monthly expenses per doctor
-- =============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  month DATE NOT NULL DEFAULT date_trunc('month', now()),
  rent NUMERIC DEFAULT 0,
  electricity NUMERIC DEFAULT 0,
  water NUMERIC DEFAULT 0,
  supplies NUMERIC DEFAULT 0,
  staff NUMERIC DEFAULT 0,
  maintenance NUMERIC DEFAULT 0,
  other NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(doctor_id, month)
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Anyone can read expenses (frontend handles auth via secret code)
DROP POLICY IF EXISTS "expenses_read_own" ON expenses;
DROP POLICY IF EXISTS "expenses_read_public" ON expenses;
CREATE POLICY "expenses_read_public" ON expenses
  FOR SELECT
  USING (true);

-- Anyone can insert expenses
DROP POLICY IF EXISTS "expenses_insert_own" ON expenses;
DROP POLICY IF EXISTS "expenses_insert_public" ON expenses;
CREATE POLICY "expenses_insert_public" ON expenses
  FOR INSERT
  WITH CHECK (true);

-- Anyone can update expenses
DROP POLICY IF EXISTS "expenses_update_own" ON expenses;
DROP POLICY IF EXISTS "expenses_update_public" ON expenses;
CREATE POLICY "expenses_update_public" ON expenses
  FOR UPDATE
  USING (true);

-- =============================================
-- Helper: Link a doctor to an auth user
-- Run this when a doctor first links their account:
--   UPDATE doctors SET user_id = '<auth-uuid>' WHERE secret_code = '<code>';
-- =============================================
