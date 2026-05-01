import { useEffect, useMemo, useState, type FormEvent } from 'react'
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

type BookingStatus = 'idle' | 'loading' | 'success' | 'error'

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

const whatsappNumber = import.meta.env.VITE_CLINIC_WHATSAPP_NUMBER?.trim() ?? ''

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
      <section className="animate-[fadeIn_0.6s_ease-out]">
        <div className="mb-10 max-w-3xl">
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

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor, index) => (
            <DoctorCard key={doctor.id} doctor={doctor} index={index} />
          ))}
        </div>
      </section>
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
      <AppShell>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
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
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-cyan-300/15 bg-white/5 p-6 backdrop-blur-2xl">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-200/70">Doctor Profile</p>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white">{doctor.name}</h1>
              <p className="mt-2 text-cyan-100/80">{doctor.specialty}</p>
            </div>
            <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
              Accepting Appointments
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <InfoPanel label="Experience" value={doctor.experience || doctor.bio || 'Seasoned clinical specialist'} />
            <InfoPanel label="Clinic Location" value={doctor.clinicLocation || 'Hihya Care main wing'} />
            <InfoPanel label="Price" value={doctor.price} />
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-sm leading-6 text-slate-300">
              This is a premium intake profile with the same visual language as the booking flow. Press Book Now to open the live Supabase form for this doctor.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/book/${doctor.id}`)}
              className="rounded-2xl border border-cyan-300/25 bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
            >
              Book Now
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              Back to Doctors
            </button>
          </div>
        </section>

        <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <p className="text-xs uppercase tracking-[0.45em] text-slate-400">Profile Signal</p>
          <div className="mt-4 rounded-[1.5rem] border border-cyan-300/15 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-300">Specialty</p>
            <p className="mt-1 text-2xl font-semibold text-white">{doctor.specialty}</p>
            <p className="mt-6 text-sm text-slate-300">Location</p>
            <p className="mt-1 text-lg text-cyan-100">{doctor.clinicLocation || 'Hihya Care main wing'}</p>
            <p className="mt-6 text-sm text-slate-300">Consultation Fee</p>
            <p className="mt-1 text-lg text-emerald-100">{doctor.price}</p>
          </div>
        </aside>
      </div>
    </AppShell>
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
  const [patientName, setPatientName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [status, setStatus] = useState<BookingStatus>('idle')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (status !== 'success') {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setStatus('idle')
      setFeedback('')
    }, 4500)

    return () => window.clearTimeout(timer)
  }, [status])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!doctorId || !doctor) {
      setStatus('error')
      setFeedback('Doctor data is still loading. Please try again in a moment.')
      return
    }

    const trimmedName = patientName.trim()
    const trimmedPhone = phoneNumber.trim()

    if (!trimmedName || !trimmedPhone) {
      setStatus('error')
      setFeedback('Please enter both patient name and phone number.')
      return
    }

    try {
      setStatus('loading')
      setFeedback('Securing appointment...')

      const bookingPayload = [
        {
          patient_name: trimmedName,
          phone: trimmedPhone,
          doctor_id: doctorId,
        },
      ]

      const primaryInsert = await supabase.from('appointments').insert(bookingPayload)

      if (primaryInsert.error) {
        const fallbackNeeded = /doctor_id|schema cache|column/i.test(primaryInsert.error.message)

        if (!fallbackNeeded) {
          throw primaryInsert.error
        }

        const fallbackInsert = await supabase.from('appointments').insert([
          {
            patient_name: trimmedName,
            phone: trimmedPhone,
          },
        ])

        if (fallbackInsert.error) {
          throw fallbackInsert.error
        }

        setFeedback('Booking saved. Doctor linkage is pending database migration.')
      } else {
        setFeedback('Booking confirmed and stored in the appointment ledger.')
      }

      setPatientName('')
      setPhoneNumber('')
      setStatus('success')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Booking failed. Please try again in a moment.'

      setStatus('error')
      setFeedback(message)
    }
  }

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const whatsappLink = doctor
    ? `https://wa.me/${whatsappNumber || ''}?text=${encodeURIComponent(
        `Hello Hihya Care, I just booked an appointment with ${doctor.name} via the platform.`,
      )}`
    : '#'

  return (
    <AppShell>
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-200/70">Booking Portal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
            {doctor ? `Book ${doctor.name}` : 'Book Appointment'}
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            The same Supabase-backed intake form, now wrapped in a routed cinematic appointment experience.
          </p>
          {loading ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Loading doctor details...
            </div>
          ) : notice ? (
            <div className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              {notice}
            </div>
          ) : null}
          {doctor ? (
            <div className="mt-6 rounded-3xl border border-cyan-300/15 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">Selected Doctor</p>
              <p className="mt-1 text-2xl font-semibold text-white">{doctor.name}</p>
              <p className="mt-2 text-cyan-100/80">{doctor.specialty}</p>
              <p className="mt-4 text-sm text-slate-300">{doctor.clinicLocation}</p>
              <p className="mt-2 text-sm text-slate-300">{doctor.bio || 'Premium clinical care with a cinematic booking experience.'}</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => navigate(doctor ? `/doctor/${doctor.id}` : '/')}
            className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Back to Profile
          </button>
        </div>

        <div className="rounded-[2rem] border border-cyan-300/20 bg-white/5 p-4 shadow-[0_0_120px_rgba(34,211,238,0.12)] backdrop-blur-2xl sm:p-6">
          <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Hihya Care</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  Secure the booking.
                </h2>
              </div>
              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-200">
                Live Intake
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Latency', value: '< 1s', tone: 'text-cyan-200' },
                { label: 'Mode', value: 'Encrypted', tone: 'text-emerald-200' },
                { label: 'Storage', value: 'Supabase', tone: 'text-sky-200' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">{item.label}</p>
                  <p className={`mt-2 text-lg font-semibold ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Patient Name</span>
                <div className="group rounded-2xl border border-cyan-300/15 bg-slate-950/70 px-4 py-3 transition-all duration-300 focus-within:border-cyan-300/60 focus-within:shadow-[0_0_0_1px_rgba(103,232,249,0.2),0_0_35px_rgba(34,211,238,0.16)]">
                  <input
                    className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                    value={patientName}
                    onChange={(event) => setPatientName(event.target.value)}
                    placeholder="Enter patient full name"
                    autoComplete="name"
                    spellCheck={false}
                    disabled={isLoading}
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Phone Number</span>
                <div className="group rounded-2xl border border-cyan-300/15 bg-slate-950/70 px-4 py-3 transition-all duration-300 focus-within:border-cyan-300/60 focus-within:shadow-[0_0_0_1px_rgba(103,232,249,0.2),0_0_35px_rgba(34,211,238,0.16)]">
                  <input
                    className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder="Enter contact number"
                    autoComplete="tel"
                    inputMode="tel"
                    disabled={isLoading}
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-cyan-300/25 bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 px-5 py-4 text-sm font-semibold text-slate-950 shadow-[0_10px_40px_rgba(34,211,238,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_60px_rgba(34,211,238,0.36)] focus:outline-none focus:ring-2 focus:ring-cyan-200/70 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.45),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/25 border-t-slate-950" />
                    Finalizing Booking
                  </>
                ) : (
                  <>
                    <span>Confirm Booking</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                  </>
                )}
              </button>
            </form>

            <div
              className={`mt-6 overflow-hidden rounded-2xl border px-4 py-4 transition-all duration-500 ${
                isSuccess
                  ? 'border-emerald-300/40 bg-emerald-400/10 shadow-[0_0_30px_rgba(16,185,129,0.18)]'
                  : status === 'error'
                    ? 'border-rose-300/30 bg-rose-500/10'
                    : 'border-white/10 bg-white/5'
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                    isSuccess
                      ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-200'
                      : status === 'error'
                        ? 'border-rose-300/30 bg-rose-500/15 text-rose-200'
                        : 'border-cyan-300/20 bg-cyan-400/10 text-cyan-100'
                  }`}
                >
                  {isSuccess ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path d="M20 7L10.5 16.5L4 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : status === 'error' ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path d="M12 9V13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                      <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-current" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">
                    {isSuccess
                      ? 'Appointment secured'
                      : status === 'error'
                        ? 'Submission needs attention'
                        : 'Ready for a new booking'}
                  </p>
                  {isSuccess ? (
                    <div className="mt-2 space-y-3">
                      <p className="text-sm leading-6 text-slate-300">
                        {feedback || 'Booking confirmed.'}
                      </p>
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
                      >
                        Chat with Clinic on WhatsApp
                      </a>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {feedback || 'Enter the patient details, then confirm the booking.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  )
}

function InfoPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-100">{value}</p>
    </div>
  )
}

export default App
