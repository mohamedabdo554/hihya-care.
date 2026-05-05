import { motion } from 'framer-motion'
import { Clock, MapPin, ShieldCheck, Star, Stethoscope, Wallet } from 'lucide-react'
import { useMemo } from 'react'

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

function formatTimeLabels(date, startHour, endHour, language) {
  const start = new Date(date)
  const end = new Date(date)
  start.setHours(startHour, 0, 0, 0)
  end.setHours(endHour, 0, 0, 0)

  const formatter = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return {
    startLabel: formatter.format(start),
    endLabel: formatter.format(end),
  }
}

function buildSlots(language, labels) {
  const baseDate = new Date()
  const dateFormatter = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  })

  const times = [
    { start: 19, end: 23 },
    { start: 17, end: 21 },
    { start: 18, end: 22 },
  ]

  return times.map((time, index) => {
    const slotDate = new Date(baseDate)
    slotDate.setDate(baseDate.getDate() + index)

    const { startLabel, endLabel } = formatTimeLabels(slotDate, time.start, time.end, language)
    const dateLabel = dateFormatter.format(slotDate)
    const label =
      index === 0
        ? labels.today
        : index === 1
          ? labels.tomorrow
          : labels.dayAfter
            ? `${labels.dayAfter} • ${dateLabel}`
            : dateLabel

    return {
      id: `${slotDate.toISOString()}-${time.start}`,
      label,
      startLabel,
      endLabel,
      startDate: new Date(slotDate.setHours(time.start, 0, 0, 0)),
    }
  })
}

function getInitials(name) {
  if (!name) return 'HC'
  const parts = String(name).split(' ').filter(Boolean)
  const letters = parts.slice(0, 2).map(part => part[0])
  return letters.join('').toUpperCase()
}

export default function DoctorAvailabilityShowcase({
  doctor,
  onBookSlot,
  onBookDoctor,
  onViewProfile,
  labels,
  language,
  ratingValue,
  ratingCountLabel,
  waitValue,
}) {
  const slots = useMemo(() => buildSlots(language, labels), [language, labels])
  const rating = ratingValue ?? 0
  const filledStars = Math.round(rating)

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white/92 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60"
    >
      <div className="absolute -left-24 -top-28 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-4 top-6 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-700/70 dark:text-cyan-200/70">
              {labels.kicker}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white sm:text-2xl">
              {labels.title}
            </h2>
            <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
              {labels.subtitle}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {slots.map(slot => (
              <div
                key={slot.id}
                className="rounded-[1.4rem] border border-slate-200 bg-white/95 p-3 shadow-[0_14px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
                  <span>{slot.label}</span>
                  <Clock className="h-4 w-4" />
                </div>
                <div className="mt-4 space-y-2 text-center">
                  <div className="rounded-xl border border-slate-200/60 bg-white/80 px-2 py-2 text-xs font-semibold text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
                    {labels.from} {slot.startLabel}
                  </div>
                  <div className="rounded-xl border border-slate-200/60 bg-white/80 px-2 py-2 text-xs font-semibold text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
                    {labels.to} {slot.endLabel}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onBookSlot(slot.startDate)}
                  className="mt-4 w-full rounded-2xl bg-rose-500 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-rose-600"
                >
                  {labels.book}
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {labels.note}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-200/30 to-transparent dark:from-cyan-400/10" />

          <div className="relative flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-cyan-300/30 bg-cyan-400/10 text-base font-bold text-cyan-800 shadow-[0_0_24px_rgba(34,211,238,0.2)] dark:text-cyan-100">
                {getInitials(doctor?.name)}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-700/70 dark:text-cyan-200/70">
                  {labels.ratingLabel}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                  {doctor?.name || labels.loading}
                </h3>
                <p className="mt-1 text-xs text-cyan-700/80 dark:text-cyan-100/80">
                  {doctor?.specialty || ''}
                </p>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-amber-200/40 bg-amber-50/80 px-4 py-3 dark:border-amber-300/20 dark:bg-amber-400/10">
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`availability-star-${index}`}
                    className={index < filledStars ? 'h-5 w-5 text-amber-400' : 'h-5 w-5 text-amber-300/40'}
                    fill={index < filledStars ? 'currentColor' : 'none'}
                  />
                ))}
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-100">
                  {ratingValue ? rating.toFixed(1) : labels.ratingEmpty}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-amber-700/70 dark:text-amber-200/80">
                {ratingCountLabel}
              </p>
            </div>

            <div className="grid gap-2 text-xs">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <span className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-cyan-500" />
                  {labels.priceLabel}
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-100">{doctor?.price || '--'}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-amber-500" />
                  {labels.paymentLabel}
                </span>
                <span className="font-semibold">{labels.paymentValue}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  {labels.waitLabel}
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-100">{waitValue}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-500" />
                  {labels.locationLabel}
                </span>
                <span className="max-w-[12rem] truncate font-semibold text-slate-600 dark:text-slate-200">
                  {doctor?.clinicLocation || '--'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-500" />
                  {labels.availabilityLabel}
                </span>
                <span className="font-semibold text-cyan-700 dark:text-cyan-100">{labels.availabilityValue}</span>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={onBookDoctor}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_10px_26px_rgba(34,211,238,0.3)] transition hover:-translate-y-0.5"
              >
                {labels.bookNow}
              </button>
              <button
                type="button"
                onClick={onViewProfile}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              >
                {labels.viewProfile}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
