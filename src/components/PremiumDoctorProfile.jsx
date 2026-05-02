import { motion } from 'framer-motion'
import {
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const doctorProfile = {
  name: 'Dr. Mohamed Al-Afandi',
  title: 'Senior Consultant',
  specialty: 'Consultant of General Surgery & Urology',
  yearsOfExperience: 20,
  surgeriesCompleted: '1,840+',
  responseTime: 'Under 15 min',
  patientSatisfaction: '99.2%',
  languages: ['Arabic', 'English'],
  location: 'Hihya-Care Surgical Command Center',
  availability: 'Available for priority booking',
  phone: '+20 100 220 4488',
  email: 'm.alafandi@hihyacare.com',
  bio:
    'A precision-first surgical leader focused on minimally invasive procedures, urology care, and premium patient recovery coordination across the Hihya-Care network.',
}

const liveVitals = [
  { label: 'Mon', recovery: 86, success: 97 },
  { label: 'Tue', recovery: 88, success: 97 },
  { label: 'Wed', recovery: 91, success: 98 },
  { label: 'Thu', recovery: 93, success: 98 },
  { label: 'Fri', recovery: 95, success: 99 },
  { label: 'Sat', recovery: 97, success: 98 },
  { label: 'Sun', recovery: 98, success: 98 },
]

const surgerySuccessData = [
  { name: 'Successful surgeries', value: 98 },
  { name: 'Exceptional cases', value: 2 },
]

const commandStats = [
  {
    label: 'Surgical Accuracy',
    value: '98%',
    detail: 'Live success score from the latest operative cycle.',
    accent: 'from-cyan-400/30 via-sky-400/20 to-transparent',
  },
  {
    label: 'Patient Recovery',
    value: 'Fast-track',
    detail: 'Post-op recovery trend remains consistently above baseline.',
    accent: 'from-emerald-400/25 via-cyan-400/15 to-transparent',
  },
  {
    label: 'Seniority',
    value: '20 Years',
    detail: 'Deep procedural expertise across general surgery and urology.',
    accent: 'from-amber-300/25 via-yellow-400/15 to-transparent',
  },
]

const operatingSignals = [
  { label: 'Ward Load', value: 'Stable' },
  { label: 'Procedure Queue', value: 'Priority' },
  { label: 'Recovery Tracking', value: 'Active' },
  { label: 'Response Window', value: '15 min' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
}

function vitalsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/95 px-4 py-3 text-xs text-slate-100 shadow-[0_18px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-200/70">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map(entry => (
          <p key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm text-slate-200">
            <span>{entry.name}</span>
            <span className="font-semibold text-cyan-100">{entry.value}%</span>
          </p>
        ))}
      </div>
    </div>
  )
}

function statRingColor(value) {
  if (value >= 98) {
    return '#22d3ee'
  }

  if (value >= 92) {
    return '#10b981'
  }

  return '#f59e0b'
}

function BookAction({ onBookAppointment }) {
  return (
    <motion.button
      type="button"
      onClick={onBookAppointment}
      whileHover={{
        scale: 1.015,
        boxShadow: '0 0 0 1px rgba(34,211,238,0.30), 0 0 28px rgba(34,211,238,0.25), 0 0 48px rgba(16,185,129,0.15)',
      }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-cyan-300/20 bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 px-6 py-4 text-sm font-semibold text-slate-950 shadow-[0_12px_40px_rgba(34,211,238,0.24)] focus:outline-none focus:ring-2 focus:ring-cyan-200/70 focus:ring-offset-2 focus:ring-offset-slate-950"
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_45%)] opacity-70 transition duration-300 group-hover:opacity-100" />
      <span className="relative flex items-center gap-2">
        Book Appointment
        <span className="text-base transition-transform duration-300 group-hover:translate-x-0.5">→</span>
      </span>
    </motion.button>
  )
}

