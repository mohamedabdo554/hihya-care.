import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { supabase } from './supabaseClient.js'
import DoctorCard, { type Doctor } from './DoctorCard'
type BookingType = 'tele-consultation' | 'clinic-visit' | 'urgent-care'
import DoctorProfilePageNew from './components/DoctorProfilePageNew.jsx'
import EnhancedBookingFlow from './components/EnhancedBookingFlow.jsx'
import AIChatWidget from './components/AIChatWidget.jsx'
import LuxuryHeader from './components/LuxuryHeader.jsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import ProtectedLayout from './components/ProtectedLayout'
import { DoctorDashboard } from './components/dashboard/DoctorDashboard'
import AITriageChat from './components/ai/AITriageChat'
import { TriageProvider } from './context/TriageContext'
import VeterinaryCard from './components/VeterinaryCard'
import VeterinaryProfilePage from './components/VeterinaryProfilePage.jsx'

// Lazy load heavy components
const PremiumDoctorProfile = lazy(() => import('./components/PremiumDoctorProfile'))

const fallbackDoctors: Doctor[] = [
  {
    id: 'dr-elya-nassar',
    name: 'Dr. Elya Nassar',
    specialty: 'Cardiologist',
    image_url: null,
    bio: '14 years in advanced cardiac care.',
    price: '$90 consultation',
    experience: '14 years in advanced cardiac care',
    clinicLocation: 'Hihya Central Heart Clinic, Level 3',
    category: 'human',
  },
  {
    id: 'dr-adam-fahmy',
    name: 'Dr. Adam Fahmy',
    specialty: 'Neurologist',
    image_url: null,
    bio: '11 years in neuro diagnostics.',
    price: '$110 consultation',
    experience: '11 years in neuro diagnostics',
    clinicLocation: 'Neuro Motion Wing, Suite 12',
    category: 'human',
  },
  {
    id: 'dr-sara-adel',
    name: 'Dr. Sara Adel',
    specialty: 'Pediatrician',
    image_url: null,
    bio: '9 years in child wellness.',
    price: '$75 consultation',
    experience: '9 years in child wellness',
    clinicLocation: 'Sunrise Pediatrics, Floor 2',
    category: 'human',
  },
  {
    id: 'al-rahma-pet-clinic',
    name: 'Al Rahma Pet Clinic',
    specialty: 'Pet Medicine & Surgery',
    image_url: null,
    bio: 'العیادة الوحيدة في ههيا المتخصصة في علاج الحيوانات الأليفة فقط (قطط وكلاب) - متاح بها 2 أطباء تخصص جراحة وباطنة',
    price: 'الكشف 80 ج - حالات الإنقاذ خصم 50 ج',
    experience: '',
    clinicLocation: 'شارع مضیفة المركز، خلف السجل، داخل الشارع تاني شمال',
    category: 'veterinary',
    veterinaryTeam: [
      { name: 'Mahmoud Rasmy', name_ar: 'محمود رسمي', specialty: 'Surgery', specialty_ar: 'جراحة' },
      { name: 'Abdulrahman El-Gammal', name_ar: 'عبدالرحمن الجمال', specialty: 'Internal Medicine', specialty_ar: 'باطنة' },
    ],
    phone_number: '01028423304',
    clinic_link: 'https://maps.google.com/maps?q=30.6733874%2C31.5864982&z=17&hl=en',
    facebook_url: 'https://www.facebook.com/share/18gX5Uh1r2/?mibextid=wwXIfr',
    working_days: 'جميع أيام الأسبوع حتی الجمعة (الجمعة غير ثابتة)',
    working_hours: 'من 2 ظهراً إلى 11 مساءً',
    payment_method: 'كاش - فودافون كاش',
    rescue_discount: 'خصم 50 ج على الكشف والعلاج لحالات الإنقاذ',
  },
]

type DoctorRow = {
  id: number | string
  name: string
  specialty: string
  image_url: string | null
  price: string | number | null
  bio: string | null
  category?: string
  veterinary_team?: any
  clinicLocation?: string
  clinicLocation_en?: string
  clinicLocation_ar?: string
  phone_number?: string
  clinic_link?: string
  facebook_url?: string
  working_days?: string
  working_hours?: string
  payment_method?: string
  rescue_discount?: string
}

