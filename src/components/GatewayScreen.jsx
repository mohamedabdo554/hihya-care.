import { useEffect, useState } from 'react'
import { Stethoscope, PawPrint } from 'lucide-react'

const gatewayClasses = {
  overlay: 'fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950/90 to-slate-950',
  bgGlow1: 'absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-[128px]',
  bgGlow2: 'absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-[128px]',
  container: 'relative z-10 mx-auto w-full max-w-3xl px-6 text-center',
  heading: 'mb-2 text-4xl font-extrabold tracking-tight text-white',
  subheading: 'mb-10 text-sm text-slate-400',
  cardsWrapper: 'grid gap-6 sm:grid-cols-2',
  card: (isHovered, color) => {
    const base = 'group relative cursor-pointer overflow-hidden rounded-3xl border p-8 text-center backdrop-blur-xl transition-all duration-500'
    const hover = isHovered ? 'scale-[1.03] -translate-y-1 shadow-2xl' : 'scale-100 shadow-lg'
    const borderColor = color === 'blue' ? 'border-blue-400/30' : 'border-emerald-400/30'
    const bg = color === 'blue'
      ? 'bg-gradient-to-br from-blue-600/15 via-blue-500/10 to-cyan-600/10'
      : 'bg-gradient-to-br from-emerald-600/15 via-green-500/10 to-teal-600/10'
    return `${base} ${hover} ${borderColor} ${bg}`
  },
  cardGlow: (isHovered, color) => {
    const base = 'absolute -inset-1 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500'
    const visible = isHovered ? 'opacity-100' : 'opacity-0'
    const gradient = color === 'blue'
      ? 'bg-gradient-to-r from-blue-500/30 via-cyan-500/20 to-blue-500/30'
      : 'bg-gradient-to-r from-emerald-500/30 via-green-500/20 to-teal-500/30'
    return `${base} ${visible} ${gradient}`
  },
  iconWrapper: (color) => {
    const bg = color === 'blue'
      ? 'bg-blue-500/20 text-blue-300 group-hover:bg-blue-500/30'
      : 'bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500/30'
    return `mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl transition-all duration-300 ${bg}`
  },
  cardTitle: 'mb-2 text-2xl font-bold text-white',
  cardDesc: 'text-sm leading-relaxed text-slate-400',
  footer: 'mt-10 text-xs text-slate-600',
}

export default function GatewayScreen({ onSelect }) {
  const [hovered, setHovered] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`${gatewayClasses.overlay} ${visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
      <div className={gatewayClasses.bgGlow1} />
      <div className={gatewayClasses.bgGlow2} />

      <div className={gatewayClasses.container}>
        <h1 className={gatewayClasses.heading}>
          Hihya Care
        </h1>
        <p className={gatewayClasses.subheading}>
          اختر القسم المناسب لتبدأ رحلة العلاج
        </p>

        <div className={gatewayClasses.cardsWrapper}>
          {/* Human */}
          <button
            type="button"
            onClick={() => onSelect('human')}
            onMouseEnter={() => setHovered('human')}
            onMouseLeave={() => setHovered(null)}
            className={gatewayClasses.card(hovered === 'human', 'blue')}
          >
            <div className={gatewayClasses.cardGlow(hovered === 'human', 'blue')} />
            <div className="relative z-10">
              <div className={gatewayClasses.iconWrapper('blue')}>
                <Stethoscope className="h-9 w-9" />
              </div>
              <h2 className={gatewayClasses.cardTitle}>العيادات البشرية</h2>
              <p className={gatewayClasses.cardDesc}>
                استشارات طبية في جميع التخصصات – أطباء بشر بخبرة عالية
              </p>
            </div>
          </button>

          {/* Veterinary */}
          <button
            type="button"
            onClick={() => onSelect('veterinary')}
            onMouseEnter={() => setHovered('veterinary')}
            onMouseLeave={() => setHovered(null)}
            className={gatewayClasses.card(hovered === 'veterinary', 'green')}
          >
            <div className={gatewayClasses.cardGlow(hovered === 'veterinary', 'green')} />
            <div className="relative z-10">
              <div className={gatewayClasses.iconWrapper('green')}>
                <PawPrint className="h-9 w-9" />
              </div>
              <h2 className={gatewayClasses.cardTitle}>الطب البيطري</h2>
              <p className={gatewayClasses.cardDesc}>
                عيادة متخصصة للقطط والكلاب – جراحة وباطنة ورعاية الحيوانات الأليفة
              </p>
            </div>
          </button>
        </div>

        <p className={gatewayClasses.footer}>
          Hihya Care © {new Date().getFullYear()} – رعاية صحية متكاملة للإنسان والحيوان
        </p>
      </div>
    </div>
  )
}
