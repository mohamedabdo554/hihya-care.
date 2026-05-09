-- =============================================
-- Hihya Care — Full Database Setup (WITH DROP)
-- Run this in Supabase SQL Editor
-- =============================================

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS triage_results CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;

-- 1. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT,
  name_en TEXT,
  name_ar TEXT,
  specialty TEXT,
  specialty_en TEXT,
  specialty_ar TEXT,
  specialties TEXT[],
  gender TEXT,
  availability TEXT[],
  image_url TEXT,
  bio TEXT,
  bio_en TEXT,
  bio_ar TEXT,
  price TEXT,
  price_value NUMERIC,
  clinicLocation TEXT,
  clinicLocation_en TEXT,
  clinicLocation_ar TEXT,
  clinic_link TEXT,
  phone_number TEXT,
  secret_code TEXT UNIQUE,
  clinic_images TEXT[],
  wait_minutes INTEGER,
  payment_method TEXT,
  payment_method_en TEXT,
  tele_consultation BOOLEAN DEFAULT false,
  next_available_slot TIMESTAMPTZ,
  rating NUMERIC,
  reviews_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed doctors with the hardcoded data
INSERT INTO doctors (id, name, name_en, name_ar, specialty, specialty_en, specialty_ar, specialties, gender, availability, image_url, bio, bio_en, bio_ar, price, price_value, clinicLocation, clinicLocation_en, clinicLocation_ar, clinic_link, phone_number, secret_code, tele_consultation)
VALUES
  ('dr-mohamed-alafandi', 'د. محمد حسن الأفندي', 'Dr. Mohamed Hassan El Afandy', 'د. محمد حسن الأفندي', 'مسالك بولية وحصوات وجراحة مناظير', 'Urology, Stones & Endoscopic Surgery', 'مسالك بولية وحصوات وجراحة مناظير', ARRAY['مسالك بولية', 'حصوات', 'جراحة مناظير', 'ذكورة', 'عقم الرجال'], 'male', ARRAY['today', 'tomorrow'], '/doctors/mohamed-afandy.png', 'استشاري جراحة ومناظير المسالك البولية والكلى وأمراض الذكورة والبروستاتا وعقم الرجال.', 'Consultant in endoscopic urology, kidney stones, andrology, prostate and infertility.', 'استشاري جراحة ومناظير المسالك البولية والكلى وأمراض الذكورة والبروستاتا وعقم الرجال.', 'استشارة حسب الكشف', 120, 'عند البنك الأهلي القديم، بجوار صيدلية د. جمعة', 'Near the old National Bank, next to Dr. Gomaa Pharmacy', 'عند البنك الأهلي القديم، بجوار صيدلية د. جمعة', 'https://maps.app.goo.gl/hCyijNgYe1inGouk9', NULL, 'HC-2026', false),
  ('dr-elya-nassar', 'د. إليا نصار', 'Dr. Elya Nassar', 'د. إليا نصار', 'طبيب قلب', 'Cardiologist', 'طبيب قلب', ARRAY['قلب واوعية دموية'], 'male', ARRAY['today'], NULL, '14 سنة في رعاية القلب المتقدمة.', '14 years in advanced cardiac care.', '14 سنة في رعاية القلب المتقدمة.', '90 دولار استشارة', 90, NULL, NULL, NULL, NULL, '+201001112233', 'HC-9017', false),
  ('dr-adam-fahmy', 'د. آدم فهمي', 'Dr. Adam Fahmy', 'د. آدم فهمي', 'طبيب أعصاب', 'Neurologist', 'طبيب أعصاب', ARRAY['مخ واعصاب'], 'male', ARRAY['tomorrow'], NULL, '11 سنة في تشخيص أمراض الأعصاب.', '11 years in neurology diagnostics.', '11 سنة في تشخيص أمراض الأعصاب.', '110 دولار استشارة', 110, NULL, NULL, NULL, NULL, '+201002223344', 'HC-1142', false),
  ('dr-sara-adel', 'د. سارة عادل', 'Dr. Sara Adel', 'د. سارة عادل', 'طبيب أطفال', 'Pediatrician', 'طبيب أطفال', ARRAY['اطفال وحديثي الولادة'], 'female', ARRAY['today', 'tomorrow'], NULL, '9 سنوات في رعاية الأطفال.', '9 years in pediatric care.', '9 سنوات في رعاية الأطفال.', '75 دولار استشارة', 75, NULL, NULL, NULL, NULL, '+201003334455', 'HC-2608', false),
  ('dr-omar-ibrahim', 'د. عمر إبراهيم', 'Dr. Omar Ibrahim', 'د. عمر إبراهيم', 'جراح عظام', 'Orthopedic Surgeon', 'جراح عظام', ARRAY['عظام'], 'male', ARRAY['this-week'], NULL, '16 سنة في استعادة الحركة والعظام.', '16 years restoring movement and bones.', '16 سنة في استعادة الحركة والعظام.', '120 دولار استشارة', 120, NULL, NULL, NULL, NULL, '+201004445566', 'HC-7784', false),
  ('dr-asmaa-desouky', 'د. أسماء دسوقي', 'Dr. Asmaa Desouky', 'د. أسماء دسوقي', 'جلدية وتجميل وليزر', 'Dermatology, Cosmetic & Laser', 'جلدية وتجميل وليزر', ARRAY['جلدية', 'تجميل', 'ليزر'], 'female', ARRAY['today', 'tomorrow'], NULL, 'عيادة مرواد للجلدية والتجميل والليزر في ههيا.', 'Marwad Dermatology, Cosmetic & Laser Clinic in Hehya.', 'عيادة مرواد للجلدية والتجميل والليزر في ههيا.', 'استشارة حسب الكشف', 80, 'ههيا، شارع الجمهورية، أعلى صيدلية الضريبي', 'El-Gomhoreya St, above El-Dariby Pharmacy, Hehya', 'ههيا، شارع الجمهورية، أعلى صيدلية الضريبي', NULL, NULL, 'HC-2610', false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar,
  specialty = EXCLUDED.specialty, specialty_en = EXCLUDED.specialty_en, specialty_ar = EXCLUDED.specialty_ar,
  specialties = EXCLUDED.specialties, bio = EXCLUDED.bio, bio_en = EXCLUDED.bio_en, bio_ar = EXCLUDED.bio_ar,
  price = EXCLUDED.price, price_value = EXCLUDED.price_value, secret_code = EXCLUDED.secret_code;

-- 2. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  appointment_date TIMESTAMPTZ,
  appointment_time TEXT,
  status TEXT DEFAULT 'Pending',
  symptoms TEXT,
  patient_age TEXT,
  patient_gender TEXT,
  fees NUMERIC,
  diagnosis TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- 3. EXPENSES TABLE
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

-- 4. TRIAGE RESULTS TABLE
CREATE TABLE IF NOT EXISTS triage_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id TEXT REFERENCES doctors(id) ON DELETE CASCADE,
  patient_name TEXT,
  symptoms TEXT,
  analysis TEXT,
  recommendation TEXT,
  specialty TEXT,
  emergency BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  appointment_id TEXT,
  doctor_id TEXT NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT
);

