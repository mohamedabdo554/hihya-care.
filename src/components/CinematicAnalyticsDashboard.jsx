import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  Users,
  Clock,
  Star,
  Activity,
  DollarSign,
  PhoneOff,
  Pill,
} from 'lucide-react'

// ============================================================================
// REALISTIC EGYPTIAN CLINIC DATA FOR DR. MOHAMED AL-AFANDI
// ============================================================================

const dailyPatientMetrics = {
  today: 42,
  monthly: 1250,
  previousMonthGrowth: 12,
}

const noShowRate = 15

const doctorPerformance = {
  name: 'Dr. Mohamed Al-Afandi',
  specialty: 'General Surgery & Urology',
  avgConsultationTime: 18,
  patientRating: 4.9,
  totalSurgeries: 1840,
  topDiagnoses: ['Kidney Stones', 'Varicocele', 'BPH'],
}

const financialData = [
  { name: 'Cash Payment', value: 60 },
  { name: 'Electronic/Insurance', value: 40 },
]

const peakHoursData = [
  { time: '08 AM', patients: 4, label: '08' },
  { time: '10 AM', patients: 8, label: '10' },
  { time: '12 PM', patients: 12, label: '12' },
  { time: '02 PM', patients: 10, label: '14' },
  { time: '04 PM', patients: 18, label: '16' },
  { time: '06 PM', patients: 24, label: '18' },
  { time: '08 PM', patients: 22, label: '20' },
  { time: '10 PM', patients: 8, label: '22' },
]

const topConditions = [
  { name: 'Kidney Stones', cases: 124 },
  { name: 'Varicocele', cases: 98 },
  { name: 'BPH', cases: 76 },
  { name: 'Prostate Issues', cases: 64 },
  { name: 'Urinary Infections', cases: 52 },
  { name: 'Hernias', cases: 48 },
]

const weeklyHeatmap = [
  { day: 'Mon', week1: 8, week2: 12, week3: 10, week4: 14 },
  { day: 'Tue', week1: 6, week2: 9, week3: 8, week4: 10 },
  { day: 'Wed', week1: 5, week2: 7, week3: 6, week4: 8 },
  { day: 'Thu', week1: 9, week2: 13, week3: 11, week4: 15 },
  { day: 'Fri', week1: 4, week2: 5, week3: 4, week4: 6 },
  { day: 'Sat', week1: 7, week2: 10, week3: 9, week4: 11 },
  { day: 'Sun', week1: 3, week2: 4, week3: 2, week4: 3 },
]

const revenueData = [
  { month: 'Jan', revenue: 18000 },
  { month: 'Feb', revenue: 21000 },
  { month: 'Mar', revenue: 24000 },
  { month: 'Apr', revenue: 28000 },
  { month: 'May', revenue: 32000 },
  { month: 'Jun', revenue: 35000 },
]

// ============================================================================
// FRAMER MOTION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const glowVariants = {
  initial: { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(239, 68, 68, 0.7)',
      '0 0 0 12px rgba(239, 68, 68, 0)',
    ],
  },
}

// ============================================================================
// COMPONENT DEFINITIONS
// ============================================================================

