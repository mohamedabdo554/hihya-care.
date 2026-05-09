import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, HeartPulse, Menu, X, LogOut } from 'lucide-react'
import { supabase } from '../supabaseClient'
import LuxuryHeader from './LuxuryHeader'

const NAV_ITEMS = [
  { path: '/ai-triage', label: 'المساعد الطبي الذكي', icon: Brain },
  { path: '/dashboard', label: 'مركز التحكم', icon: HeartPulse },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
} as const

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
} as const

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-100" dir="rtl">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(2,6,23,1))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute right-10 top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      {/* Mobile Sidebar Toggle */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-white/10 bg-white/10 p-2 backdrop-blur-2xl lg:hidden"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-40 w-64 border-l border-white/10 bg-[#0a0f2a]/90 backdrop-blur-2xl transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-full flex-col p-5">
          {/* Brand */}
          <div className="mb-8 flex items-center gap-3 border-b border-white/10 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-sm font-bold text-slate-900">H</div>
            <div>
              <p className="text-sm font-semibold text-white">Hihya Care</p>
              <p className="text-xs text-slate-400">المنصة الطبية</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-500">التنقل</p>
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <motion.div key={item.path} variants={itemVariants}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-400/20'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </nav>

          {/* Sign Out */}
          <div className="border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="relative flex-1 overflow-x-hidden">
        <LuxuryHeader />
        <div className="pt-20">
          {children}
        </div>
      </main>
    </div>
  )
}
