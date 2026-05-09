import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-screen items-center justify-center bg-[#020617] p-6" dir="rtl">
          <div className="max-w-lg rounded-3xl border border-rose-400/20 bg-rose-500/10 p-8 text-center backdrop-blur-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/20">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-rose-100">حدث خطأ غير متوقع</h2>
            <p className="mt-2 text-sm text-rose-200/70">
              تعذر تحميل هذا القسم. تم تسجيل الخطأ وسنعمل على إصلاحه قريباً.
            </p>
            {this.state.error && (
              <p className="mt-3 rounded-xl border border-rose-400/20 bg-rose-950/30 px-4 py-2 text-xs text-rose-300/70 font-mono text-left" dir="ltr">
                {this.state.error.message.slice(0, 200)}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl border border-rose-400/30 bg-rose-500/15 px-5 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/25"
              >
                إعادة تحميل
              </button>
              <Link
                to="/"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
