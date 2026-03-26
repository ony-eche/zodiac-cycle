// src/types/onesignal.d.ts
interface OneSignal {
  login(userId: string): Promise<void>;
  logout(): Promise<void>;
  setExternalUserId(userId: string): Promise<void>;
  getExternalUserId(): Promise<string | null>;
}

interface Window {
  OneSignal?: OneSignal;
  OneSignalDeferred?: Array<(OneSignal: OneSignal) => void>;
}