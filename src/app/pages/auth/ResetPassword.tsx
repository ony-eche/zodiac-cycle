import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../../lib/supabase';
import { ZodiacCycleLogo } from '../../components/ZodiacCycleLogo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Eye, EyeOff, Check } from 'lucide-react';

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Supabase puts the token in the URL hash — this picks it up automatically
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
      }
    });
  }, []);

  const handleReset = async () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-primary"/>
          </div>
          <p className="text-xl font-bold text-primary">Password updated!</p>
          <p className="text-sm text-muted-foreground">Taking you to the app...</p>
        </div>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-3xl">🔗</p>
          <p className="text-base font-semibold">Waiting for reset link...</p>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to continue.
          </p>
          <button onClick={() => navigate('/login')}
            className="text-primary text-sm hover:underline">
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <ZodiacCycleLogo className="justify-center"/>
        <div className="text-center">
          <h1 className="text-3xl">New Password</h1>
          <p className="text-muted-foreground mt-2">Choose a strong password</p>
        </div>
        <div className="glass rounded-3xl p-8 space-y-5 border border-white/40">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">New Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-input-background border-border rounded-xl py-6 text-base pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Confirm Password</label>
            <Input
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              className="bg-input-background border-border rounded-xl py-6 text-base"
            />
          </div>
          <Button onClick={handleReset} disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-6 rounded-xl text-base btn-glow">
            {loading ? 'Updating...' : 'Update Password ✦'}
          </Button>
        </div>
      </div>
    </div>
  );
}