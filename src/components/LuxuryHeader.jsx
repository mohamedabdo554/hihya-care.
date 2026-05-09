import { Link, useLocation } from 'react-router-dom'
import { Brain, HeartPulse, Menu, X, Stethoscope } from 'lucide-react'
import { useState } from 'react'

export default function LuxuryHeader({ children, theme, isArabic }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isDashboardPage = location.pathname === '/dashboard' || location.pathname === '/doctor-dashboard'
  const isTriagePage = location.pathname === '/ai-triage'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-2 px-4 sm:pt-3 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl rounded-2xl border border-cyan-300/20 bg-slate-900/40 backdrop-blur-3xl shadow-2xl transition-all duration-300 hover:border-cyan-300/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-100">
                <Stethoscope className="h-4 w-4 text-cyan-300" />
                Hihya Care
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                to="/ai-triage"
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isTriagePage
                    ? 'bg-violet-500/15 text-violet-200 border border-violet-400/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Brain className="h-4 w-4" />
                المساعد الذكي
              </Link>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isDashboardPage
                    ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <HeartPulse className="h-4 w-4" />
                لوحة التحكم
              </Link>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {menuOpen && (
            <div className="md:hidden mt-3 space-y-1 border-t border-white/10 pt-3">
              <Link
                to="/ai-triage"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isTriagePage ? 'bg-violet-500/10 text-violet-200' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <Brain className="h-4 w-4" />
                المساعد الذكي
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isDashboardPage ? 'bg-cyan-500/10 text-cyan-200' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <HeartPulse className="h-4 w-4" />
                لوحة التحكم
              </Link>
            </div>
          )}

          {children}
        </div>
      </div>
    </header>
  )
}