function App() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorsLoading, setDoctorsLoading] = useState(true)
  const [doctorsNotice, setDoctorsNotice] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadDoctors = async () => {
      setDoctorsLoading(true)
      setDoctorsNotice('')

      const { data, error } = await supabase
        .from('doctors')
        .select('id, name, specialty, image_url, price, bio, category, veterinary_team, phone_number, clinic_link, facebook_url, working_days, working_hours, payment_method, rescue_discount')
        .order('name', { ascending: true })

      if (!isMounted) {
        return
      }

      if (error) {
        setDoctors(fallbackDoctors)
        setDoctorsNotice(
          'Supabase doctors table is not available yet. Showing curated demo doctors so the app stays usable.',
        )
      } else {
        const nextDoctors = ((data ?? []) as DoctorRow[]).map((doctor) => {
          const specialtyKey = doctor.specialty.toLowerCase()
          const isVet = doctor.category === 'veterinary'

          const base = {
            id: String(doctor.id),
            name: doctor.name,
            specialty: doctor.specialty,
            image_url: doctor.image_url,
            price: doctor.price ? String(doctor.price) : 'Consultation on request',
            bio: doctor.bio,
            category: (doctor.category ?? 'human') as 'human' | 'veterinary',
          }

          if (isVet) {
            return {
              ...base,
              experience: '',
              clinicLocation: doctor.clinicLocation ?? doctor.clinic_link ?? '',
              veterinaryTeam: doctor.veterinary_team ?? [],
              phone_number: doctor.phone_number,
              clinic_link: doctor.clinic_link,
              facebook_url: doctor.facebook_url,
              working_days: doctor.working_days,
              working_hours: doctor.working_hours,
              payment_method: doctor.payment_method,
              rescue_discount: doctor.rescue_discount,
            }
          }

          return {
            ...base,
            experience: doctor.bio || `Seasoned ${specialtyKey} specialist`,
            clinicLocation: doctor.clinicLocation ?? `Hihya Care ${specialtyKey} wing`,
          }
        })

        setDoctors(nextDoctors)
      }

      setDoctorsLoading(false)
    }

    loadDoctors()

    return () => {
      isMounted = false
    }
  }, [])

  const doctorLookup = useMemo(
    () => new Map(doctors.map((doctor) => [doctor.id, doctor])),
    [doctors],
  )

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <TriageProvider>
        <Routes>
          <Route
            path="/"
            element={<HomePage doctors={doctors} loading={doctorsLoading} notice={doctorsNotice} />}
          />
          <Route
            path="/doctor/premium-preview"
            element={
              <Suspense fallback={<AppShell><div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-slate-300 backdrop-blur-2xl">Loading profile...</div></AppShell>}>
                <PremiumDoctorProfile />
              </Suspense>
            }
          />
          <Route
            path="/doctor/:doctorId"
            element={<DoctorProfilePage doctors={doctorLookup} loading={doctorsLoading} notice={doctorsNotice} />}
          />
          <Route
            path="/book/:doctorId"
            element={<BookingPage doctors={doctorLookup} loading={doctorsLoading} notice={doctorsNotice} />}
          />
          <Route
            path="/veterinary/:clinicId"
            element={<VeterinaryPage doctors={doctorLookup} loading={doctorsLoading} notice={doctorsNotice} />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <ErrorBoundary>
                  <DoctorDashboard />
                </ErrorBoundary>
              </ProtectedLayout>
            }
          />
          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedLayout>
                <ErrorBoundary>
                  <DoctorDashboard />
                </ErrorBoundary>
              </ProtectedLayout>
            }
          />
          <Route
            path="/ai-triage"
            element={
              <ProtectedLayout>
                <ErrorBoundary>
                  <AITriageChat />
                </ErrorBoundary>
              </ProtectedLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </TriageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(2,6,23,1))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
      <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-10 top-24 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />
      <LuxuryHeader />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-20 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  )
}

const tabs = [
  { key: 'human', label: 'بشري', labelEn: 'Human Medicine' },
  { key: 'veterinary', label: 'بيطري', labelEn: 'Veterinary' },
]

