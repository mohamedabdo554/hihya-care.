export {}

declare module './supabaseClient.js' {
  import type { SupabaseClient } from '@supabase/supabase-js'

  export const supabase: SupabaseClient
}
