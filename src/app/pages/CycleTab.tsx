import { useState, useCallback, useMemo, useRef, useEffect, lazy, Suspense } from 'react';
import { useUserData } from '../context/UserDataContext';
import {
  format, addDays, differenceInDays, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, addMonths, subMonths, isToday,
  startOfWeek, endOfWeek,
} from 'date-fns';
import { X, Check, Trash2, Edit3, ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdBanner = lazy(() => import('../components/AdBanner').then(m => ({ default: m.AdBanner })));

interface DayLog {
  date: string; flow?: 'light' | 'medium' | 'heavy' | 'spotting';
  mood?: string; symptoms?: string[]; notes?: string;
}
interface PeriodEntry { id: string; start: string; end: string; }
function triggerHaptic() {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
}
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // ✅ LOCAL time (safe)
}
function generateId() { return Math.random().toString(36).slice(2, 9); }
function getSymptomInsights(logs: Record<string, DayLog>, cycleInfo: any) {
  const phaseMap: Record<string, Record<string, number>> = {};

  Object.values(logs).forEach(log => {
    if (!log.symptoms) return;

    const date = parseLocalDate(log.date);
    const status = getDayStatus(date, cycleInfo);

    const phase =
      status === 'period' ? 'menstrual' :
      status === 'fertile' ? 'fertile' :
      status === 'ovulation' ? 'ovulation' :
      'luteal';

    if (!phaseMap[phase]) phaseMap[phase] = {};

    log.symptoms.forEach(s => {
      phaseMap[phase][s] = (phaseMap[phase][s] || 0) + 1;
    });
  });

  return phaseMap;
}
function calculateCycleInfo(rawPeriods: PeriodEntry[] = [], currentDate: Date = new Date()) {
  if (!rawPeriods || rawPeriods.length === 0) {
    return {
      cycleDay: 1,
      nextPeriod: addDays(currentDate, 14),
      cycleLength: 28,
      periodLength: 5,
      phase: 'unknown',
      ovulationDay: 14,
      fertileStart: 9,
      fertileEnd: 15,
      lastStart: null,
      accuracy: 0,
      mergedPeriods: [],
      isCurrentlyLogged: false,
      isIrregular: false,
      variation: 0,
      anomaly: false,
    };
  }

  const sorted = [...rawPeriods].sort(
    (a, b) => parseLocalDate(a.start).getTime() - parseLocalDate(b.start).getTime()
  );

  const lastPeriod = sorted[sorted.length - 1];
  const lastStart = parseLocalDate(lastPeriod.start);
  const lastEnd = parseLocalDate(lastPeriod.end || lastPeriod.start);

  const today = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  let avgCycleLength = 28;
  const lengths: number[] = [];

  if (sorted.length >= 2) {
    for (let i = 1; i < sorted.length; i++) {
      const diff = differenceInDays(
        parseLocalDate(sorted[i].start),
        parseLocalDate(sorted[i - 1].start)
      );
      if (diff >= 20 && diff <= 45) lengths.push(diff);
    }

    if (lengths.length > 0) {
      const weighted = lengths.map((len, i) => len * (i + 1));
      const totalWeight = lengths.reduce((sum, _, i) => sum + (i + 1), 0);

      avgCycleLength = Math.round(
        weighted.reduce((a, b) => a + b, 0) / totalWeight
      );
    }
  }

  // ✅ Variation + irregular
  const variation =
    lengths.length > 1
      ? Math.max(...lengths) - Math.min(...lengths)
      : 0;

const isIrregular =
  variation > 7 || lengths.filter(l => l < 21 || l > 40).length >= 2;

  // ✅ Anomaly detection
  const lastCycleLength = lengths[lengths.length - 1];
 const anomaly =
  lastCycleLength !== undefined &&
  Math.abs(lastCycleLength - avgCycleLength) > 7;

  const avgPeriodLength = Math.max(1, differenceInDays(lastEnd, lastStart) + 1);
  const daysSinceLast = differenceInDays(today, lastStart);

 const cycleDay =
  ((daysSinceLast % avgCycleLength) + avgCycleLength) % avgCycleLength + 1;

// 🧠 Smarter ovulation prediction (premium feel)
const ovulationDay = Math.round(avgCycleLength - 14);

  const isCurrentlyLogged = sorted.some(p => {
    const s = parseLocalDate(p.start);
    const e = parseLocalDate(p.end || p.start);
    return today >= s && today <= e;
  });

  let phase = 'luteal';
  if (isCurrentlyLogged) phase = 'menstrual';
else if (cycleDay < ovulationDay - 5) phase = 'follicular';
else if (cycleDay <= ovulationDay + 1) phase = 'ovulation';
else phase = 'luteal';


const predictedLength =
  anomaly
    ? avgCycleLength
    : lastCycleLength && Math.abs(lastCycleLength - avgCycleLength) <= 7
      ? lastCycleLength
      : avgCycleLength;
const accuracy =
  lengths.length === 0
    ? 50
    : Math.max(
        50,
        Math.min(95, 85 - variation * 3 + lengths.length * 5)
      );
return {
  cycleDay,
  nextPeriod: addDays(lastStart, predictedLength),
  cycleLength: avgCycleLength,
    periodLength: avgPeriodLength,
    phase,
    ovulationDay,
    fertileStart: ovulationDay - 5,
    fertileEnd: ovulationDay + 1,
    lastStart,
    accuracy: Math.min(95, 50 + lengths.length * 15),
    mergedPeriods: sorted,
    isCurrentlyLogged,
    isIrregular,
    variation,
    anomaly,
  };
}

function getDayStatus(date: Date, cycleInfo: any): 'period' | 'predicted' | 'fertile' | 'ovulation' | 'normal' {
  const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const isPeriod = cycleInfo.mergedPeriods.some((p: PeriodEntry) => {
    const s = parseLocalDate(p.start);
    const e = parseLocalDate(p.end || p.start);
    return cleanDate >= s && cleanDate <= e;
  });

  if (isPeriod) return 'period';

  if (cycleInfo.lastStart) {
    const daysSinceLast = differenceInDays(cleanDate, cycleInfo.lastStart);
    const pos =
      ((daysSinceLast % cycleInfo.cycleLength) + cycleInfo.cycleLength) %
      cycleInfo.cycleLength;

    if (pos === cycleInfo.ovulationDay) return 'ovulation';
    if (pos >= cycleInfo.fertileStart && pos <= cycleInfo.fertileEnd) return 'fertile';
    const daysToNext = cycleInfo.cycleLength - pos;

if (daysToNext <= cycleInfo.periodLength) return 'predicted';
  }

  return 'normal';
}

