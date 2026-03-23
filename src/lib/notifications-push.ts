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
    console.log('1. Starting push permission for user:', userId);
    
    if (!('Notification' in window)) { console.log('FAIL: No Notification'); return false; }
    if (!('serviceWorker' in navigator)) { console.log('FAIL: No SW'); return false; }
    if (!('PushManager' in window)) { console.log('FAIL: No PushManager'); return false; }
    if (!VAPID_PUBLIC_KEY) { console.log('FAIL: No VAPID key. Value:', VAPID_PUBLIC_KEY); return false; }
    
    console.log('2. VAPID key present:', VAPID_PUBLIC_KEY.slice(0, 20) + '...');
    
    let permission = Notification.permission;
    console.log('3. Current permission:', permission);
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') { console.log('FAIL: Permission not granted:', permission); return false; }
    
    console.log('4. Permission granted, getting SW...');
    
    let registration: ServiceWorkerRegistration;
    try {
      registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 5000)),
      ]) as ServiceWorkerRegistration;
      console.log('5. SW ready:', registration.scope);
    } catch (err) {
      console.error('FAIL: SW not ready:', err);
      return false;
    }

    const existing = await registration.pushManager.getSubscription();
    console.log('6. Existing subscription:', existing ? 'YES' : 'NO');
    
    if (existing) {
      console.log('7. Saving existing subscription...');
      const res = await fetch(`${WORKER_URL}/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription: existing }),
      });
      console.log('8. Save result:', res.ok, res.status);
      return res.ok;
    }

    console.log('7. Creating new subscription...');
    const vapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey.buffer.slice(vapidKey.byteOffset, vapidKey.byteOffset + vapidKey.byteLength) as ArrayBuffer,
    });
    console.log('8. Subscription created:', subscription.endpoint.slice(0, 50));

    const res = await fetch(`${WORKER_URL}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subscription }),
    });
    console.log('9. Save result:', res.ok, res.status, await res.text());
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
