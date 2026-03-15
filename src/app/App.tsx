import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { UserDataProvider } from './context/UserDataContext';
import { supabase } from '../lib/supabase';

export default function App() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const path = window.location.pathname;
      const onboardingPaths = ['/onboarding', '/signup', '/login'];
      const isOnboarding = onboardingPaths.some(p => path.startsWith(p));

      // Only redirect to dashboard if they're on the landing page
      // and have an active session — never interrupt onboarding
      if (session && path === '/') {
        router.navigate('/dashboard');
      }

      setChecking(false);
    });

    // Listen for auth changes but don't redirect during onboarding
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const path = window.location.pathname;
        if (event === 'SIGNED_OUT') {
          router.navigate('/');
        }
        // Don't redirect on SIGNED_IN during onboarding flow
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserDataProvider>
      <RouterProvider router={router} />
    </UserDataProvider>
  );
}
