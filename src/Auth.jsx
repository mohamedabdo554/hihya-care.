import { useState } from 'react'
import { supabase } from './supabaseClient'

export function Auth({ ui }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'

  const t = key => ui.getText(ui.language, key)

  const handleLogin = async event => {
    event.preventDefault()

    try {
      setLoading(true)
      if (!email.trim()) {
        throw new Error(t('invalidEmail'))
      }

      if (!supabase?.auth?.signInWithOtp) {
        throw new Error('Supabase auth is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      }

      const { error } = await supabase.auth.signInWithOtp({ email })

      if (error) throw error

      setMessageType('success')
      setMessage(t('otpSentSuccess'))
    } catch (error) {
      setMessageType('error')
      setMessage(error.message || t('otpLoginError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-slate-900 dark:text-white">
          {t('otpLoginTitle')}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
          {t('otpLoginIntro')}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
              {t('enterEmail')}
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6 dark:bg-slate-700 dark:text-white dark:ring-slate-600 dark:focus:ring-cyan-500"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:focus-visible:outline-cyan-500"
              disabled={loading}
            >
              {loading ? t('checkingOtp') : t('sendOtp')}
            </button>
          </div>
        </form>

        {message && (
          <div
            className={`mt-4 rounded-md p-3 text-sm ${
              messageType === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
            }`}
            role="alert"
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}