const PHASE_INSIGHTS: Record<string, { emoji: string; gradientFrom: string; gradientTo: string; textColor: string; label: string }> = {
  menstrual:  { emoji: '🔴', gradientFrom: '#ff6b8a', gradientTo: '#ff8fa3', textColor: '#fff', label: 'Menstruating' },
  follicular: { emoji: '🌸', gradientFrom: '#c084fc', gradientTo: '#e879f9', textColor: '#fff', label: 'Follicular Phase' },
  ovulation:  { emoji: '⭐', gradientFrom: '#f59e0b', gradientTo: '#fbbf24', textColor: '#fff', label: 'Ovulating' },
  luteal:     { emoji: '🌙', gradientFrom: '#818cf8', gradientTo: '#a5b4fc', textColor: '#fff', label: 'Luteal Phase' },
  unknown:    { emoji: '✨', gradientFrom: '#c084fc', gradientTo: '#818cf8', textColor: '#fff', label: 'Track Your Cycle' },
};

// ─── Notification Helper ──────────────────────────────────────────────────────


function scheduleNotifications(cycleInfo: any) {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (!cycleInfo.lastStart) return;

  // We use localStorage to store scheduled notification timestamps
  // The actual firing happens via the Cloudflare Worker cron — 
  // here we just save the target dates so the worker knows what to send.
  const today = new Date();
  const nextPeriod = cycleInfo.nextPeriod as Date;
  const daysToNext = differenceInDays(nextPeriod, today);
 const fertileStart = cycleInfo.lastStart
  ? addDays(cycleInfo.lastStart, cycleInfo.fertileStart)
  : null;
const daysToFertile = fertileStart
  ? differenceInDays(fertileStart, today)
  : null;

 const schedule = {
  periodReminder: daysToNext > 0 
    ? format(addDays(nextPeriod, -3), 'yyyy-MM-dd') // 🔥 FIXED
    : null,

  fertileReminder: fertileStart
    ? format(addDays(fertileStart, -1), 'yyyy-MM-dd') // 🔥 FIXED
    : null,

  dailyLogReminder: format(today, 'yyyy-MM-dd'),

  cycleLength: cycleInfo.cycleLength,
  nextPeriodDate: format(nextPeriod, 'yyyy-MM-dd'),

  fertileStartDate: fertileStart
    ? format(fertileStart, 'yyyy-MM-dd')
    : null,
};
const enhancedSchedule = {
  ...schedule,
  cycleDay: cycleInfo.cycleDay,
  phase: cycleInfo.phase,
  isIrregular: cycleInfo.isIrregular,
  updatedAt: new Date().toISOString(),
};

localStorage.setItem('zodiac_notification_schedule', JSON.stringify(enhancedSchedule));

}

