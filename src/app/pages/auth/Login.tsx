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

  const handleLogin = async () => {
    if (!email || !password) { setError(t('common.error')); return; }
    setLoading(true);
    setError('');
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        if (loginError.message.includes('Email not confirmed')) {
          setError('Please confirm your email before logging in. Check your inbox.');
        } else {
          setError('Incorrect email or password');
        }
        setLoading(false);
        return;
      }
      await loadFromSupabase();
      navigate('/dashboard');
    } catch {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) { setError(error.message); setSocialLoading(null); }
  };

  const handleFacebookLogin = async () => {
    setSocialLoading('facebook');
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) { setError(error.message); setSocialLoading(null); }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email address first'); return; }
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { setError(error.message); return; }
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

          {/* Reset sent confirmation */}
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
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            <button
              onClick={handleFacebookLogin}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/40 glass hover:bg-white/20 transition-all font-medium text-sm disabled:opacity-50"
            >
              {socialLoading === 'facebook' ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              )}
              Continue with Facebook
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/20"/>
            <span className="text-xs text-muted-foreground">or continue with email</span>
            <div className="flex-1 h-px bg-white/20"/>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('auth.email')}</label>
            <Input type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="bg-input-background border-border rounded-xl py-6 text-base" autoFocus />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('auth.password')}</label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder="Your password"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="bg-input-background border-border rounded-xl py-6 text-base pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <button
            onClick={handleForgotPassword}
            className="text-sm text-primary hover:underline text-left"
          >
            {t('auth.login.forgot')}
          </button>

          <Button onClick={handleLogin} disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl text-base btn-glow">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"/>{t('common.loading')}</>
              : `${t('auth.login.button')} ✦`
            }
          </Button>

          {/* ✅ FIXED: Create Account button now goes to Welcome page */}
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