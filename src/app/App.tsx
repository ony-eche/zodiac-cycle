import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { UserDataProvider } from './context/UserDataContext';
import { supabase } from '../lib/supabase';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('[App] Module loading...');

// Helper: Convert base64 URL safe string to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper: Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Register push subscription with your worker
async function registerPushSubscription(userId: string) {
  try {
    if (!navigator.serviceWorker) {
      console.log('Service Worker not supported');
      return false;
    }

    // FIX: Don't wait forever for the Service Worker. 
    // If it's not ready in 3 seconds, move on.
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('SW Timeout')), 3000))
    ]) as ServiceWorkerRegistration;

    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Already subscribed to push notifications');
      return true;
    }

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('VAPID_PUBLIC_KEY not set');
      return false;
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer
    });

    const response = await fetch(`${import.meta.env.VITE_WORKER_URL}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: arrayBufferToBase64(subscription.getKey('auth'))
          }
        }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Push registration failed:', error);
    return false;
  }
}

async function requestNotificationPermission(userId: string) {
  if (!('Notification' in window)) return false;

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS && !isStandalone) {
    console.log('iOS: App must be installed for push.');
    return false;
  }

  if (Notification.permission === 'granted') {
    await registerPushSubscription(userId);
    return true;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerPushSubscription(userId);
      return true;
    }
  } catch (error) {
    console.error('Permission request error:', error);
  }
  return false;
}

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
    console.log('[App] Initializing auth...');

    // 🔥 THE SAFETY SWITCH: Force "checking" to false after 4 seconds
    const safetyTimer = setTimeout(() => {
      if (checking) {
        console.warn('[App] Safety timeout triggered. Showing app anyway.');
        setChecking(false);
      }
    }, 4000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          // Only redirect if on root
          if (window.location.pathname === '/') {
            router.navigate('/dashboard');
          }
        }
        setChecking(false);
        clearTimeout(safetyTimer);
      })
      .catch((err) => {
        console.error('[App] Auth error:', err);
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
          if (!hasCompleted && !path.includes('onboarding') && !path.includes('login')) {
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

  // Request notifications after login
  useEffect(() => {
    if (!checking && user) {
      const timer = setTimeout(() => requestNotificationPermission(user.id), 2000);
      return () => clearTimeout(timer);
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