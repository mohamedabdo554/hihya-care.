import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { supabase } from './supabaseClient.js'
import DoctorCard, { type Doctor } from './DoctorCard'
import DoctorProfilePageNew from './components/DoctorProfilePageNew.jsx'
import EnhancedBookingFlow from './components/EnhancedBookingFlow.jsx'
import AIChatWidget from './components/AIChatWidget.jsx'

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
  },
]

type DoctorRow = {
  id: number | string
  name: string
  specialty: string
  image_url: string | null
  price: string | number | null
  bio: string | null
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
        .select('id, name, specialty, image_url, price, bio')
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

          return {
            id: String(doctor.id),
            name: doctor.name,
            specialty: doctor.specialty,
            image_url: doctor.image_url,
            price: doctor.price ? String(doctor.price) : 'Consultation on request',
            bio: doctor.bio,
            experience: doctor.bio || `Seasoned ${doctor.specialty.toLowerCase()} specialist`,
            clinicLocation: `Hihya Care ${specialtyKey} wing`,
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
    <BrowserRouter>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(2,6,23,1))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
      <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-10 top-24 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-3xl border border-cyan-300/15 bg-white/5 px-5 py-4 backdrop-blur-xl">
          <Link to="/" className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-100">
            Hihya Care
          </Link>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-300">
            Tech-noir Clinic Network
          </div>
        </header>
        {children}
      </div>
    </main>
  )
}

function HomePage({
  doctors,
  loading,
  notice,
}: {
  doctors: Doctor[]
  loading: boolean
  notice: string
}) {
  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctors Section */}
        <section className="lg:col-span-2">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-200/70">Doctor Directory</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              Select a specialist from the Hihya Care network.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              A cinematic intake surface for a modern clinic booking flow. Choose a doctor, inspect the profile, then open the booking panel.
            </p>
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
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </section>

        {/* AI Chat Widget Section */}
        <section className="lg:col-span-1 min-h-[500px] lg:h-[600px] sticky top-6 z-10">
          <AIChatWidget />
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

  const handleBookingConfirm = async (bookingData: any, whatsappLink: string) => {
    try {
      // Save to Supabase
      const { error } = await supabase.from('appointments').insert([
        {
          patient_name: bookingData.patientName,
          phone: bookingData.phoneNumber,
          doctor_id: bookingData.doctorId,
          scheduled_date: bookingData.date,
          scheduled_time: bookingData.time,
          priority: bookingData.priority,
          payment_method: bookingData.paymentMethod,
          notes: bookingData.notes,
          total_price: bookingData.totalPrice,
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
