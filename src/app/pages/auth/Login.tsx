import { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../../lib/supabase';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Moon, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError(t('common.error')); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError('Incorrect email or password'); setLoading(false); return; }
    navigate('/dashboard');
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
        <div className="bg-card border border-border rounded-2xl p-8 space-y-5">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('auth.email')}</label>
            <Input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="bg-input-background border-border rounded-xl py-6 text-base" autoFocus />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t('auth.password')}</label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder="Your password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="bg-input-background border-border rounded-xl py-6 text-base pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button onClick={() => {}} className="text-sm text-primary hover:underline">
            {t('auth.login.forgot')}
          </button>
          <Button onClick={handleLogin} disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl text-base">
            {loading ? t('common.loading') : `${t('auth.login.button')} ✦`}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.login.signup')}{' '}
            <button onClick={() => navigate('/signup')} className="text-primary font-medium hover:underline">
              {t('auth.signup.button')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
