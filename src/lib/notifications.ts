import { differenceInDays, addDays, format } from 'date-fns';
import { getCachedPredictions } from './predictions';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export type NotificationType =
  | 'period'
  | 'prediction'
  | 'transit'
  | 'phase'
  | 'ovulation'
  | 'nudge';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon: string;
  time: string;
  unread: boolean;
  push?: boolean;
  action?: 'messages' | 'transits' | 'cycle';
}

interface UserData {
  lastPeriodStart?: Date | string;
  sun_sign?: string;
  moon_sign?: string;
  lastLoggedDate?: string;
}

// 🔥 SAFE prediction shape (prevents TS errors)
type Prediction = {
  id?: string;
  text?: string;
  message?: string;
  content?: string;
  unread?: boolean;
};

// ─────────────────────────────────────────
// SAFE DATE PARSER
// ─────────────────────────────────────────
function safeDate(date?: Date | string) {
  if (!date) return null;
  return new Date(typeof date === 'string' ? date + 'T00:00:00' : date);
}

// ─────────────────────────────────────────
// CYCLE INFO
// ─────────────────────────────────────────
function getCycleInfo(lastPeriodStart?: Date | string) {
  const start = safeDate(lastPeriodStart);
  if (!start) return { cycleDay: 1, daysUntilPeriod: 14, phase: 'unknown' };

  const cycleDay = Math.max(1, (differenceInDays(new Date(), start) % 28) + 1);
  const daysUntilPeriod = 28 - cycleDay;

  let phase = 'luteal';
  if (cycleDay <= 5) phase = 'menstrual';
  else if (cycleDay <= 13) phase = 'follicular';
  else if (cycleDay <= 16) phase = 'ovulation';

  return { cycleDay, daysUntilPeriod, phase };
}

// ─────────────────────────────────────────
// MAIN GENERATOR
// ─────────────────────────────────────────
export async function saveNotificationPreferences(
  userId: string,
  preferences: {
    push: boolean;
    email: boolean;
    periodReminder: boolean;
    ovulationAlert: boolean;
    phaseChange: boolean;
    dailyInsights: boolean;
    frequency?: string;
  }
) {
  try {
    const res = await fetch('/notifications/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, preferences }),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to save notification preferences:', err);
    return false;
  }
}
export function cacheTransitSummary(userId: string, summary: string) {
  try {
    const key = `zodiac_transit_${userId}`;

    const payload = {
      summary,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(payload));

    return true;
  } catch (err) {
    console.error('Failed to cache transit summary:', err);
    return false;
  }
}
export function generateNotifications(
  userData: UserData,
  t: (key: string, opts?: any) => string,
): AppNotification[] {
  const notifications: AppNotification[] = [];

  const { cycleDay, daysUntilPeriod, phase } = getCycleInfo(userData.lastPeriodStart);
  const now = format(new Date(), 'h:mm a');
  const today = format(new Date(), 'MMM d');

  // ── 1. PERIOD (PUSH)
  if (daysUntilPeriod <= 3 && daysUntilPeriod >= 0) {
    notifications.push({
      id: `period-${today}`,
      type: 'period',
      title: t('notifications.periodSoonTitle'),
      body:
        daysUntilPeriod === 0
          ? t('notifications.periodToday')
          : t('notifications.periodSoonBody', { days: daysUntilPeriod }),
      icon: '🔴',
      time: now,
      unread: true,
      push: true,
      action: 'cycle',
    });
  }

  // ── 2. OVULATION (PUSH)
  if (cycleDay >= 12 && cycleDay <= 17) {
    notifications.push({
      id: `ovulation-${today}`,
      type: 'ovulation',
      title: 'Ovulation window 🌿',
      body:
        cycleDay === 14
          ? 'You are at peak fertility today'
          : 'Fertile window is active',
      icon: '🌕',
      time: now,
      unread: true,
      push: true,
      action: 'cycle',
    });
  }

  // ── 3. PHASE CHANGE (PUSH)
  const phaseDays: Record<string, number> = {
    menstrual: 1,
    follicular: 6,
    ovulation: 14,
    luteal: 17,
  };

  if (cycleDay === phaseDays[phase]) {
    notifications.push({
      id: `phase-${today}`,
      type: 'phase',
      title: 'New phase started ✨',
      body: `You're now in your ${phase} phase`,
      icon: '✨',
      time: now,
      unread: true,
      push: true,
      action: 'cycle',
    });
  }

  // ── 4. AI PREDICTIONS (🔥 PREMIUM PUSH)
  const predictions = getCachedPredictions() as Prediction[] | null;

  if (predictions?.length) {
    const top = predictions[0];

    const predictionText =
      top?.message ||
      top?.text ||
      top?.content ||
      'New personalized insight available';

    notifications.push({
      id: `ai-${today}`,
      type: 'prediction',
      title: 'Your body today 🔮',
      body: predictionText,
      icon: '🔮',
      time: now,
      unread: true,
      push: true,
      action: 'messages',
    });
  }

  // ── 5. BEHAVIORAL NUDGE (🔥 RETENTION)
  if (userData.lastLoggedDate) {
    const lastLog = safeDate(userData.lastLoggedDate);
    const daysMissed = lastLog ? differenceInDays(new Date(), lastLog) : 0;

    if (daysMissed >= 1) {
      notifications.push({
        id: `nudge-${today}`,
        type: 'nudge',
        title: 'Don’t forget to log today 💖',
        body: 'Tracking daily improves your predictions ✨',
        icon: '📝',
        time: now,
        unread: true,
        push: true,
        action: 'cycle',
      });
    }
  }

  // ── 6. TRANSITS (IN-APP ONLY)
  if (userData.sun_sign) {
    try {
      const cached = localStorage.getItem('zodiac_transits_summary');
      if (cached) {
        const { count } = JSON.parse(cached);

        if (count > 0) {
          notifications.push({
            id: `transit-${today}`,
            type: 'transit',
            title: `${count} cosmic events today`,
            body: 'Your astrology is active ✨',
            icon: '⭐',
            time: now,
            unread: false,
            push: false,
            action: 'transits',
          });
        }
      }
    } catch {
      // silent fail
    }
  }

  return notifications;
}

// ─────────────────────────────────────────
// PUSH QUEUE BUILDER (FOR BACKEND)
// ─────────────────────────────────────────
export function buildPushQueue(
  userData: UserData,
  t: (key: string, opts?: any) => string,
) {
  return generateNotifications(userData, t).filter(n => n.push);
}