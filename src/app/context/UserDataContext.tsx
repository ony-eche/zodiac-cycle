import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserData {
  name?: string;
  email?: string;
  stripe_customer_id?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  birth_lat?: number;
  birth_lng?: number;
  sun_sign?: string;
  moon_sign?: string;
  rising_sign?: string;
  venus_sign?: string;
  mars_sign?: string;
  mercury_sign?: string;
  jupiter_sign?: string;
  saturn_sign?: string;
  houses?: {
    sun?: number; moon?: number; venus?: number;
    mars?: number; mercury?: number; rising?: number;
  };
  tracksPeriods?: boolean;
  periodsRegular?: boolean;
  knowsLastPeriod?: boolean;
  lastPeriodStart?: string;
  lastPeriodEnd?: string;
  hormonalTracking?: {
    mood?: string; stressLevel?: string; sleepQuality?: string;
    headaches?: boolean; cramps?: boolean; libido?: string;
  };
  lifestyle?: {
    sleepHours?: string; stressLevel?: string; exerciseFrequency?: string;
    birthControl?: boolean; birthControlType?: string; pregnancyStatus?: string;
  };
  currentCity?: string;
  current_lat?: number;
  current_lng?: number;
  hasPaid?: boolean;
  country_code?: string;
  currency?: string;
}

interface UserDataContextType {
  userData: UserData;
  user: any;
  updateUserData: (data: Partial<UserData>) => void;
  clearUserData: () => void;
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

// ─── Storage helpers (FIXED: localStorage) ────────────────────────────────────
function loadFromStorage(): UserData {
  try {
    const saved = localStorage.getItem('zodiac_user_data');
    if (!saved) return {};
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

function saveToStorage(data: UserData) {
  try {
    localStorage.setItem('zodiac_user_data', JSON.stringify(data));
  } catch {}
}

// ─── Mapping functions ────────────────────────────────────────────────────────
function toSupabaseRow(data: UserData) {
  return {
    name: data.name,
    email: data.email,
    date_of_birth: data.dateOfBirth,
    time_of_birth: data.timeOfBirth,
    place_of_birth: data.placeOfBirth,
    birth_lat: data.birth_lat,
    birth_lng: data.birth_lng,
    sun_sign: data.sun_sign,
    moon_sign: data.moon_sign,
    rising_sign: data.rising_sign,
    venus_sign: data.venus_sign,
    mars_sign: data.mars_sign,
    mercury_sign: data.mercury_sign,
    jupiter_sign: data.jupiter_sign,
    saturn_sign: data.saturn_sign,
    current_city: data.currentCity,
    current_lat: data.current_lat,
    current_lng: data.current_lng,
    country_code: data.country_code,
    currency: data.currency,
    tracks_periods: data.tracksPeriods,
    last_period_start: data.lastPeriodStart,
    last_period_end: data.lastPeriodEnd,
    has_paid: data.hasPaid,
    updated_at: new Date().toISOString(),
  };
}

function fromSupabaseRow(row: any): UserData {
  return {
    name: row.name,
    email: row.email,
    dateOfBirth: row.date_of_birth,
    timeOfBirth: row.time_of_birth,
    placeOfBirth: row.place_of_birth,
    birth_lat: row.birth_lat,
    birth_lng: row.birth_lng,
    sun_sign: row.sun_sign,
    moon_sign: row.moon_sign,
    rising_sign: row.rising_sign,
    venus_sign: row.venus_sign,
    mars_sign: row.mars_sign,
    mercury_sign: row.mercury_sign,
    jupiter_sign: row.jupiter_sign,
    saturn_sign: row.saturn_sign,
    currentCity: row.current_city,
    current_lat: row.current_lat,
    current_lng: row.current_lng,
    country_code: row.country_code,
    currency: row.currency,
    tracksPeriods: row.tracks_periods,
    lastPeriodStart: row.last_period_start,
    lastPeriodEnd: row.last_period_end,
    hasPaid: row.has_paid,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(loadFromStorage);
  const [user, setUser] = useState<any>(null);

  // ─── Load from Supabase ─────────────────────────────────────────────────────
  const loadFromSupabaseInternal = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return;

      const remote = fromSupabaseRow(data);
      const local = loadFromStorage();

      // ✅ Remote wins (important fix)
      const merged: UserData = {
        ...local,
        ...remote,
      };

      setUserData(merged);
      saveToStorage(merged);
    } catch (err) {
      console.error('Failed to load from Supabase:', err);
    }
  };

  // ─── Init + Auth Listener ───────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await loadFromSupabaseInternal(session.user.id);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }

        if (event === 'SIGNED_IN' && session?.user) {
          await loadFromSupabaseInternal(session.user.id);
        }

        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('zodiac_user_data');
          setUserData({});
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ─── Sync to Supabase ───────────────────────────────────────────────────────
  const syncToSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const row = toSupabaseRow(userData);

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...row }, { onConflict: 'id' });

      if (error) console.error('Supabase sync error:', error);
    } catch (err) {
      console.error('Failed to sync to Supabase:', err);
    }
  };

  const loadFromSupabase = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await loadFromSupabaseInternal(user.id);
  };

  // ─── Update local state ─────────────────────────────────────────────────────
  const updateUserData = (data: Partial<UserData>) => {
    setUserData(prev => {
      const next = { ...prev, ...data };
      saveToStorage(next);
      return next;
    });
  };

  const clearUserData = () => {
    localStorage.removeItem('zodiac_user_data');
    setUserData({});
  };

  return (
    <UserDataContext.Provider
      value={{
        userData,
        user,
        updateUserData,
        clearUserData,
        syncToSupabase,
        loadFromSupabase,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) throw new Error('useUserData must be used within UserDataProvider');
  return context;
}