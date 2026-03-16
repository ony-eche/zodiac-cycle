/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_WORKER_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_PRICE_ID_TRIAL: string
  readonly VITE_STRIPE_PRICE_ID_MONTHLY: string
  readonly VITE_ADSENSE_CLIENT: string
  readonly VITE_AD_SLOT_CYCLE: string
  readonly VITE_AD_SLOT_TRANSITS: string
  readonly VITE_VAPID_PUBLIC_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}