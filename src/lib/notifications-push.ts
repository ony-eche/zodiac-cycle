const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestPushPermission(userId: string): Promise<boolean> {
  try {
    // ── Check browser support ──────────────────────────────────────────────
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }
    if (!('serviceWorker' in navigator)) {
      console.warn('Service worker not supported');
      return false;
    }
    if (!('PushManager' in window)) {
      console.warn('Push not supported');
      return false;
    }
    if (!VAPID_PUBLIC_KEY) {
      console.warn('VAPID public key not configured');
      return false;
    }

    // ── iOS PWA requires permission from a direct user gesture ─────────────
    // Must be called synchronously within a tap handler — never from useEffect
    let permission = Notification.permission;
    if (permission === 'default') {
      // This MUST be called directly inside a button onClick handler
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      console.warn('Notification permission:', permission);
      return false;
    }

    // ── Wait for service worker to be ready ────────────────────────────────
    let registration: ServiceWorkerRegistration;
    try {
      // Give it up to 5 seconds to be ready
      registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('SW timeout')), 5000)
        ),
      ]) as ServiceWorkerRegistration;
    } catch (err) {
      console.error('Service worker not ready:', err);
      // Try registering it manually as fallback
      try {
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
      } catch {
        console.error('Could not register service worker');
        return false;
      }
    }

    // ── Check for existing subscription first ──────────────────────────────
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      // Already subscribed — just save to backend
      const res = await fetch(`${WORKER_URL}/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription: existing }),
      });
      return res.ok;
    }

    // ── Create new subscription ────────────────────────────────────────────
    const vapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: vapidKey.buffer.slice(
    vapidKey.byteOffset,
    vapidKey.byteOffset + vapidKey.byteLength
  ) as ArrayBuffer,
}); 

    // ── Save to backend ────────────────────────────────────────────────────
    const res = await fetch(`${WORKER_URL}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subscription }),
    });

    if (res.ok) {
      console.log('Push subscription saved successfully');
    } else {
      console.error('Failed to save push subscription:', await res.text());
    }

    return res.ok;
  } catch (err) {
    console.error('Push subscription failed:', err);
    return false;
  }
}

export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) return true;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true;

    await fetch(`${WORKER_URL}/push/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, endpoint: subscription.endpoint }),
    });

    await subscription.unsubscribe();
    return true;
  } catch {
    return false;
  }
}

export async function isPushSubscribed(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

export async function saveNotificationPreferences(
  userId: string,
  preferences: Record<string, any>
): Promise<boolean> {
  try {
    const res = await fetch(`${WORKER_URL}/notifications/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, preferences }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
