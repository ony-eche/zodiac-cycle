import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { UserDataProvider } from './context/UserDataContext';
import { supabase } from '../lib/supabase';

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
    // Check if service worker is ready
    if (!navigator.serviceWorker) {
      console.log('Service Worker not supported');
      return false;
    }
    
    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();
    
    if (existingSubscription) {
      console.log('Already subscribed to push notifications');
      return true;
    }
    
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('VAPID_PUBLIC_KEY not set in environment');
      return false;
    }
    
    // Convert the VAPID key to the correct format
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer
    });
    
    // Send subscription to your worker
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
    
    if (response.ok) {
      console.log('Push subscription saved successfully');
      return true;
    } else {
      console.error('Failed to save push subscription');
      return false;
    }
  } catch (error) {
    console.error('Push registration failed:', error);
    return false;
  }
}

// Request notification permission
async function requestNotificationPermission(userId: string) {
  // Check if browser supports notifications
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  // Check if we're running as a PWA (installed to home screen)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  console.log('Notification check:', {
    isStandalone,
    isIOS,
    permission: Notification.permission
  });
  
  // On iOS, push only works when installed to home screen
  if (isIOS && !isStandalone) {
    console.log('iOS: App not installed to home screen, push notifications not available');
    // You could show a prompt here telling users to add to home screen
    return false;
  }
  
  // Check current permission status
  if (Notification.permission === 'granted') {
    console.log('Notification permission already granted');
    await registerPushSubscription(userId);
    return true;
  }
  
  if (Notification.permission === 'denied') {
    console.log('Notification permission denied');
    return false;
  }
  
  // Permission is 'default' - need to ask
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted!');
      await registerPushSubscription(userId);
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export default function App() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);

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
        if (event === 'SIGNED_OUT') {
          router.navigate('/');
        }
        // Set user when signed in
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Request notification permission when user is logged in and app is ready
  useEffect(() => {
    if (!checking && user) {
      // Small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        requestNotificationPermission(user.id);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [checking, user]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
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