/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_WORKER_URL: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_STRIPE_PRICE_ID_TRIAL: string;
  readonly VITE_STRIPE_PRICE_ID_MONTHLY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}