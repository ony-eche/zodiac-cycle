import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Custom localStorage adapter
 * Fixes iOS PWA logout issue caused by Web Locks API
 */
const localStorageAdapter = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch {}
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch {}
  },
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorageAdapter,
    storageKey: 'zodiaccycle-auth', // ✅ optional but cleaner
    lock: undefined,                // ✅ disables Web Locks bug
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,       // ✅ IMPORTANT for OAuth
  },
})