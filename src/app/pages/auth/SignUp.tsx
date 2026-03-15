import { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../../lib/supabase';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserData } from '../../context/UserDataContext';

export function SignUp() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userData, updateUserData, syncToSupabase } = useUserData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!email || !password) { setError(t('common.error')); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');

    try {
      // 1. Create Supabase auth user
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }

      // 2. Store email in userData
      updateUserData({ email });

      // 3. Sync all onboarding data to Supabase profile
      if (data.user) {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email,
            name: userData.name,
            date_of_birth: userData.dateOfBirth?.toISOString(),
            time_of_birth: userData.timeOfBirth,
            place_of_birth: userData.placeOfBirth,
            birth_lat: userData.birth_lat,
            birth_lng: userData.birth_lng,
            sun_sign: userData.sun_sign,
            moon_sign: userData.moon_sign,
            rising_sign: userData.rising_sign,
            venus_sign: userData.venus_sign,
            mars_sign: userData.mars_sign,
            mercury_sign: userData.mercury_sign,
            jupiter_sign: userData.jupiter_sign,
            saturn_sign: userData.saturn_sign,
            current_city: userData.currentCity,
            current_lat: userData.current_lat,
            current_lng: userData.current_lng,
            country_code: userData.country_code,
            currency: userData.currency,
            stripe_customer_id: userData.stripe_customer_id,
            tracks_periods: userData.tracksPeriods,
            last_period_start: userData.lastPeriodStart?.toISOString(),
            last_period_end: userData.lastPeriodEnd?.toISOString(),
            has_paid: userData.hasPaid ?? false,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

          // Attach email to Stripe customer if we have one
if (userData.stripe_customer_id) {
  await fetch(`${import.meta.env.VITE_WORKER_URL}/stripe/update-customer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      customerId: userData.stripe_customer_id, 
      email 
    }),
  });
}

        if (upsertError) console.error('Profile sync error:', upsertError);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-3xl">{t('auth.signup.title')}</h1>
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-muted-foreground">{t('auth.signup.subtitle')}</p>
        </div>
        <div className="glass rounded-3xl p-8 space-y-5 border border-white/40">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('auth.email')}</label>
            <Input type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignUp()}
              className="bg-input-background border-border rounded-xl py-6 text-base" autoFocus />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('auth.password')}</label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignUp()}
                className="bg-input-background border-border rounded-xl py-6 text-base pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button onClick={handleSignUp} disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl text-base btn-glow">
            {loading ? t('common.loading') : `${t('auth.signup.button')} ✦`}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.signup.login')}{' '}
            <button onClick={() => navigate('/login')} className="text-primary font-medium hover:underline">
              {t('auth.login.button')}
            </button>
          </p>
        </div>
        <p className="text-center text-xs text-muted-foreground px-4">
          By creating an account you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}