function MetricCard({ icon: Icon, label, value, trend, isAlert = false }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-[1.5rem] border backdrop-blur-2xl p-5 transition duration-300 ${
        isAlert
          ? 'border-red-400/40 bg-gradient-to-br from-red-500/15 via-red-500/10 to-transparent shadow-[0_0_30px_rgba(239,68,68,0.2)]'
          : 'border-cyan-300/30 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-transparent shadow-[0_8px_24px_rgba(34,211,238,0.12)]'
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/10 to-transparent" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className={`text-xs uppercase tracking-[0.35em] ${isAlert ? 'text-red-300/70' : 'text-cyan-200/70'}`}>
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-[-0.04em] text-white">{value}</p>
          {trend && (
            <p className={`mt-2 text-sm font-medium ${trend.includes('+') ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend}
            </p>
          )}
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            isAlert
              ? 'bg-red-500/20 text-red-300'
              : 'bg-cyan-400/20 text-cyan-300'
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {isAlert && (
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-[1.5rem]"
        />
      )}
    </motion.div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="overflow-hidden rounded-[1.5rem] border border-cyan-300/30 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-transparent shadow-[0_8px_24px_rgba(34,211,238,0.12)] backdrop-blur-2xl p-6"
    >
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">{title}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{subtitle}</h3>
      </div>
      <div className="h-80">{children}</div>
    </motion.div>
  )
}

function HeatmapCell({ value, max = 16 }) {
  const intensity = value / max
  const bgColor =
    intensity < 0.33
      ? 'bg-emerald-500/20 border-emerald-400/30'
      : intensity < 0.66
        ? 'bg-cyan-500/30 border-cyan-400/40'
        : 'bg-purple-600/40 border-purple-400/50'

  return (
    <div className={`rounded-lg border p-2 text-center transition ${bgColor}`}>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CinematicAnalyticsDashboard({ theme = 'dark' }) {
  const isDark = theme === 'dark'

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`min-h-screen px-4 py-8 antialiased sm:px-6 lg:px-8 ${
        isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-12 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-12 top-32 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <motion.header variants={itemVariants} className="mb-10">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-300/70">
            Medical Command Center
          </p>
          <h1 className="mt-3 text-5xl font-bold tracking-[-0.05em] text-white sm:text-6xl">
            Clinical Intelligence Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Real-time analytics for Dr. Mohamed Al-Afandi's surgical practice. High-performance insights designed
            for clinical decision-making and operational excellence.
          </p>
        </motion.header>

        {/* PRIMARY METRICS ROW */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <MetricCard
            icon={Users}
            label="Today's Patients"
            value={`${dailyPatientMetrics.today}`}
            trend="+18% vs yesterday"
          />
          <MetricCard
            icon={TrendingUp}
            label="Monthly Volume"
            value={`${dailyPatientMetrics.monthly}`}
            trend={`+${dailyPatientMetrics.previousMonthGrowth}% growth`}
          />
          <MetricCard
            icon={AlertTriangle}
            label="No-Show Rate"
            value={`${noShowRate}%`}
            trend="Critical Issue"
            isAlert
          />
          <MetricCard
            icon={DollarSign}
            label="Monthly Revenue"
            value="$35,000"
            trend="+22% vs Mar"
          />
        </motion.div>

        {/* DOCTOR PERFORMANCE SECTION */}
        <motion.div variants={itemVariants} className="rounded-[2rem] border border-cyan-300/30 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-transparent shadow-[0_8px_24px_rgba(34,211,238,0.12)] backdrop-blur-2xl p-8">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Doctor Profile</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-white">
                {doctorPerformance.name}
              </h2>
              <p className="mt-2 text-lg text-cyan-200">{doctorPerformance.specialty}</p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-cyan-300" />
                    <span className="text-sm text-slate-300">Avg Consultation Time</span>
                  </div>
                  <span className="text-xl font-semibold text-white">{doctorPerformance.avgConsultationTime} min</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="text-sm text-slate-300">Patient Rating</span>
                  </div>
                  <span className="text-xl font-semibold text-white">{doctorPerformance.patientRating}/5.0</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm text-slate-300">Surgeries Completed</span>
                  </div>
                  <span className="text-xl font-semibold text-white">{doctorPerformance.totalSurgeries.toLocaleString()}+</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Top Diagnoses</p>
              <div className="mt-5 space-y-3">
                {doctorPerformance.topDiagnoses.map((diagnosis, index) => (
                  <motion.div
                    key={diagnosis}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 rounded-xl border border-purple-300/20 bg-purple-500/10 p-4"
                  >
                    <Pill className="h-5 w-5 text-purple-400" />
                    <span className="text-sm font-medium text-slate-200">{diagnosis}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CHARTS GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Peak Hours Chart */}
          <ChartCard title="Clinic Hours" subtitle="Patient Traffic by Hour">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="label" stroke="rgba(148,163,184,0.6)" tick={{ fontSize: 12 }} />
                <YAxis stroke="rgba(148,163,184,0.6)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(34,211,238,0.3)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#06b6d4' }}
                />
                <Bar dataKey="patients" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Payment Methods */}
          <ChartCard title="Financial" subtitle="Payment Methods Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="pieGrad1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                  <linearGradient id="pieGrad2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <Pie
                  data={financialData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={4}
                >
                  <Cell fill="url(#pieGrad1)" />
                  <Cell fill="url(#pieGrad2)" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(34,211,238,0.3)',
                    borderRadius: '8px',
                  }}
                  formatter={value => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        {/* TOP CONDITIONS */}
        <motion.div
          variants={itemVariants}
          className="rounded-[1.5rem] border border-cyan-300/30 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-transparent shadow-[0_8px_24px_rgba(34,211,238,0.12)] backdrop-blur-2xl p-6"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Medical Data</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Top 6 Treated Conditions</h3>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topConditions} layout="vertical" margin={{ top: 10, right: 30, left: 180, bottom: 10 }}>
                <defs>
                  <linearGradient id="conditionGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis type="number" stroke="rgba(148,163,184,0.6)" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" stroke="rgba(148,163,184,0.6)" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(34,211,238,0.3)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#06b6d4' }}
                />
                <Bar dataKey="cases" fill="url(#conditionGrad)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* WEEKLY HEATMAP */}
        <motion.div
          variants={itemVariants}
          className="rounded-[1.5rem] border border-cyan-300/30 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-transparent shadow-[0_8px_24px_rgba(34,211,238,0.12)] backdrop-blur-2xl p-6"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Scheduling</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Weekly Crowdedness Pattern</h3>

          <div className="mt-6 overflow-x-auto">
            <div className="space-y-3">
              {weeklyHeatmap.map((row, index) => (
                <motion.div
                  key={row.day}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-16 font-semibold text-slate-200">{row.day}</div>
                  <div className="flex gap-2">
                    {[row.week1, row.week2, row.week3, row.week4].map((val, idx) => (
                      <HeatmapCell key={idx} value={val} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* REVENUE TREND */}
        <motion.div
          variants={itemVariants}
          className="rounded-[1.5rem] border border-cyan-300/30 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-transparent shadow-[0_8px_24px_rgba(34,211,238,0.12)] backdrop-blur-2xl p-6"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Financial Trend</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">6-Month Revenue Projection</h3>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="month" stroke="rgba(148,163,184,0.6)" tick={{ fontSize: 12 }} />
                <YAxis stroke="rgba(148,163,184,0.6)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    border: '1px solid rgba(34,211,238,0.3)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#06b6d4' }}
                  formatter={value => `$${value.toLocaleString()}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#revenueGrad)"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
