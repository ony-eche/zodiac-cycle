import { differenceInDays, addDays, format } from 'date-fns';
import { getCachedPredictions } from './predictions';

export type NotificationType = 'period' | 'prediction' | 'transit' | 'phase' | 'ovulation';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon: string;
  time: string;
  unread: boolean;
  action?: 'messages' | 'transits' | 'cycle';
}

interface UserData {
  lastPeriodStart?: Date | string; // Handled both types for safety
  sun_sign?: string;
  moon_sign?: string;
}

function getCycleInfo(lastPeriodStart?: Date | string) {
  if (!lastPeriodStart) return { cycleDay: 1, daysUntilPeriod: 14, phase: 'unknown' };
  
  const start = new Date(lastPeriodStart);
  const cycleDay = Math.max(1, (differenceInDays(new Date(), start) % 28) + 1);
  const daysUntilPeriod = 28 - cycleDay;
  
  let phase = 'luteal';
  if (cycleDay <= 5) phase = 'menstrual';
  else if (cycleDay <= 13) phase = 'follicular';
  else if (cycleDay <= 16) phase = 'ovulation';
  
  return { cycleDay, daysUntilPeriod, phase };
}

export function generateNotifications(
  userData: UserData,
  t: (key: string, opts?: any) => string,
): AppNotification[] {
  const notifications: AppNotification[] = [];
  const { cycleDay, daysUntilPeriod, phase } = getCycleInfo(userData.lastPeriodStart);
  const now = format(new Date(), 'h:mm a');
  const today = format(new Date(), 'MMM d');

  // ── 1. Period due soon ──────────────────────────────────────────────────────
  if (daysUntilPeriod <= 3 && daysUntilPeriod >= 0) {
    const nextPeriodDate = userData.lastPeriodStart
      ? format(addDays(new Date(userData.lastPeriodStart), 28), 'MMM d')
      : today;
      
    notifications.push({
      id: `period-soon-${today}`,
      type: 'period',
      title: t('notifications.periodSoonTitle'),
      body: daysUntilPeriod === 0
        ? t('notifications.periodToday')
        : t('notifications.periodSoonBody', { days: daysUntilPeriod, date: nextPeriodDate }),
      icon: '🔴',
      time: now,
      unread: true,
      action: 'cycle',
    });
  }

  // ── 2. Ovulation window ─────────────────────────────────────────────────────
  if (cycleDay >= 12 && cycleDay <= 17) {
    const daysToOvulation = 14 - cycleDay;
    notifications.push({
      id: `ovulation-${today}`,
      type: 'ovulation',
      title: t('notifications.ovulationTitle'),
      body: daysToOvulation === 0
        ? t('notifications.ovulationToday')
        : daysToOvulation > 0
          ? t('notifications.ovulationSoon', { days: daysToOvulation })
          : t('notifications.ovulationPeak'),
      icon: '🌕',
      time: now,
      unread: true,
      action: 'cycle',
    });
  }

  // ── 3. Cycle phase change ───────────────────────────────────────────────────
  const phaseChangeDay: Record<string, number> = { menstrual: 1, follicular: 6, ovulation: 14, luteal: 17 };
  if (cycleDay === phaseChangeDay[phase]) {
    notifications.push({
      id: `phase-change-${today}`,
      type: 'phase',
      title: t('notifications.phaseChangeTitle'),
      body: t('notifications.phaseChangeBody', { phase: t(`cycle.phases.${phase}`) }),
      icon: '✨',
      time: now,
      unread: true,
      action: 'cycle',
    });
  }

  // ── 4. New AI predictions ───────────────────────────────────────────────────
  const predictions = getCachedPredictions();
  if (predictions && predictions.length > 0) {
    const unreadCount = predictions.filter(p => p.unread).length;
    if (unreadCount > 0) {
      notifications.push({
        id: `predictions-${today}`,
        type: 'prediction',
        title: t('notifications.predictionsTitle'),
        body: t('notifications.predictionsBody', { count: unreadCount }),
        icon: '🔮',
        time: now,
        unread: true,
        action: 'messages',
      });
    }
  }

  // ── 5. Active transit alert ────────────────────────────────────────────────
  if (userData.sun_sign) {
    try {
      const cached = localStorage.getItem('zodiac_transits_summary');
      if (cached) {
        const { count, topAspect, date } = JSON.parse(cached);
        if (date === format(new Date(), 'yyyy-MM-dd') && count > 0) {
          notifications.push({
            id: `transits-${today}`,
            type: 'transit',
            title: t('notifications.transitsTitle', { count }),
            body: topAspect 
              ? t('notifications.transitsBody', { aspect: topAspect })
              : t('notifications.transitsBodyGeneric'),
            icon: '⭐',
            time: now,
            unread: false,
            action: 'transits',
          });
        }
      }
    } catch { /* Silent fail */ }
  }

  return notifications;
}

export function cacheTransitSummary(count: number, topAspect?: string) {
  try {
    localStorage.setItem('zodiac_transits_summary', JSON.stringify({
      count,
      topAspect,
      date: format(new Date(), 'yyyy-MM-dd'),
    }));
  } catch { /* ignore */ }
}