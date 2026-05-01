import { motion } from 'framer-motion'

const stats = [
  { label: 'Active Patients', value: '128', delta: '+18%' },
  { label: 'Bookings Today', value: '42', delta: '+9%' },
  { label: 'Follow-ups', value: '17', delta: '+6%' },
  { label: 'Revenue', value: '$24.8k', delta: '+12%' },
]

const projects = [
  {
    title: 'Hihya Care Patient Flow',
    category: 'Medical Platform',
    description:
      'A premium routing layer for appointments, doctor profiles, WhatsApp handoff, and private dashboards.',
    accent: 'from-blue-500 via-indigo-500 to-cyan-400',
  },
  {
    title: 'Clinical Analytics',
    category: 'Performance',
    description:
      'High-signal reporting cards that keep appointment volume, waiting lists, and conversion visible at a glance.',
    accent: 'from-indigo-500 via-sky-500 to-blue-400',
  },
  {
    title: 'Doctor Portfolio',
    category: 'Brand Experience',
    description:
      'A cinematic showcase for doctor identity, trust signals, and booking actions with glassmorphism depth.',
    accent: 'from-cyan-500 via-blue-500 to-indigo-500',
  },
]

const activity = [
  { time: '08:30', text: '3 new appointment requests assigned to Cardiology.' },
  { time: '10:00', text: 'Dashboard visibility improved with role-specific cards.' },
  { time: '12:45', text: 'WhatsApp follow-up sent for the neurology queue.' },
  { time: '15:10', text: 'Portfolio hero refreshed with motion and glass depth.' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function DashboardPortfolio() {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-[#F8FAFC] px-4 py-6 text-slate-900 antialiased sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <motion.aside
          variants={itemVariants}
          className="relative overflow-hidden rounded-[28px] border border-white/40 bg-white/60 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08),0_2px_10px_rgba(37,99,235,0.06)] backdrop-blur-xl"
        >
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-500/10 to-transparent" />
          <div className="relative flex h-full flex-col justify-between gap-6">
            <div>
              <div className="inline-flex rounded-full border border-white/50 bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-600 backdrop-blur-md">
                Hihya Care
              </div>
              <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-slate-900">Medical Dashboard</h1>
              <p className="mt-3 max-w-xs text-sm leading-7 text-slate-600">
                A glassmorphism-first portfolio shell for modern clinical teams, operators, and doctors.
              </p>
            </div>

            <div className="space-y-3">
              {[
                'Overview',
                'Appointments',
                'Portfolio',
                'Analytics',
                'Settings',
              ].map(label => (
                <button
                  key={label}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-white/40 bg-white/40 px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.04)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-[0_16px_30px_rgba(37,99,235,0.12)]"
                >
                  <span>{label}</span>
                  <span className="h-2 w-2 rounded-full bg-blue-500/70" />
                </button>
              ))}
            </div>

            <div className="rounded-[24px] border border-white/40 bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-cyan-500/15 p-4 shadow-[0_16px_30px_rgba(37,99,235,0.12)] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live Status</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">High availability</p>
              <p className="mt-1 text-sm leading-7 text-slate-600">Fast routing, low visual noise, and responsive glass surfaces.</p>
            </div>
          </div>
        </motion.aside>

        <div className="space-y-6">
          <motion.header
            variants={itemVariants}
            className="rounded-[32px] border border-white/40 bg-white/60 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08),0_2px_14px_rgba(79,70,229,0.08)] backdrop-blur-xl"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.45em] text-blue-600">Cairo + Framer Motion</p>
                <h2 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-slate-900 sm:text-5xl">
                  Portfolio dashboard with depth and speed
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Built for bilingual medical products, this layout balances clinical clarity with a premium glass interface.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto lg:grid-cols-2">
                {stats.map(stat => (
                  <div
                    key={stat.label}
                    className="rounded-[22px] border border-white/40 bg-white/55 px-4 py-4 backdrop-blur-md transition duration-300 hover:bg-white/70 hover:shadow-[0_14px_28px_rgba(37,99,235,0.12)]"
                  >
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-sm font-medium text-blue-600">{stat.delta}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.header>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <motion.section variants={containerVariants} className="grid gap-5 md:grid-cols-3 xl:grid-cols-1">
              {projects.map(project => (
                <motion.article
                  key={project.title}
                  variants={itemVariants}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group rounded-[28px] border border-white/40 bg-white/60 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-300 hover:border-white/60 hover:shadow-[0_18px_60px_rgba(37,99,235,0.18),0_0_30px_rgba(96,165,250,0.16)]"
                >
                  <div className={`h-2 w-24 rounded-full bg-gradient-to-r ${project.accent}`} />
                  <p className="mt-4 text-xs uppercase tracking-[0.35em] text-slate-500">{project.category}</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                    {project.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{project.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {['Motion', 'Glass', 'Responsive'].map(tag => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/40 bg-white/45 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.article>
              ))}
            </motion.section>

            <div className="space-y-6">
              <motion.section
                variants={itemVariants}
                className="rounded-[28px] border border-white/40 bg-white/60 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Activity</p>
                <div className="mt-5 space-y-4">
                  {activity.map(entry => (
                    <div
                      key={entry.time}
                      className="rounded-2xl border border-white/40 bg-white/45 p-4 backdrop-blur-md transition duration-300 hover:bg-white/65 hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">{entry.time}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{entry.text}</p>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section
                variants={itemVariants}
                className="rounded-[28px] border border-white/40 bg-gradient-to-br from-white/70 to-white/45 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Performance</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  Fast, accessible, and visually calm
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  The layout uses subtle motion, thin borders, and layered shadows so the interface feels premium without becoming noisy.
                </p>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200/70">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400"
                    initial={{ width: '0%' }}
                    animate={{ width: '84%' }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                  />
                </div>
              </motion.section>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
