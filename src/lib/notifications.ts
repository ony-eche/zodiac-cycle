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
  lastPeriodStart?: Date;
  sun_sign?: string;
  moon_sign?: string;
}

function getCycleInfo(lastPeriodStart?: Date) {
  if (!lastPeriodStart) return { cycleDay: 14, daysUntilPeriod: 14, phase: 'luteal' };
  const cycleDay = Math.max(1, differenceInDays(new Date(), new Date(lastPeriodStart)) % 28 + 1);
  const daysUntilPeriod = 28 - cycleDay;
  const ovulationDay = 28 - 14;
  let phase = 'luteal';
  if (cycleDay <= 5) phase = 'menstrual';
  else if (cycleDay <= 13) phase = 'follicular';
  else if (cycleDay <= 16) phase = 'ovulation';
  return { cycleDay, daysUntilPeriod, phase, ovulationDay };
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
  const currentPhaseStart = phaseChangeDay[phase];
  if (cycleDay === currentPhaseStart) {
    const phaseNames: Record<string, string> = {
      menstrual: t('cycle.phases.menstrual'),
      follicular: t('cycle.phases.follicular'),
      ovulation: t('cycle.phases.ovulation'),
      luteal: t('cycle.phases.luteal'),
    };
    notifications.push({
      id: `phase-change-${today}`,
      type: 'phase',
      title: t('notifications.phaseChangeTitle'),
      body: t('notifications.phaseChangeBody', { phase: phaseNames[phase] }),
      icon: '✨',
      time: now,
      unread: true,
      action: 'cycle',
    });
  }

  // ── 4. New AI predictions ───────────────────────────────────────────────────
  const predictions = getCachedPredictions();
  if (predictions && predictions.length > 0) {
    const unreadPredictions = predictions.filter(p => p.unread);
    if (unreadPredictions.length > 0) {
      notifications.push({
        id: `predictions-${today}`,
        type: 'prediction',
        title: t('notifications.predictionsTitle'),
        body: t('notifications.predictionsBody', { count: unreadPredictions.length }),
        icon: '🔮',
        time: now,
        unread: true,
        action: 'messages',
      });
    }
  } else {
    // No predictions generated yet — prompt user
    notifications.push({
      id: `predictions-empty-${today}`,
      type: 'prediction',
      title: t('notifications.predictionsTitle'),
      body: t('notifications.predictionsEmpty'),
      icon: '🔮',
      time: now,
      unread: false,
      action: 'messages',
    });
  }

  // ── 5. Active transit alert (based on sun/moon sign) ───────────────────────
  if (userData.sun_sign) {
    // Check localStorage for cached transits
    try {
      const cachedTransits = localStorage.getItem('zodiac_transits_summary');
      if (cachedTransits) {
        const { count, topAspect, date } = JSON.parse(cachedTransits);
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
    } catch { /* no cached transits yet */ }
  }

  return notifications;
}

// Save transit summary when TransitsTab loads (call this from TransitsTab)
export function cacheTransitSummary(count: number, topAspect?: string) {
  try {
    localStorage.setItem('zodiac_transits_summary', JSON.stringify({
      count,
      topAspect,
      date: format(new Date(), 'yyyy-MM-dd'),
    }));
  } catch { /* ignore */ }
}