function HomePage({
  doctors,
  loading,
  notice,
}: {
  doctors: Doctor[]
  loading: boolean
  notice: string
}) {
  const [activeTab, setActiveTab] = useState<'human' | 'veterinary'>('human')
  const [bookingType, setBookingType] = useState<BookingType | null>(null)

  const humanDoctors = doctors.filter((d) => d.category !== 'veterinary')
  const vetDoctors = doctors.filter((d) => d.category === 'veterinary')

  const handleBookingTypeSelect = useCallback((type: BookingType) => {
    setBookingType((prev) => (prev === type ? null : type))
  }, [])

  return (
    <AppShell>
      {/* Triple Hero Cards — Service Selection (inline, no external component) */}
      <div style={{ border: '3px solid red', padding: '20px', margin: '20px 0', background: 'rgba(255,0,0,0.1)' }}>
        <div style={{ border: '2px solid cyan', padding: '10px', marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ color: '#67e8f9', fontSize: '12px', letterSpacing: '0.45em', textTransform: 'uppercase' }}>Our Services</p>
          <h2 style={{ color: 'white', fontSize: '30px', fontWeight: '600', marginTop: '8px' }}>
            اختر نوع الخدمة
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>
            استشارة هاتفية، كشف عادي، أو كشف عاجل — احجز ما يناسبك
          </p>
        </div>

        {/* 3 Service Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', direction: 'rtl' }}>
          {/* استشارة هاتفية */}
          <button
            type="button"
            onClick={() => handleBookingTypeSelect('tele-consultation')}
            style={{
              border: '2px solid rgba(168,85,247,0.4)',
              borderRadius: '24px',
              padding: '0',
              background: 'transparent',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.2), rgba(217,70,239,0.15))',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              borderRadius: '24px',
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '16px',
                background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '36px', marginBottom: '20px',
              }}>
                📞
              </div>
              <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                استشارة هاتفية
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', lineHeight: '1.625' }}>
                تحدث مع طبيبك الآن من منزلك
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '20px', width: '100%' }}>
                <div style={{
                  width: '100%', borderRadius: '12px', padding: '10px 0',
                  textAlign: 'center', fontSize: '14px', fontWeight: 'bold',
                  color: 'white', background: 'rgba(147,51,234,0.8)',
                  border: '1px solid rgba(192,132,252,0.3)',
                }}>
                  احجز استشارتك
                </div>
              </div>
            </div>
          </button>

          {/* كشف العيادة */}
          <button
            type="button"
            onClick={() => handleBookingTypeSelect('clinic-visit')}
            style={{
              border: '2px solid rgba(96,165,250,0.3)',
              borderRadius: '24px', padding: '0',
              background: 'transparent', cursor: 'pointer',
              overflow: 'hidden', transition: 'all 0.2s',
            }}
          >
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(37,99,235,0.2), rgba(8,145,178,0.15))',
              backdropFilter: 'blur(16px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              height: '100%', borderRadius: '24px',
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '16px',
                background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '36px', marginBottom: '20px',
              }}>
                🩺
              </div>
              <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                كشف العيادة
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', lineHeight: '1.625' }}>
                احجز موعدك التقليدي في العيادة
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '20px', width: '100%' }}>
                <div style={{
                  width: '100%', borderRadius: '12px', padding: '10px 0',
                  textAlign: 'center', fontSize: '14px', fontWeight: 'bold',
                  color: 'white', background: 'rgba(37,99,235,0.8)',
                  border: '1px solid rgba(96,165,250,0.3)',
                }}>
                  احجز موعدك
                </div>
              </div>
            </div>
          </button>

          {/* كشف عاجل */}
          <button
            type="button"
            onClick={() => handleBookingTypeSelect('urgent-care')}
            style={{
              border: '2px solid rgba(251,191,36,0.4)',
              borderRadius: '24px', padding: '0',
              background: 'transparent', cursor: 'pointer',
              overflow: 'hidden', transition: 'all 0.2s',
            }}
          >
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #020617, #030712, #09090b)',
              backdropFilter: 'blur(16px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              height: '100%', borderRadius: '24px', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '-1px', left: '50%',
                transform: 'translateX(-50%)',
                borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px',
                padding: '4px 16px', fontSize: '12px', fontWeight: 'bold',
                color: 'white', background: 'linear-gradient(135deg, #f59e0b, #eab308)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}>
                الأكثر طلباً ⭐
              </div>
              <div style={{
                width: '80px', height: '80px', borderRadius: '16px',
                background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '36px', marginBottom: '20px',
              }}>
                ⚡
              </div>
              <h3 style={{ color: '#fde68a', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                كشف عاجل
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', lineHeight: '1.625' }}>
                الأكثر طلباً للحالات الطارئة
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '20px', width: '100%' }}>
                <div style={{
                  width: '100%', borderRadius: '12px', padding: '10px 0',
                  textAlign: 'center', fontSize: '14px', fontWeight: 'bold',
                  color: 'white',
                  background: 'linear-gradient(135deg, #f59e0b, #eab308)',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                }}>
                  احجز كشف عاجل
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="mb-8 border-t border-white/5" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Doctors Section */}
        <section className="lg:col-span-2">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-200/70">Doctor Directory</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              {activeTab === 'human'
                ? 'Select a specialist from the Hihya Care network.'
                : 'Al Rahma Pet Clinic — Veterinary Care in Hehya'}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              {activeTab === 'human'
                ? 'Choose a doctor, inspect the profile, then open the booking panel.'
                : 'Specialized veterinary clinic for cats and dogs — surgery & internal medicine.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'human' | 'veterinary')}
                className={`relative rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-slate-300 backdrop-blur-2xl">
              Loading doctors...
            </div>
          ) : notice ? (
            <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-500/10 p-6 text-sm text-emerald-100 backdrop-blur-2xl">
              {notice}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            {activeTab === 'human'
              ? humanDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))
              : vetDoctors.map((doctor) => (
                  <VeterinaryCard key={doctor.id} doctor={doctor} />
                ))}
          </div>
        </section>

        {/* AI Chat Widget Section */}
        <section className="lg:col-span-1 min-h-[500px] lg:h-[600px] sticky top-6 z-10">
          <AIChatWidget doctors={doctors} />
        </section>
      </div>
    </AppShell>
  )
}

function DoctorProfilePage({
  doctors,
  loading,
  notice,
}: {
  doctors: Map<string, Doctor>
  loading: boolean
  notice: string
}) {
  const navigate = useNavigate()
  const { doctorId } = useParams()
  const doctor = doctorId ? doctors.get(doctorId) : undefined

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl max-w-md">
          <h2 className="text-2xl font-semibold text-white">
            {loading ? 'Loading doctor profile...' : 'Doctor not found'}
          </h2>
          <p className="mt-3 text-slate-300">
            {loading
              ? 'Pulling the profile from Supabase.'
              : notice || 'The profile you requested does not exist.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 rounded-2xl border border-cyan-300/25 bg-cyan-400/15 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  if (doctor.category === 'veterinary') {
    return <VeterinaryProfilePage doctor={doctor} onGoBack={() => navigate('/')} />
  }

  const handleBooking = (_doctorId: string) => {
    navigate(`/book/${_doctorId}`)
  }

  return (
    <DoctorProfilePageNew
      doctor={doctor}
      onBooking={handleBooking}
      onGoBack={() => navigate('/')}
    />
  )
}

function VeterinaryPage({
  doctors,
  loading,
  notice,
}: {
  doctors: Map<string, Doctor>
  loading: boolean
  notice: string
}) {
  const navigate = useNavigate()
  const { clinicId } = useParams()
  const doctor = clinicId ? doctors.get(clinicId) : undefined

  if (!doctor || doctor.category !== 'veterinary') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl max-w-md">
          <h2 className="text-2xl font-semibold text-white">
            {loading ? 'Loading clinic...' : 'Clinic not found'}
          </h2>
          <p className="mt-3 text-slate-300">
            {loading ? 'Please wait...' : notice || 'The veterinary clinic you requested does not exist.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 rounded-2xl border border-emerald-300/25 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return <VeterinaryProfilePage doctor={doctor} onGoBack={() => navigate('/')} />
}

function BookingPage({
  doctors,
  loading,
  notice,
}: {
  doctors: Map<string, Doctor>
  loading: boolean
  notice: string
}) {
  const { doctorId } = useParams()
  const doctor = doctorId ? doctors.get(doctorId) : undefined
  const navigate = useNavigate()

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl max-w-md">
          <h2 className="text-2xl font-semibold text-white">
            {loading ? 'Loading doctor...' : 'Doctor not found'}
          </h2>
          <p className="mt-3 text-slate-300">
            {loading ? 'Please wait...' : notice || 'The doctor you requested does not exist.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 rounded-2xl border border-cyan-300/25 bg-cyan-400/15 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  function getActualDate(selectedDate: string): string {
    const d = new Date()
    if (selectedDate === 'tomorrow') d.setDate(d.getDate() + 1)
    else if (selectedDate === 'dayAfter') d.setDate(d.getDate() + 2)
    return d.toISOString().slice(0, 10)
  }

  function convertTo24h(time12: string): string {
    const [time, modifier] = time12.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    if (modifier === 'PM' && hours !== 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const handleBookingConfirm = async (bookingData: any, whatsappLink: string) => {
    try {
      const actualDate = getActualDate(bookingData.date)
      const actualTime = convertTo24h(bookingData.time)

      // Save to Supabase
      const { error } = await supabase.from('appointments').insert([
        {
          patient_name: bookingData.patientName,
          patient_phone: bookingData.phoneNumber,
          doctor_id: bookingData.doctorId,
          appointment_date: actualDate,
          appointment_time: actualTime,
          priority: bookingData.priority,
          payment_method: bookingData.paymentMethod,
          notes: bookingData.notes,
          total_price: bookingData.totalPrice,
          status: 'booked',
        },
      ])

      if (error && !/doctor_id|schema cache|column/i.test(error.message)) {
        console.error('Booking error:', error)
      }

      // Show success and redirect
      navigate('/booking-success', {
        state: {
          bookingData,
          whatsappLink,
        },
      })
    } catch (error) {
      console.error('Error saving booking:', error)
    }
  }

  return (
    <EnhancedBookingFlow
      doctor={doctor}
      onConfirm={handleBookingConfirm}
      onCancel={() => navigate(`/doctor/${doctor.id}`)}
    />
  )
}

export default App