-- =============================================
-- Apply RLS Policies
-- =============================================
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_results ENABLE ROW LEVEL SECURITY;

-- Doctors: anyone can read, only owner can update
DROP POLICY IF EXISTS "doctors_read_public" ON doctors;
CREATE POLICY "doctors_read_public" ON doctors FOR SELECT USING (true);

DROP POLICY IF EXISTS "doctors_update_own" ON doctors;
CREATE POLICY "doctors_update_own" ON doctors FOR UPDATE USING (auth.uid() = user_id);

-- Appointments: doctor reads own, anyone inserts, doctor updates
DROP POLICY IF EXISTS "appointments_read_own" ON appointments;
CREATE POLICY "appointments_read_own" ON appointments FOR SELECT USING (
  doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "appointments_insert_public" ON appointments;
CREATE POLICY "appointments_insert_public" ON appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "appointments_update_own" ON appointments;
CREATE POLICY "appointments_update_own" ON appointments FOR UPDATE USING (
  doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
);

-- Expenses: doctor owns
DROP POLICY IF EXISTS "expenses_read_own" ON expenses;
CREATE POLICY "expenses_read_own" ON expenses FOR SELECT USING (
  doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "expenses_insert_own" ON expenses;
CREATE POLICY "expenses_insert_own" ON expenses FOR INSERT WITH CHECK (
  doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "expenses_update_own" ON expenses;
CREATE POLICY "expenses_update_own" ON expenses FOR UPDATE USING (
  doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
);

-- Triage: doctor reads, anyone inserts
DROP POLICY IF EXISTS "triage_results_read_own" ON triage_results;
CREATE POLICY "triage_results_read_own" ON triage_results FOR SELECT USING (
  doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "triage_results_insert_public" ON triage_results;
CREATE POLICY "triage_results_insert_public" ON triage_results FOR INSERT WITH CHECK (true);

-- Reviews: read anyone, insert only by authenticated patients with completed appointments
DROP POLICY IF EXISTS "reviews_read_public" ON reviews;
CREATE POLICY "reviews_read_public" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM appointments
    WHERE appointments.id::text = reviews.appointment_id
      AND appointments.doctor_id::text = reviews.doctor_id
      AND appointments.status = 'Completed'
      AND appointments.patient_id = auth.uid()
  )
);