function MetricCard({ label, value, detail, accent }) {
  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${accent}`} />
      <div className="relative">
        <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{value}</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
      </div>
    </div>
  )
}

function SignalPill({ label, value }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-xl">
      <span className="text-slate-400">{label}:</span> <span className="font-medium text-white">{value}</span>
    </div>
  )
}

export default function PremiumDoctorProfile({
  doctor = doctorProfile,
  onBookAppointment = () => {},
  className = '',
}) {
  const profile = {
    ...doctorProfile,
    ...doctor,
    languages: doctor?.languages?.length ? doctor.languages : doctorProfile.languages,
  }

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`relative min-h-screen overflow-hidden bg-[#020617] px-4 py-6 text-slate-100 antialiased sm:px-6 lg:px-8 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.12),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),_transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
      <div className="absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="absolute right-8 top-24 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6">
        <motion.header
          variants={itemVariants}
          className="rounded-[2rem] border border-white/10 bg-white/6 px-5 py-4 shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-3xl sm:px-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.6rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-400/25 via-slate-900 to-emerald-400/20 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold tracking-[0.18em] text-cyan-100">
                  MA
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-cyan-200/70">Hihya-Care Medical Command Center</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  {profile.name}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {profile.title} • {profile.location}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-amber-300/30 bg-gradient-to-r from-amber-400/20 via-yellow-300/20 to-amber-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-amber-200 shadow-[0_0_24px_rgba(245,158,11,0.18)]">
                Senior Consultant
              </span>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
                {profile.availability}
              </span>
            </div>
          </div>
        </motion.header>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.section
            variants={itemVariants}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.38)] backdrop-blur-3xl sm:p-8"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-cyan-300/40 via-emerald-400/20 to-transparent" />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.45em] text-cyan-200/70">Premium Doctor Profile</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                  Futuristic surgical leadership with clinical precision.
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
                  {profile.bio}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-xl">
                    {profile.yearsOfExperience}+ years of expertise
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-xl">
                    {profile.surgeriesCompleted} surgeries completed
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-xl">
                    {profile.patientSatisfaction} patient satisfaction
                  </div>
                </div>
              </div>

              <div className="min-w-[220px] rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-800/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Contact</p>
                <div className="mt-4 space-y-3 text-sm text-slate-200">
                  <SignalPill label="Phone" value={profile.phone} />
                  <SignalPill label="Email" value={profile.email} />
                  <SignalPill label="Languages" value={profile.languages.join(' / ')} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {commandStats.map(stat => (
                <motion.div key={stat.label} variants={itemVariants} whileHover={{ y: -4 }} className="h-full">
                  <MetricCard
                    label={stat.label}
                    value={stat.value}
                    detail={stat.detail}
                    accent={stat.accent}
                  />
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Specialty</p>
                  <div className="mt-3 inline-flex max-w-full rounded-[1.35rem] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(8,145,178,0.12),rgba(2,6,23,0.86))] p-[1px] shadow-[0_0_0_1px_rgba(34,211,238,0.06),0_0_26px_rgba(34,211,238,0.14)]">
                    <motion.div
                      className="rounded-[1.3rem] border border-white/5 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-cyan-100 backdrop-blur-xl sm:px-5"
                      animate={{
                        boxShadow: [
                          '0 0 0 1px rgba(34,211,238,0.18), 0 0 14px rgba(34,211,238,0.10)',
                          '0 0 0 1px rgba(245,158,11,0.18), 0 0 18px rgba(245,158,11,0.12)',
                          '0 0 0 1px rgba(16,185,129,0.18), 0 0 14px rgba(16,185,129,0.10)',
                          '0 0 0 1px rgba(34,211,238,0.18), 0 0 14px rgba(34,211,238,0.10)',
                        ],
                      }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {profile.specialty}
                    </motion.div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                  {operatingSignals.map(signal => (
                    <div key={signal.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                      <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">{signal.label}</p>
                      <p className="mt-2 text-sm font-semibold text-white">{signal.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <BookAction onBookAppointment={onBookAppointment} />
              <p className="max-w-xl text-sm leading-7 text-slate-400">
                Designed for high-trust medical workflows inside the Hihya-Care SaaS platform with fast booking access and a cinematic, command-center feel.
              </p>
            </div>
          </motion.section>

          <motion.aside
            variants={itemVariants}
            className="space-y-6 rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.38)] backdrop-blur-3xl sm:p-6"
          >
            <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Live Vitals</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Surgery success metrics</h3>
                </div>
                <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100">
                  98% success
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-medium text-slate-200">Surgery Success</p>
                  <div className="relative mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={surgerySuccessData}
                          innerRadius={66}
                          outerRadius={92}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {surgerySuccessData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={index === 0 ? statRingColor(entry.value) : 'rgba(255,255,255,0.08)'}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={vitalsTooltip} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
                      <div>
                        <p className="text-4xl font-semibold tracking-[-0.05em] text-white">98%</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.35em] text-cyan-200/70">Stable</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-medium text-slate-200">Patient Recovery Trend</p>
                  <div className="mt-4 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={liveVitals} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="recoveryLine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                        <YAxis domain={[80, 100]} tickLine={false} axisLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                        <Tooltip content={vitalsTooltip} />
                        <Line
                          type="monotone"
                          dataKey="recovery"
                          name="Recovery"
                          stroke="url(#recoveryLine)"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#22d3ee', stroke: '#0f172a', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="success"
                          name="Success"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="5 4"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Seniority</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-semibold tracking-[-0.04em] text-white">{profile.yearsOfExperience}</p>
                    <p className="mt-1 text-sm text-slate-400">years leading surgery programs</p>
                  </div>
                  <div className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-100">
                    Senior Consultant
                  </div>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Vitals Summary</p>
                <div className="mt-3 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-4">
                    <span>Response Time</span>
                    <span className="font-semibold text-white">{profile.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Recovery Score</span>
                    <span className="font-semibold text-white">98/100</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Booking Status</span>
                    <span className="font-semibold text-cyan-200">Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </motion.section>
  )
}
