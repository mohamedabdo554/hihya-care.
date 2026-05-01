import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

const createFailureResult = (message) => ({
	data: null,
	error: new Error(message),
})

const createFallbackClient = () => ({
	from() {
		const builder = {
			select() {
				return builder
			},
			eq() {
				return builder
			},
			order() {
				return builder
			},
			limit() {
				return builder
			},
			maybeSingle() {
				return Promise.resolve(
					createFailureResult(
						'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable data loading.',
					),
				)
			},
			insert() {
				return Promise.resolve(
					createFailureResult(
						'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable bookings.',
					),
				)
			},
			single() {
				return Promise.resolve(
					createFailureResult(
						'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable data loading.',
					),
				)
			},
		}
		return builder
	},
})

export const supabase =
	supabaseUrl && supabaseKey
		? createClient(supabaseUrl, supabaseKey)
		: createFallbackClient()
