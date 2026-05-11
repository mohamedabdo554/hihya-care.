import { useState } from 'react'

const cards = [
  {
    id: 'tele-consultation',
    title: 'استشارة هاتفية',
    subtitle: 'تحدث مع طبيبك الآن من منزلك',
    emoji: '📞',
    border: 'border-purple-500/40',
    bg: 'from-violet-600/25 via-purple-600/20 to-fuchsia-600/15',
    glow: 'shadow-purple-500/20',
    btn: 'bg-purple-600 hover:bg-purple-500 border-purple-400/30',
    badge: 'bg-gradient-to-r from-purple-600 to-fuchsia-600',
  },
  {
    id: 'clinic-visit',
    title: 'كشف العيادة',
    subtitle: 'احجز موعدك التقليدي في العيادة',
    emoji: '🩺',
    border: 'border-blue-400/30',
    bg: 'from-sky-600/25 via-blue-600/20 to-cyan-600/15',
    glow: 'shadow-blue-400/20',
    btn: 'bg-blue-600 hover:bg-blue-500 border-blue-400/30',
    badge: 'bg-gradient-to-r from-sky-600 to-blue-600',
  },
  {
    id: 'urgent-care',
    title: 'كشف عاجل',
    subtitle: 'الأكثر طلباً للحالات الطارئة',
    emoji: '⚡',
    border: 'border-amber-500/40',
    bg: 'from-slate-950 via-gray-950 to-zinc-950',
    glow: 'shadow-amber-500/30',
    btn: 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-amber-500/30',
    badge: 'bg-gradient-to-r from-amber-500 to-yellow-500',
    isPopular: true,
  },
]

export default function TripleHeroCards({ onSelect, activeBookingType }) {
  return (
    <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3" dir="rtl">
      {cards.map((card) => {
        const isActive = activeBookingType === card.id

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect?.(card.id)}
            className={`group relative overflow-hidden rounded-3xl border-2 text-right outline-none transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${card.border} ${card.glow} ${isActive ? 'ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-400/20' : ''}`}
          >
            {/* Card inner */}
            <div className={`relative flex h-full flex-col items-center rounded-3xl bg-gradient-to-br p-6 backdrop-blur-2xl ${card.bg}`}>
              {/* Popular badge */}
              {card.isPopular && (
                <div className={`absolute -top-[1px] left-1/2 -translate-x-1/2 rounded-b-lg px-4 py-1 text-xs font-bold text-white shadow-lg ${card.badge}`}>
                  الأكثر طلباً ⭐
                </div>
              )}

              {/* Icon */}
              <div className={`relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 shadow-inner backdrop-blur-xl text-4xl ${card.isPopular ? 'bg-amber-500/20' : card.id === 'tele-consultation' ? 'bg-purple-500/15' : 'bg-blue-500/15'}`}>
                {card.emoji}
              </div>

              {/* Title */}
              <h3 className={`relative mb-2 text-xl font-bold ${card.isPopular ? 'text-amber-200' : 'text-white'}`}>
                {card.title}
              </h3>

              {/* Subtitle */}
              <p className="relative text-center text-sm leading-relaxed text-slate-400">
                {card.subtitle}
              </p>

              {/* CTA */}
              <div className="relative mt-auto w-full pt-5">
                <div className={`w-full rounded-xl py-2.5 text-center text-sm font-bold text-white shadow-lg transition-all duration-200 border ${card.btn}`}>
                  {card.id === 'tele-consultation' ? 'احجز استشارتك' :
                   card.id === 'urgent-care' ? 'احجز كشف عاجل' : 'احجز موعدك'}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
