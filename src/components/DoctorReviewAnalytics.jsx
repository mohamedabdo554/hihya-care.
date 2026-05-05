import { Star } from 'lucide-react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const defaultLabels = {
  title: 'Review Analytics',
  averageLabel: 'Average Rating',
  totalLabel: 'Total Reviews',
  distributionLabel: 'Rating Distribution',
  recentLabel: 'Recent Reviews',
  empty: 'No reviews yet.',
  patientFallback: 'Patient',
  commentFallback: 'No comment provided.',
  loadingLabel: 'Loading reviews...',
}

export default function DoctorReviewAnalytics({
  summary,
  reviews,
  isLoading,
  notice,
  labels = defaultLabels,
  formatTimeAgo,
}) {
  const text = { ...defaultLabels, ...labels }
  const distribution = summary?.distribution || []
  const average = summary?.average ?? 0
  const total = summary?.total ?? 0
  const recentReviews = reviews?.slice(0, 6) || []

  return (
    <section className="rounded-[1.6rem] border border-slate-200 bg-white/80 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-600/70 dark:text-amber-200/70">
            {text.title}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {text.distributionLabel}
          </h3>
        </div>
        {notice ? (
          <span className="rounded-full border border-amber-300/30 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-700 dark:bg-amber-400/10 dark:text-amber-100">
            {notice}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          {text.loadingLabel}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-amber-200/40 bg-amber-50/80 p-5 dark:border-amber-300/20 dark:bg-amber-400/10">
              <p className="text-xs uppercase tracking-[0.32em] text-amber-700/70 dark:text-amber-200/70">
                {text.averageLabel}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Star className="h-7 w-7 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" fill="currentColor" />
                <span className="text-3xl font-semibold text-amber-900 dark:text-amber-100">
                  {average.toFixed(1)}
                </span>
                <span className="text-sm text-amber-700/80 dark:text-amber-200/80">/ 5</span>
              </div>
              <p className="mt-3 text-sm text-amber-700/70 dark:text-amber-200/70">
                {text.totalLabel}: {total}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/60">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {text.distributionLabel}
              </p>
              <div className="mt-3 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ratingGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="star" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="url(#ratingGold)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {text.recentLabel}
            </p>
            <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {recentReviews.length ? (
                recentReviews.map(review => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {review.patient_name || text.patientFallback}
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTimeAgo ? formatTimeAgo(review.created_at) : ''}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={`${review.id}-${index}`}
                          className={index < review.rating ? 'h-4 w-4 text-amber-400' : 'h-4 w-4 text-slate-300 dark:text-slate-600'}
                          fill={index < review.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {review.comment || text.commentFallback}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {text.empty}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