// ─── Log Modal ────────────────────────────────────────────────────────────────
function LogModal({ date, log, onSave, onClose }: {
  date: Date; log: DayLog; onSave: (log: DayLog) => void; onClose: () => void;
}) {
  const [draft, setDraft] = useState<DayLog>({ ...log, date: format(date, 'yyyy-MM-dd') });
  const MOODS = ['😊', '😔', '😤', '😰', '😴', '⚡', '💆', '🤯'];
  const MOOD_LABELS = ['Happy', 'Sad', 'Irritable', 'Anxious', 'Tired', 'Energetic', 'Calm', 'Overwhelmed'];
  const SYMPTOMS = ['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Backache', 'Nausea', 'Tender breasts', 'Cravings', 'Insomnia', 'Acne', 'Mood swings', 'Spotting'];
  const toggle = (v: string) => {
    const arr = draft.symptoms || [];
    setDraft({ ...draft, symptoms: arr.includes(v) ? arr.filter(s => s !== v) : [...arr, v] });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl p-6 space-y-5 max-h-[88vh] overflow-y-auto"
        style={{ background: 'rgba(255,245,250,0.97)' }} onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full bg-rose-200 mx-auto" />
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-rose-700">{format(date, 'EEEE, MMMM d')}</h3>
            <p className="text-xs text-rose-400">How are you feeling?</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-100 rounded-xl"><X className="w-4 h-4 text-rose-300" /></button>
        </div>
        <div>
          <p className="text-xs font-bold text-rose-600 mb-2 uppercase tracking-wide">Flow</p>
          <div className="flex gap-2">
            {(['spotting', 'light', 'medium', 'heavy'] as const).map((f, i) => {
              const sizes = [16, 40, 65, 90];
              const active = draft.flow === f;
              return (
                <button key={f} onClick={() => setDraft({ ...draft, flow: active ? undefined : f })}
                  className={`flex-1 py-3 rounded-2xl text-xs font-medium transition-all border-2 ${active ? 'border-rose-400 bg-rose-50 scale-105' : 'border-transparent bg-white hover:border-rose-200'}`}>
                  <div className="relative w-6 h-7 mx-auto mb-1">
                    <svg viewBox="0 0 24 28" className="w-full h-full">
                      <path d="M12 1 C12 1 3 12 3 17 C3 23 7 26 12 26 C17 26 21 23 21 17 C21 12 12 1 12 1Z" fill="rgba(251,191,204,0.3)" stroke="rgba(251,191,204,0.5)" strokeWidth="1" />
                      <clipPath id={`f-${f}`}><rect x="0" y={28 - 28 * sizes[i] / 100} width="24" height="28" /></clipPath>
                      <path d="M12 1 C12 1 3 12 3 17 C3 23 7 26 12 26 C17 26 21 23 21 17 C21 12 12 1 12 1Z" fill="#f43f5e" clipPath={`url(#f-${f})`} opacity="0.8" />
                    </svg>
                  </div>
                  <span className={`text-[10px] capitalize ${active ? 'text-rose-500 font-bold' : 'text-gray-400'}`}>{f}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-rose-600 mb-2 uppercase tracking-wide">Mood</p>
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map((e, i) => (
              <button key={e} onClick={() => setDraft({ ...draft, mood: draft.mood === MOOD_LABELS[i] ? undefined : MOOD_LABELS[i] })}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all border-2 ${draft.mood === MOOD_LABELS[i] ? 'border-pink-300 bg-pink-50 scale-105' : 'border-transparent bg-white hover:border-pink-200'}`}>
                <span className="text-xl">{e}</span>
                <span className="text-[9px] text-gray-400">{MOOD_LABELS[i]}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-rose-600 mb-2 uppercase tracking-wide">Symptoms</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map(s => (
              <button key={s} onClick={() => toggle(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${(draft.symptoms || []).includes(s) ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-500 hover:border-rose-300'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-rose-600 mb-2 uppercase tracking-wide">Notes</p>
          <textarea value={draft.notes || ''} onChange={e => setDraft({ ...draft, notes: e.target.value })}
            placeholder="How are you feeling today?"
            className="w-full p-3 rounded-2xl border border-gray-200 bg-white text-sm resize-none h-20 focus:outline-none focus:border-rose-300 text-gray-700 placeholder:text-gray-300" />
        </div>
        <button onClick={() => { onSave(draft); onClose(); }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold shadow-lg shadow-rose-100 flex items-center justify-center gap-2">
          <Check className="w-4 h-4" /> Save Day
        </button>
      </div>
    </div>
  );
}

// ─── Edit Period Modal ────────────────────────────────────────────────────────
function EditPeriodModal({ period, onSave, onDelete, onClose }: {
  period: PeriodEntry; onSave: (p: PeriodEntry) => void;
  onDelete: (id: string) => void; onClose: () => void;
}) {
  const [start, setStart] = useState(period.start);
  const [end, setEnd] = useState(period.end);
  const [error, setError] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-5" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl"
        style={{ background: 'rgba(255,245,250,0.97)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-rose-700">Edit Period</h3>
          <button onClick={onClose} className="p-2 hover:bg-rose-100 rounded-xl"><X className="w-4 h-4 text-rose-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-rose-400 font-semibold mb-1 block">Start Date</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)}
              className="w-full p-3 rounded-2xl border border-rose-200 bg-white text-sm focus:outline-none focus:border-rose-400" />
          </div>
          <div>
            <label className="text-xs text-rose-400 font-semibold mb-1 block">End Date</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)}
              className="w-full p-3 rounded-2xl border border-rose-200 bg-white text-sm focus:outline-none focus:border-rose-400" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { onDelete(period.id); onClose(); }}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-rose-100 text-rose-500 text-sm font-semibold hover:bg-rose-200 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
         <button
 onClick={() => {
  if (parseLocalDate(end) < parseLocalDate(start)) {
    setError('End date cannot be before start date');
    return;
  }

  setError('');
  onSave({ ...period, start, end });
  onClose();
}}
  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-400 text-white text-sm font-bold"
>
  <Check className="w-4 h-4 inline mr-1.5" />Save
</button>
        </div>
      </div>
    </div>
  );
}

// ─── Symptom Trends ───────────────────────────────────────────────────────────
function SymptomTrends({ logs }: { logs: Record<string, DayLog> }) {
  const counts: Record<string, number> = {};
  Object.values(logs).forEach(log => {
    (log.symptoms || []).forEach(s => { counts[s] = (counts[s] || 0) + 1; });
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (top.length === 0) return null;
  const max = top[0][1];
  return (
    <div className="rounded-3xl p-5 border border-rose-100 bg-white mb-4">
      <h3 className="text-sm font-bold text-gray-700 mb-4">Most Logged Symptoms</h3>
      <div className="space-y-3">
        {top.map(([symptom, count]) => (
          <div key={symptom}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-600 font-medium">{symptom}</span>
              <span className="text-xs text-rose-400 font-bold">{count}x</span>
            </div>
            <div className="h-1.5 rounded-full bg-rose-50 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-rose-300 to-pink-400 transition-all"
                style={{ width: `${(count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CycleRegularity({ periods }: { periods: PeriodEntry[] }) {
  const cycleData = useMemo(() => {
    if (periods.length < 3) return null;
    const sorted = [...periods].sort((a, b) => parseLocalDate(a.start).getTime() - parseLocalDate(b.start).getTime());
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const diff = differenceInDays(parseLocalDate(sorted[i].start), parseLocalDate(sorted[i-1].start));
      if (diff > 15 && diff < 50) gaps.push(diff);
    }
    return gaps.slice(-5);
  }, [periods]);
  if (!cycleData || cycleData.length === 0) return null;
  return (
    <div className="rounded-3xl p-5 border border-purple-100 bg-white mb-4">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-sm font-bold text-gray-700">Cycle Variation</h3>
        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Last 5 Cycles</span>
      </div>
      <div className="flex items-bottom justify-between gap-2 h-24 items-end">
        {cycleData.map((gap, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-purple-500">{gap}d</span>
            <div className="w-full rounded-t-lg bg-gradient-to-t from-purple-100 to-purple-400 transition-all duration-500"
              style={{ height: `${(gap / 45) * 100}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cycle History ────────────────────────────────────────────────────────────
function CycleHistory({ cycleInfo, onEdit }: { cycleInfo: any; onEdit: (p: PeriodEntry) => void }) {
  const merged = cycleInfo.mergedPeriods as PeriodEntry[];
  if (!merged || merged.length === 0) return (
    <div className="rounded-3xl bg-white border border-rose-100 shadow-sm p-5 mb-4 text-center py-8">
      <p className="text-3xl mb-2">🩸</p>
      <p className="text-sm font-bold text-gray-700">No cycles logged yet</p>
      <p className="text-xs text-gray-400 mt-1">Tap a day in the calendar to mark your period</p>
    </div>
  );
  const sorted = [...merged].sort((a, b) => parseLocalDate(a.start).getTime() - parseLocalDate(b.start).getTime());
  return (
    <div className="rounded-3xl bg-white border border-rose-100 shadow-sm p-5 mb-4">
      <h3 className="text-sm font-bold text-gray-700 mb-4">Cycle History</h3>
      <div className="space-y-3">
        {sorted.slice(0, 6).map((p, idx) => {
          const pStart = parseLocalDate(p.start)
          const pEnd = parseLocalDate(p.end || p.start)
          const periodLen = differenceInDays(pEnd, pStart) + 1;
          const ovDay = cycleInfo.cycleLength - 14;
          const nextPeriod = idx > 0 ? sorted[idx - 1] : null;
          const thisCycleLength = nextPeriod ? differenceInDays(parseLocalDate(nextPeriod.start), pStart): null;
          return (
            <div key={p.id} className="rounded-2xl border border-rose-100 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 bg-rose-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <p className="text-sm font-bold text-gray-700">{format(pStart, 'MMM d')} – {format(pEnd, 'MMM d, yyyy')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white text-rose-400 font-semibold px-2 py-0.5 rounded-full border border-rose-100">{periodLen}d</span>
                  <button onClick={() => onEdit(p)} className="p-1.5 hover:bg-rose-100 rounded-lg"><Edit3 className="w-3 h-3 text-rose-300" /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-rose-50">
                <div className="px-3 py-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Cycle</p>
                  <p className="text-xs font-bold text-purple-500 mt-0.5">{thisCycleLength ? `${thisCycleLength}d` : `~${cycleInfo.cycleLength}d`}</p>
                </div>
                <div className="px-3 py-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Fertile</p>
                  <p className="text-xs font-bold text-teal-500 mt-0.5">{format(addDays(pStart, ovDay - 5), 'MMM d')}–{format(addDays(pStart, ovDay + 1), 'MMM d')}</p>
                </div>
                <div className="px-3 py-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Ovulation</p>
                  <p className="text-xs font-bold text-amber-500 mt-0.5">{format(addDays(pStart, ovDay), 'MMM d')}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CUSTOM CALENDAR ──────────────────────────────────────────────────────────
function CustomCalendar({
  cycleInfo, onDayTap, editMode, phase, onBackToToday,
}: {
  cycleInfo: any;
  onDayTap: (date: Date) => void;
  editMode: boolean;
  phase: typeof PHASE_INSIGHTS[string];
  onBackToToday: () => void;
}) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(new Date());
  const isViewingCurrentMonth =
    viewMonth.getMonth() === today.getMonth() &&
    viewMonth.getFullYear() === today.getFullYear();

  // Touch drag state for swiping through months
  const touchStartX = useRef<number | null>(null);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      setViewMonth(m => delta < 0 ? addMonths(m, 1) : subMonths(m, 1));
    }
    touchStartX.current = null;
  };

  // Pill connector logic
  const getPillPosition = (date: Date, status: string) => {
    if (status !== 'period' && status !== 'predicted') return 'none';
    const prevStatus = getDayStatus(addDays(date, -1), cycleInfo);
    const nextStatus = getDayStatus(addDays(date, 1), cycleInfo);
    const same = (s: string) => s === status;
    if (!same(prevStatus) && same(nextStatus)) return 'start';
    if (same(prevStatus) && !same(nextStatus)) return 'end';
    if (same(prevStatus) && same(nextStatus)) return 'mid';
    return 'solo';
  };

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Month header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: `linear-gradient(135deg, ${phase.gradientFrom}18, ${phase.gradientTo}10)` }}>
        <button
          onClick={() => setViewMonth(m => subMonths(m, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-transform"
          style={{ background: `${phase.gradientFrom}20` }}>
          <ChevronLeft className="w-4 h-4" style={{ color: phase.gradientFrom }} />
        </button>

        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-gray-700">{format(viewMonth, 'MMMM yyyy')}</p>
          {/* Back to Today button — only shows when not on current month */}
          {!isViewingCurrentMonth && (
            <button
              onClick={() => { setViewMonth(new Date()); onBackToToday(); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold active:scale-95 transition-all"
              style={{ background: `${phase.gradientFrom}20`, color: phase.gradientFrom }}>
              <RotateCcw style={{ width: 10, height: 10 }} />
              Today
            </button>
          )}
        </div>

        <button
          onClick={() => setViewMonth(m => addMonths(m, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-transform"
          style={{ background: `${phase.gradientFrom}20` }}>
          <ChevronRight className="w-4 h-4" style={{ color: phase.gradientFrom }} />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 px-2 pt-2 pb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wide py-1">{d}</div>
        ))}
      </div>

      {/* Day grid — larger tap targets */}
      <div className="grid grid-cols-7 px-1 pb-2">
        {allDays.map(day => {
          const isCurrentMonth = day.getMonth() === viewMonth.getMonth();
          const status = getDayStatus(day, cycleInfo);
          const pillPos = getPillPosition(day, status);
          const isToday_ = isToday(day);
          const isPillType = status === 'period' || status === 'predicted';
          const showPillBg = isPillType && (pillPos === 'mid' || pillPos === 'start' || pillPos === 'end');

          // Visual distinction: logged period = solid fill, predicted = outlined/muted
          const circleBackground =
            status === 'period' ? '#f43f5e' :
            status === 'ovulation' ? '#14b8a6' :
            status === 'fertile' ? 'rgba(20,184,166,0.18)' :
            'transparent';

          const circleBorder =
            isToday_ && status === 'normal' ? `2px solid ${phase.gradientFrom}` :
            status === 'predicted' ? '2px dashed rgba(244,63,94,0.5)' :
            status === 'fertile' ? '1.5px solid rgba(20,184,166,0.4)' :
            'none';

          const textColor =
            status === 'period' ? '#fff' :
            status === 'ovulation' ? '#fff' :
            status === 'fertile' ? '#0d9488' :
            status === 'predicted' ? 'rgba(244,63,94,0.7)' :
            isToday_ ? '#111827' : '#6b7280';

          return (
            <button
              key={format(day, 'yyyy-MM-dd')}
              onClick={() => {
  if (!isCurrentMonth) return;
  triggerHaptic();
  onDayTap(day);
}}
              className="relative flex items-center justify-center active:scale-90 transition-transform"
              // Larger touch targets for easier interaction
              style={{ height: 44, opacity: isCurrentMonth ? 1 : 0.15 }}
            >
              {/* Pill connector strip */}
              {showPillBg && (
                <div className="absolute inset-y-2" style={{
                  left: pillPos === 'start' ? '50%' : 0,
                  right: pillPos === 'end' ? '50%' : 0,
                  background: status === 'period' ? 'rgba(244,63,94,0.15)' : 'rgba(244,63,94,0.07)',
                  zIndex: 0,
                }} />
              )}

              {/* Day circle */}
              <div className="relative z-10 flex items-center justify-center rounded-full transition-all"
                style={{ width: 36, height: 36, background: circleBackground, border: circleBorder }}>
                {status === 'period' ? (
                  <Check strokeWidth={3} style={{ width: 13, height: 13, color: '#fff' }} />
                ) : status === 'ovulation' ? (
                  <span style={{ fontSize: 15, lineHeight: 1 }}>⭐</span>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: isToday_ ? '800' : '500', color: textColor }}>
                    {format(day, 'd')}
                  </span>
                )}
              </div>

              {/* Today dot */}
              {isToday_ && (
                <div style={{
                  position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: '50%',
                  background: status === 'period' ? 'rgba(255,255,255,0.8)' : phase.gradientFrom,
                  zIndex: 10,
                }} />
              )}

              {/* Edit mode highlight ring */}
              {editMode && isCurrentMonth && (
                <div className="absolute inset-0 rounded-xl" style={{ border: `1px dashed ${phase.gradientFrom}30` }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-4 pb-4 pt-2 border-t border-gray-50">
        {[
          { bg: '#f43f5e', border: 'none', label: 'Logged period' },
          { bg: 'rgba(244,63,94,0.1)', border: '2px dashed rgba(244,63,94,0.5)', label: 'Expected period' },
          { bg: '#14b8a6', border: 'none', label: 'Ovulation' },
          { bg: 'rgba(20,184,166,0.2)', border: '1.5px solid rgba(20,184,166,0.5)', label: 'Fertile' },
        ].map(({ bg, border, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: bg, border, flexShrink: 0 }} />
            <span className="text-[10px] text-gray-400 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notification Banner ──────────────────────────────────────────────────────
function NotificationBanner({
  cycleInfo,
  phase,
}: {
  cycleInfo: any;
  phase: typeof PHASE_INSIGHTS[string];
}) {

  const [notifStatus, setNotifStatus] = useState<'unknown' | 'granted' | 'denied' | 'unsupported'>(() => {
    if (!('Notification' in window)) return 'denied';

    const perm = Notification.permission;
    if (perm === 'default') return 'unknown';
    return perm as 'granted' | 'denied';
  });

  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem('zodiac_notif_dismissed'));

  const today = new Date();
  const daysToNext = cycleInfo.lastStart ? Math.max(0, differenceInDays(cycleInfo.nextPeriod, today)) : null;
  const fertileStart = cycleInfo.lastStart
  ? addDays(cycleInfo.lastStart, cycleInfo.fertileStart)
  : null;

const daysToFertile = cycleInfo.lastStart
  ? Math.max(0, differenceInDays(fertileStart, today))
  : null;

  // Only show the enable-notifications nudge when not granted and not dismissed
  const showNudge = notifStatus === 'unknown' && !dismissed && cycleInfo.lastStart;

  // Show a contextual reminder card when notifs are on and something is upcoming
const showFertileAlert =
  notifStatus === 'granted' &&
  daysToFertile !== null &&
  daysToFertile <= 4 && daysToFertile >= 0;
const showPeriodAlert =
  notifStatus === 'granted' &&
  daysToNext !== null &&
  daysToNext <= 5 && daysToNext >= 0;

 const handleEnable = async () => {
  (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];

  (window as any).OneSignalDeferred.push(async (OneSignal: any) => {
    const permission = await OneSignal.Notifications.requestPermission();

    if (permission) {
      await OneSignal.Slidedown.promptPush();
      setNotifStatus('granted');
    } else {
      setNotifStatus('denied');
    }
  });
};

  if (notifStatus === 'unsupported') return null;

  if (showPeriodAlert) return (
    <div className="rounded-2xl p-3.5 mb-4 flex items-center gap-3"
      style={{ background: `${phase.gradientFrom}12`, border: `1px solid ${phase.gradientFrom}30` }}>
      <span className="text-xl shrink-0">🩸</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold" style={{ color: phase.gradientFrom }}>
          {daysToNext === 0 ? 'Period expected today' : `Period expected in ${daysToNext} day${daysToNext > 1 ? 's' : ''}`}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">Make sure you're prepared. Remember to log when it starts!</p>
      </div>
      <Bell className="w-4 h-4 shrink-0" style={{ color: phase.gradientFrom }} />
    </div>
  );

  if (showFertileAlert) return (
    <div className="rounded-2xl p-3.5 mb-4 flex items-center gap-3"
      style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.25)' }}>
      <span className="text-xl shrink-0">🌿</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-teal-600">
          {daysToFertile === 0 ? 'Fertile window starts today' : `Fertile window in ${daysToFertile} day${daysToFertile > 1 ? 's' : ''}`}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">Your most fertile days are approaching.</p>
      </div>
      <Bell className="w-4 h-4 text-teal-500 shrink-0" />
    </div>
  );

  if (showNudge) return (
    <div className="rounded-2xl p-3.5 mb-4 flex items-center gap-3 bg-white border border-gray-100 shadow-sm">
      <Bell className="w-5 h-5 shrink-0 text-gray-400" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-700">Get reminders</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Period & fertile window alerts before they arrive</p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={() => { setDismissed(true); localStorage.setItem('zodiac_notif_dismissed', '1'); }}
          className="px-2 py-1.5 rounded-xl text-[10px] font-semibold text-gray-400 bg-gray-50">
          Later
        </button>
        <button
          onClick={handleEnable}
          className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${phase.gradientFrom}, ${phase.gradientTo})` }}>
          Enable
        </button>
      </div>
    </div>
  );

  return null;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function CycleTab() {
  const { userData } = useUserData();
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PeriodEntry | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const [logs, setLogs] = useState<Record<string, DayLog>>(() => {
    try { return JSON.parse(localStorage.getItem('zodiac_day_logs') || '{}'); } catch { return {}; }
  });

  const [periods, setPeriods] = useState<PeriodEntry[]>(() => {
    try {
      const s = localStorage.getItem('zodiac_periods');
      if (s) {
        const parsed = JSON.parse(s);
        return parsed.map((p: any) => ({ ...p, id: p.id || generateId() }));
      }
      if (userData.lastPeriodStart) {
        const startStr = typeof userData.lastPeriodStart === 'string'
          ? userData.lastPeriodStart
          : format(parseLocalDate(userData.lastPeriodStart), 'yyyy-MM-dd');
        let endStr = startStr;
        if (userData.lastPeriodEnd) {
          endStr = typeof userData.lastPeriodEnd === 'string'
            ? userData.lastPeriodEnd
            :format(parseLocalDate(userData.lastPeriodEnd), 'yyyy-MM-dd');
        } else {
          endStr = format(addDays(parseLocalDate(startStr), 4), 'yyyy-MM-dd');
        }
        return [{ id: generateId(), start: startStr, end: endStr }];
      }
      return [];
    } catch { return []; }
  });

  const savePeriods = (p: PeriodEntry[]) => {
    setPeriods(p);
    localStorage.setItem('zodiac_periods', JSON.stringify(p));
  };
  const saveLogs = (l: Record<string, DayLog>) => {
    setLogs(l);
    localStorage.setItem('zodiac_day_logs', JSON.stringify(l));
  };

  const cycleInfo = useMemo(() => calculateCycleInfo(periods), [periods]);
  const symptomInsights = useMemo(
  () => getSymptomInsights(logs, cycleInfo),
  [logs, cycleInfo]
);
const getStatus = useCallback(
  (date: Date) => getDayStatus(date, cycleInfo),
  [cycleInfo]
);
const lutealTop = Object.entries(symptomInsights?.luteal || {})
  .sort((a, b) => b[1] - a[1])[0];
  const phase = PHASE_INSIGHTS[cycleInfo.phase] || PHASE_INSIGHTS.unknown;
  const daysToNext = Math.max(0, differenceInDays(cycleInfo.nextPeriod, new Date()));

  useEffect(() => {
    localStorage.setItem('zodiac_periods', JSON.stringify(periods));
  }, [periods]);

useEffect(() => {
  if (!cycleInfo.lastStart) return;

  const last = localStorage.getItem('zodiac_last_schedule');

  const today = format(new Date(), 'yyyy-MM-dd');

  if (last !== today) {
    scheduleNotifications(cycleInfo);
    localStorage.setItem('zodiac_last_schedule', today);
  }
}, [cycleInfo]);

  const handleDayTap = useCallback((day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (!editMode) {
      setSelectedDate(day);
      setShowLogModal(true);
      return;
    }
    setPeriods((prev) => {
      const allDays = new Set<string>();
      prev.forEach(p => {
        let curr = parseLocalDate(p.start)
        const end = parseLocalDate(p.end || p.start)
        while (curr <= end) {
          allDays.add(format(curr, 'yyyy-MM-dd'));
          curr = addDays(curr, 1);
        }
      });
      if (allDays.has(dateStr)) allDays.delete(dateStr);
      else allDays.add(dateStr);
      const sortedDays = Array.from(allDays).sort();
      const merged: PeriodEntry[] = [];
      if (sortedDays.length > 0) {
        let start = sortedDays[0];
        let end = sortedDays[0];
        for (let i = 1; i < sortedDays.length; i++) {
        const prevDay = parseLocalDate(sortedDays[i - 1]);
const currDay = parseLocalDate(sortedDays[i]);
          if (differenceInDays(currDay, prevDay) === 1) {
            end = sortedDays[i];
          } else {
            merged.push({ id: generateId(), start, end });
            start = sortedDays[i];
            end = sortedDays[i];
          }
        }
        merged.push({ id: generateId(), start, end });
      }
      return merged;
    });
  }, [editMode]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedLog = logs[selectedDateStr];
  const selectedStatus = getDayStatus(selectedDate, cycleInfo);

  // Week strip
  const weekStart = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // ── Phase text — only says "period is here" if actually logged ──
  const getPhaseTitle = () => {
    switch (cycleInfo.phase) {
      case 'menstrual': return 'Your period is here — time to rest 🌙';
      case 'follicular': return 'Your energy is coming back! 🌸';
      case 'ovulation': return "You're feeling amazing right now! ⭐";
      case 'luteal': return 'Time to slow down and take care of yourself 🌙';
      default: return 'Log your period to see insights ✨';
    }
  };

  // Hero banner title — shows "Expected period" when predicted but not logged
const getHeroBannerTitle = () => {
  const todayStatus = getDayStatus(new Date(), cycleInfo);

  if (todayStatus === 'predicted' && !cycleInfo.isCurrentlyLogged) {
    return daysToNext === 0
      ? 'Your period may have started — log it 🩸'
      : `Period expected in ${daysToNext} day${daysToNext > 1 ? 's' : ''} 🩸`;
  }

  if (cycleInfo.phase === 'ovulation') {
    return "You're at peak energy & fertility ✨";
  }

  if (cycleInfo.phase === 'follicular') {
    return 'Your energy is rising — use it 💫';
  }

  if (cycleInfo.phase === 'luteal') {
    return 'Slow down — your body is preparing 🌙';
  }

  return getPhaseTitle();
};

  const getPhaseExplanation = () => {
    switch (cycleInfo.phase) {
      case 'menstrual': return {
        what: "Your body is doing its monthly cleanup. It's totally normal to feel tired and want to rest more. Think of it as your body's \"reset button\" week.",
        tips: [
          { icon: '🛌', text: 'Rest is productive — listen to your body' },
          { icon: '🍫', text: 'Cravings are normal, especially for chocolate and carbs' },
          { icon: '🩸', text: 'Cramps? Heat packs and gentle movement help' }
        ]
      };
      case 'follicular': return {
        what: 'Your energy is rising! This is when you feel more social, creative, and ready to try new things. Your body is preparing for ovulation.',
        tips: [
          { icon: '💪', text: 'Great time for exercise and starting new projects' },
          { icon: '👯', text: 'You might feel more outgoing — make plans!' },
          { icon: '🎨', text: 'Creativity is high — perfect for brainstorming' }
        ]
      };
      case 'ovulation': return {
        what: "You're at your peak! This is when you feel most confident, energetic, and magnetic. Your body is fertile right now.",
        tips: [
          { icon: '✨', text: "You're glowing — own it!" },
          { icon: '🗣️', text: 'Perfect time for important conversations' },
          { icon: '💃', text: 'Energy is highest — dance, move, shine!' }
        ]
      };
      case 'luteal': return {
        what: 'Your body is winding down before your next period. You might feel more tired or introspective. This is your "nesting" phase.',
        tips: [
          { icon: '📝', text: 'Great for finishing tasks and organizing' },
          { icon: '🍲', text: 'Your body needs more food — eat nourishing meals' },
          { icon: '😴', text: 'Sleep more if you can — your body is working hard' }
        ]
      };
      default: return {
        what: 'Log your period dates to get personalized cycle insights',
        tips: [
          { icon: '📅', text: 'Tap the calendar to log your period' },
          { icon: '🩸', text: 'The more you log, the better predictions get!' },
          { icon: '✨', text: 'Your cycle insights will appear here' }
        ]
      };
    }
  };

  const phaseExplanation = getPhaseExplanation();
  const phaseTitle = getPhaseTitle();
  const heroBannerTitle = getHeroBannerTitle();

  return (
    <div className="pb-28">

      {/* ── Hero banner ── */}
      <div style={{
  background: `linear-gradient(160deg, ${phase.gradientFrom}, ${phase.gradientTo})`,
  boxShadow: `0 10px 30px ${phase.gradientFrom}40`
}}
        className="px-5 pt-6 pb-6 mb-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80" style={{ color: phase.textColor }}>
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
            <p className="text-xl font-bold mt-1" style={{ color: phase.textColor }}>
              {heroBannerTitle} · Day {cycleInfo.cycleDay}
            </p>
          </div>
          <div className="text-4xl ml-3 mt-1">{phase.emoji}</div>
        </div>
        <div className="flex gap-3 mt-3">
          {[
            { label: 'Next period', value: daysToNext > 0 ? `in ${daysToNext} days` : 'Today' },
            {
              label: 'Fertile window',
              value: cycleInfo.phase === 'ovulation' ? 'Now! ⭐' :
                cycleInfo.phase === 'follicular' ? 'Soon 🌸' :
                cycleInfo.phase === 'luteal' ? 'Next cycle' : '—'
            },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-2xl px-3 py-2 text-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <p className="text-[9px] uppercase tracking-wide opacity-70" style={{ color: phase.textColor }}>{s.label}</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: phase.textColor }}>{s.value}</p>
            </div>
          ))}
        </div>
      <div className="mt-2 text-center space-y-1"></div>
  {userData.moon_sign && (
    <p className="text-xs opacity-70" style={{ color: phase.textColor }}>
      🌙 {userData.moon_sign} Moon
    </p>
  )}

  <p className="text-xs font-semibold" style={{ color: phase.textColor }}>
    {cycleInfo.isIrregular
      ? "⚠️ Irregular cycle — predictions may shift"
      : `✨ ${cycleInfo.accuracy}% prediction accuracy`}
  </p>
</div>

      {/* ── Week strip + controls ── */}
      <div className="border-b border-gray-100" style={{ background: `linear-gradient(180deg, ${phase.gradientFrom}12 0%, white 60%)` }}>

        {/* Phase label pill */}
        <div className="px-4 pt-3 pb-1 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: `${phase.gradientFrom}22`, border: `1px solid ${phase.gradientFrom}40` }}>
            <span style={{ fontSize: 13 }}>{phase.emoji}</span>
            <span className="text-xs font-bold" style={{ color: phase.gradientFrom }}>
              {phase.label}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium">· Day {cycleInfo.cycleDay}</span>
        </div>

        {/* Week days */}
        <div className="grid grid-cols-7 px-3 pt-1 pb-2">
          {weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
           const status = getStatus(day);
            const isToday_ = isToday(day);
            const isPeriod = status === 'period';
            const isFertile = status === 'fertile';
            const isOvulation = status === 'ovulation';
            const isPredicted = status === 'predicted';
            return (
              <button key={dateStr} onClick={() => { setSelectedDate(day); setShowLogModal(true); }}
                className="flex flex-col items-center gap-1 py-1 active:scale-95 transition-transform">
                <span className="text-[10px] text-gray-400">{format(day, 'EEE')[0]}</span>
                <div className="flex items-center justify-center rounded-full" style={{
                  width: 34, height: 34,
                  background: isPeriod ? '#f43f5e' : isOvulation ? '#14b8a6' : isFertile ? 'rgba(20,184,166,0.15)' : 'transparent',
                  border: isToday_ && !isPeriod ? `2px solid ${phase.gradientFrom}` :
                    isPredicted ? '2px dashed rgba(244,63,94,0.5)' : 'none',
                }}>
                  {isPeriod
                    ? <Check strokeWidth={3} style={{ width: 13, height: 13, color: 'white' }} />
                    : <span style={{
                        fontSize: 13,
                        fontWeight: isToday_ ? '800' : '400',
                        color: isOvulation ? '#0f766e' : isFertile ? '#0d9488' :
                          isPredicted ? 'rgba(244,63,94,0.7)' : isToday_ ? '#111827' : '#6b7280',
                      }}>{format(day, 'd')}</span>
                  }
                </div>
                {isToday_ && <div style={{ width: 4, height: 4, borderRadius: '50%', background: phase.gradientFrom }} />}
              </button>
            );
          })}
        </div>

        {/* Controls row */}
        <div className="flex gap-2 px-3 pb-3">
          <button
            onClick={() => { setEditMode(m => !m); setShowFullCalendar(true); }}
            className="flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            style={{
              background: editMode ? `linear-gradient(135deg, ${phase.gradientFrom}, ${phase.gradientTo})` : `${phase.gradientFrom}12`,
              color: editMode ? 'white' : phase.gradientFrom,
              border: editMode ? 'none' : `1.5px solid ${phase.gradientFrom}30`,
            }}>
            <span>🩸</span>
            {editMode ? 'Tap days to mark your flow' : 'Track your period'}
          </button>
          <button
            onClick={() => setShowFullCalendar(v => !v)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
            style={{ background: `${phase.gradientFrom}12` }}>
            <CalendarIcon className="w-4 h-4" style={{ color: phase.gradientFrom }} />
          </button>
        </div>
      </div>

      {/* ── Full Custom Calendar ── */}
      {showFullCalendar && (
        <div className="px-4 pt-4 pb-2 border-b border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <CustomCalendar
            cycleInfo={cycleInfo}
            onDayTap={handleDayTap}
            editMode={editMode}
            phase={phase}
            onBackToToday={() => setSelectedDate(new Date())}
          />
          {editMode && (
            <div className="mt-3 p-4 rounded-2xl border flex items-center gap-3"
              style={{ background: `${phase.gradientFrom}10`, borderColor: `${phase.gradientFrom}30` }}>
              <div className="w-8 h-8 flex items-center justify-center rounded-full shrink-0"
                style={{ background: phase.gradientFrom }}>
                <Edit3 className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-medium leading-relaxed" style={{ color: phase.gradientFrom }}>
                <strong>Edit Mode:</strong> Tap any date to add or remove it from your period history. Swipe left/right to change months.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="px-4 pt-4">

        {/* Notification banner (period/fertile alerts + enable nudge) */}
        <NotificationBanner cycleInfo={cycleInfo} phase={phase} />

        {/* Today's log card */}
        <div className="rounded-3xl bg-white border border-rose-100 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-gray-800 text-sm">{format(selectedDate, 'MMMM d')} · Day {cycleInfo.cycleDay}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedStatus === 'period' ? '🔴 Period day — logged' :
                 selectedStatus === 'fertile' ? '🟢 Fertile window' :
                 selectedStatus === 'ovulation' ? '⭐ Ovulation day' :
                 selectedStatus === 'predicted' ? '🔮 Expected period — not yet logged' :
                 selectedLog ? '✓ Logged' : 'Nothing logged yet'}
              </p>
            </div>
            <button onClick={() => setShowLogModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold active:scale-95 transition-transform"
              style={{ background: `linear-gradient(135deg, ${phase.gradientFrom}, ${phase.gradientTo})` }}>
              <Edit3 className="w-3 h-3" />
              {selectedLog ? 'Edit' : 'Log day'}
            </button>
          </div>
          {selectedLog && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {selectedLog.flow && (
                <span className="text-[10px] bg-rose-50 text-rose-500 px-2 py-1 rounded-lg border border-rose-100 font-bold uppercase">
                  {selectedLog.flow} Flow
                </span>
              )}
              {selectedLog.mood && (
                <span className="text-[10px] bg-pink-50 text-pink-500 px-2 py-1 rounded-lg border border-pink-100 font-bold uppercase">
                  Mood: {selectedLog.mood}
                </span>
              )}
              {selectedLog.symptoms?.map(s => (
                <span key={s} className="text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100 font-bold uppercase">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Phase explanation card */}
        {cycleInfo.phase !== 'unknown' && (
          <div className="rounded-3xl mb-4 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${phase.gradientFrom}15, ${phase.gradientTo}08)`, border: `1px solid ${phase.gradientFrom}30` }}>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{phase.emoji}</span>
                <p className="font-bold text-gray-800 text-base">{phaseTitle}</p>
              </div>
              <div className="space-y-3 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed bg-white/60 rounded-2xl p-3">
                  {phaseExplanation.what}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {phaseExplanation.tips.map((tip, idx) => (
                    <div key={idx} className="bg-white/50 rounded-xl p-2 text-center">
                      <span className="text-lg block mb-1">{tip.icon}</span>
                      <p className="text-xs text-gray-600">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.6)' }}>
                {Object.keys(logs).length === 0 ? (
                  <p className="text-xs text-gray-500 text-center">📝 Log your symptoms daily to get personalized insights</p>
                ) : (
                  <p className="text-xs text-gray-500 text-center">✅ You've logged {Object.keys(logs).length} day{Object.keys(logs).length !== 1 ? 's' : ''} — keep going! 🌙</p>
                )}
                <button onClick={() => setShowLogModal(true)}
                  className="w-full mt-2 py-2 rounded-xl text-xs font-bold text-center active:scale-95 transition-transform"
                  style={{ background: `${phase.gradientFrom}20`, color: phase.gradientFrom }}>
                  + Log today's symptoms
                </button>
              </div>
            </div>
          </div>
        )}

        <SymptomTrends logs={logs} />
        <CycleRegularity periods={periods} />
        <CycleHistory cycleInfo={cycleInfo} onEdit={(p) => setEditingPeriod(p)} />
          {/* Smart Insights */}
{(cycleInfo.isIrregular || cycleInfo.anomaly || lutealTop || cycleInfo.accuracy > 70) && (
  <div className="rounded-2xl p-4 bg-white border border-gray-100 mb-4">
   <p className="text-xs font-bold text-gray-700 mb-2">
  ✨ Personalized Insights
</p>

    {cycleInfo.isIrregular && (
      <p className="text-xs text-gray-500">
        Your cycle varies a bit — predictions may shift 🌊
      </p>
    )}

    {cycleInfo.anomaly && (
      <p className="text-xs text-amber-500 mt-1">
        This cycle was unusual compared to your norm ⚠️
      </p>
    )}

    {lutealTop && (
      <p className="text-xs text-gray-500 mt-1">
        You often experience {lutealTop[0]} in your luteal phase 🌙
      </p>
    )}
    {cycleInfo.accuracy > 80 && (
  <p className="text-xs text-green-600 mt-1">
    Your cycle predictions are highly reliable 🎯
  </p>
)}
  </div>
)}

        <Suspense fallback={<div className="h-20 bg-gray-50 rounded-2xl animate-pulse" />}>
          <AdBanner />
        </Suspense>
      </div>

      {/* ── Modals ── */}
      {showLogModal && (
        <LogModal
          date={selectedDate}
          log={selectedLog || { date: selectedDateStr }}
          onSave={(draft) => saveLogs({ ...logs, [selectedDateStr]: draft })}
          onClose={() => setShowLogModal(false)}
        />
      )}
      {editingPeriod && (
        <EditPeriodModal
          period={editingPeriod}
          onSave={(updated) => {
            const newPeriods = periods.map(p => p.id === updated.id ? updated : p);
            savePeriods(newPeriods);
          }}
          onDelete={(id) => savePeriods(periods.filter(p => p.id !== id))}
          onClose={() => setEditingPeriod(null)}
        />
      )}

      {/* ── Floating Action Button ── */}
      <button
        onClick={() => { setEditMode(!editMode); if (!showFullCalendar) setShowFullCalendar(true); }}
        className={`fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all z-40 ${editMode ? 'rotate-90' : ''}`}
        style={{ background: editMode ? phase.gradientFrom : `linear-gradient(135deg, ${phase.gradientFrom}, ${phase.gradientTo})` }}>
        {editMode ? <Check className="text-white" /> : <Edit3 className="text-white" />}
      </button>
    </div>
  );
}