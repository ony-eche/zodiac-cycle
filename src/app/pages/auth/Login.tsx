import { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../../lib/supabase';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Moon, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserData } from '../../context/UserDataContext';

export function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loadFromSupabase } = useUserData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // ─── Email Login ────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('common.error'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        if (loginError.message.includes('Email not confirmed')) {
          setError('Please confirm your email before logging in. Check your inbox.');
        } else {
          setError('Incorrect email or password');
        }
        return;
      }

      // ✅ Ensure session is ready (fixes race conditions)
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.user) {
        setError('Login failed. Please try again.');
        return;
      }

      // ✅ Optional: store session for extra PWA reliability
      localStorage.setItem(
        'supabaseSession',
        JSON.stringify(sessionData.session)
      );

      // ✅ Load user profile
      await loadFromSupabase();

      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // ─── Google Login ───────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin, // ✅ FIXED for PWA
      },
    });

    if (error) {
      setError(error.message);
      setSocialLoading(null);
    }
  };

  // ─── Facebook Login ─────────────────────────────────────────────────────────
  const handleFacebookLogin = async () => {
    setSocialLoading('facebook');
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin, // ✅ FIXED for PWA
      },
    });

    if (error) {
      setError(error.message);
      setSocialLoading(null);
    }
  };

  // ─── Forgot Password ────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address first');
      return;
    }

    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setResetSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center" />

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            <h1 className="text-3xl">{t('auth.login.title')}</h1>
            <Moon className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-muted-foreground">{t('auth.login.subtitle')}</p>
        </div>

        <div className="glass rounded-3xl p-8 space-y-5 border border-white/40">

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Reset sent */}
          {resetSent && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-sm text-primary text-center">
              📬 Password reset email sent! Check your inbox.
            </div>
          )}

          {/* Social login */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/40 glass hover:bg-white/20 transition-all font-medium text-sm disabled:opacity-50"
            >
              {socialLoading === 'google' ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
              ) : (
                <span>Continue with Google</span>
              )}
            </button>

            <button
              onClick={handleFacebookLogin}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/40 glass hover:bg-white/20 transition-all font-medium text-sm disabled:opacity-50"
            >
              {socialLoading === 'facebook' ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
              ) : (
                <span>Continue with Facebook</span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/20"/>
            <span className="text-xs text-muted-foreground">or continue with email</span>
            <div className="flex-1 h-px bg-white/20"/>
          </div>

          {/* Email */}
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="py-6"
            autoFocus
          />

          {/* Password */}
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="py-6 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Forgot password */}
          <button
            onClick={handleForgotPassword}
            className="text-sm text-primary hover:underline text-left"
          >
            {t('auth.login.forgot')}
          </button>

          <Button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full py-6"
          >
            {loading ? 'Loading...' : `${t('auth.login.button')} ✦`}
          </Button>

          {/* Signup */}
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.login.signup')}{' '}
            <button
              onClick={() => navigate('/onboarding/welcome')}
              className="text-primary font-medium hover:underline"
            >
              {t('auth.signup.button')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}