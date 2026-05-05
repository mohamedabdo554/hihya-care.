import { AnimatePresence, motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useMemo, useState } from 'react'

const defaultStrings = {
  kicker: 'Patient Feedback',
  title: 'Share your consultation review',
  subtitle: 'Your insight helps Hihya Care refine the clinical experience.',
  ratingLabel: 'Your rating',
  commentLabel: 'Your experience',
  commentPlaceholder: 'Describe how the visit felt and what stood out.',
  submitLabel: 'Submit Review',
  submittingLabel: 'Submitting',
  thankYouTitle: 'Thank you',
  thankYouBody: 'Your feedback was delivered to the care team.',
  ratingRequired: 'Please select a star rating before submitting.',
  disabledReason: '',
}

export default function ReviewFeedbackCard({
  doctorName,
  doctorSpecialty,
  onSubmit,
  strings = defaultStrings,
  disabledReason = '',
}) {
  const labels = { ...defaultStrings, ...strings }
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [note, setNote] = useState('')
  const [showThankYou, setShowThankYou] = useState(false)

  const activeRating = hoverRating || rating
  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isDisabled = Boolean(disabledReason)

  const glowStyle = useMemo(
    () =>
      activeRating
        ? {
            filter: 'drop-shadow(0 0 12px rgba(250,204,21,0.55)) drop-shadow(0 0 26px rgba(245,158,11,0.35))',
          }
        : undefined,
    [activeRating],
  )

  const handleRatingSelect = value => {
    setRating(value)
    if (errorMessage) {
      setErrorMessage('')
    }
  }

  const handleCommentChange = event => {
    setComment(event.target.value)
    if (errorMessage) {
      setErrorMessage('')
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()

    if (isDisabled || isLoading) {
      return
    }

    if (!rating) {
      setStatus('error')
      setErrorMessage(labels.ratingRequired)
      return
    }

    try {
      setStatus('loading')
      setErrorMessage('')
      setNote('')

      const result = await onSubmit({ rating, comment })
      const nextNote = result?.note || ''

      setNote(nextNote)
      setStatus('success')
      setShowThankYou(true)

      window.setTimeout(() => setShowThankYou(false), 2400)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unable to submit the review right now.')
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[2rem] border border-amber-200/30 bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-amber-300/20 dark:bg-white/6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_45%)]" />
      <form className="relative space-y-6" onSubmit={handleSubmit}>
        <div>
          <p className="text-[11px] uppercase tracking-[0.38em] text-amber-700/70 dark:text-amber-200/70">
            {labels.kicker}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
            {labels.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {labels.subtitle}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-amber-200/30 bg-amber-50/70 p-4 dark:border-amber-300/20 dark:bg-amber-400/5">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700/70 dark:text-amber-200/70">
            {labels.ratingLabel}
          </p>
          <div className="mt-3 flex items-center gap-2" style={glowStyle}>
            {[1, 2, 3, 4, 5].map(value => {
              const isActive = value <= activeRating
              return (
                <motion.button
                  key={value}
                  type="button"
                  whileHover={{ scale: 1.12, rotate: -4 }}
                  whileTap={{ scale: 0.96 }}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onFocus={() => setHoverRating(value)}
                  onBlur={() => setHoverRating(0)}
                  onClick={() => handleRatingSelect(value)}
                  aria-pressed={isActive}
                  className="rounded-full p-1.5 transition"
                >
                  <Star
                    className={
                      isActive
                        ? 'h-7 w-7 text-amber-400'
                        : 'h-7 w-7 text-slate-300 dark:text-slate-500'
                    }
                    fill={isActive ? 'currentColor' : 'none'}
                  />
                </motion.button>
              )
            })}
          </div>
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            {labels.commentLabel}
          </span>
          <div className="mt-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition focus-within:border-amber-300/60 focus-within:shadow-[0_0_0_1px_rgba(251,191,36,0.3),0_0_26px_rgba(251,191,36,0.18)] dark:border-white/10 dark:bg-slate-950/60">
            <textarea
              value={comment}
              onChange={handleCommentChange}
              rows={4}
              className="w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
              placeholder={labels.commentPlaceholder}
              disabled={isLoading || isDisabled}
            />
          </div>
        </label>

        {doctorName ? (
          <div className="rounded-[1.4rem] border border-slate-200 bg-white/70 px-4 py-3 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">{doctorName}</span>
            {doctorSpecialty ? ` · ${doctorSpecialty}` : ''}
          </div>
        ) : null}

        {disabledReason ? (
          <div className="rounded-[1.4rem] border border-amber-300/30 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:bg-amber-400/10 dark:text-amber-100">
            {disabledReason}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-[1.4rem] border border-rose-300/30 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-100">
            {errorMessage}
          </div>
        ) : null}

        {note && isSuccess ? (
          <div className="rounded-[1.4rem] border border-emerald-300/40 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-100">
            {note}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading || isDisabled}
          className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.4rem] border border-amber-300/40 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-5 py-4 text-sm font-semibold text-amber-950 shadow-[0_12px_38px_rgba(251,191,36,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(251,191,36,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.55),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-950/30 border-t-amber-950" />
              {labels.submittingLabel}
            </>
          ) : (
            <>
              {labels.submitLabel}
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </>
          )}
        </button>
      </form>

      <AnimatePresence>
        {showThankYou ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-x-6 bottom-6 rounded-[1.4rem] border border-emerald-300/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-[0_10px_26px_rgba(16,185,129,0.2)] dark:bg-emerald-400/10 dark:text-emerald-100"
          >
            <p className="font-semibold">{labels.thankYouTitle}</p>
            <p className="text-xs opacity-80">{labels.thankYouBody}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  )
}
