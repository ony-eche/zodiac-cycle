import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { UserDataProvider } from './context/UserDataContext';
import { supabase } from '../lib/supabase';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('date_of_birth')
        .eq('id', userId)
        .single();
      return !!profile?.date_of_birth;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    // Force "checking" to false after 4 seconds if auth hangs
    const safetyTimer = setTimeout(() => {
      if (checking) {
        setChecking(false);
      }
    }, 4000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          if (window.location.pathname === '/') {
            router.navigate('/dashboard');
          }
        }
        setChecking(false);
        clearTimeout(safetyTimer);
      })
      .catch((err) => {
        setError(err.message);
        setChecking(false);
        clearTimeout(safetyTimer);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.navigate('/');
          setUser(null);
        } else if (session?.user) {
          setUser(session.user);
          
          const hasCompleted = await checkProfileCompletion(session.user.id);
          const path = window.location.pathname;

          const isFinishingFlow = 
            path.includes('onboarding') || 
            path.includes('login') || 
            path.includes('paywall') || 
            path.includes('signup');

          if (!hasCompleted && !isFinishingFlow) {
            router.navigate('/onboarding/welcome');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  useEffect(() => {
    if (!checking && user) {
      const OneSignal = (window as any).OneSignal;
      if (OneSignal) {
        OneSignal.login(user.id);
      }
    }
  }, [checking, user]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0a1e] p-4 text-center">
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-red-400">Connection Error</h1>
          <p className="text-white/60 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-purple-500 text-white rounded-full">Retry</button>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0a1e]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-purple-300 font-medium">Aligning with the stars...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <UserDataProvider>
        <RouterProvider router={router} />
      </UserDataProvider>
    </ErrorBoundary>
  );
}