export default function LuxuryHeader({ children, theme, isArabic }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-2 px-4 sm:pt-3 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl rounded-2xl border border-cyan-300/20 bg-slate-900/40 backdrop-blur-3xl shadow-2xl transition-all duration-300 hover:border-cyan-300/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          {children}
        </div>
      </div>
    </header>
  )
}
