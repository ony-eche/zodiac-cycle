import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useUserData } from '../context/UserDataContext';
import {
  format, addDays, differenceInDays, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, addMonths, subMonths, isToday,
  startOfWeek, endOfWeek, addWeeks, subWeeks,
} from 'date-fns';
import { X, Check, Trash2, Edit3, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { lazy, Suspense } from 'react';
const AdBanner = lazy(() => import('../components/AdBanner').then(m => ({ default: m.AdBanner }))); 

interface DayLog {
  date: string; flow?: 'light' | 'medium' | 'heavy' | 'spotting';
  mood?: string; symptoms?: string[]; notes?: string;
}
interface PeriodEntry { id: string; start: string; end: string; }

function generateId() { return Math.random().toString(36).slice(2, 9); }

function mergePeriods(periods: PeriodEntry[]): PeriodEntry[] {
  if (periods.length === 0) return [];
  const sorted = [...periods].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const merged: PeriodEntry[] = [];
  let current = { ...sorted[0] };
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    const currentEnd = new Date(current.end || current.start);
    const nextStart = new Date(next.start);
    if (differenceInDays(nextStart, currentEnd) <= 1) {
      const nextEnd = new Date(next.end || next.start);
      if (nextEnd > currentEnd) current = { ...current, end: next.end || next.start };
    } else {
      merged.push(current);
      current = { ...next };
    }
  }
  merged.push(current);
  return merged;
}

function calculateCycleInfo(rawPeriods: PeriodEntry[], currentDate: Date = new Date()) {
  const periods = mergePeriods(rawPeriods);
  if (periods.length === 0) return {
    cycleDay: 14, nextPeriod: addDays(currentDate, 14), cycleLength: 28,
    periodLength: 5, phase: 'unknown', ovulationDay: 14, fertileStart: 9, fertileEnd: 15,
    lastStart: null, accuracy: 0, mergedPeriods: [],
  };
  const sorted = [...periods].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const lastPeriod = sorted[sorted.length - 1];
  const lastStart = new Date(lastPeriod.start);
  const lastEnd = new Date(lastPeriod.end || lastPeriod.start);
  let avgCycleLength = 28;
  const lengths: number[] = [];
  if (sorted.length >= 2) {
    for (let i = 1; i < sorted.length; i++) {
      const diff = differenceInDays(new Date(sorted[i].start), new Date(sorted[i - 1].start));
      if (diff >= 20 && diff <= 45) lengths.push(diff);
    }
    if (lengths.length > 0) avgCycleLength = Math.round(lengths.reduce((a, b) => a + b) / lengths.length);
  }
  const avgPeriodLength = Math.max(1, differenceInDays(lastEnd, lastStart) + 1);
  const daysSinceLast = differenceInDays(currentDate, lastStart);
 const cycleDay = Math.max(1, (daysSinceLast % avgCycleLength) + 1);
  const daysUntilNext = avgCycleLength - (daysSinceLast % avgCycleLength);
  const nextPeriod = addDays(currentDate, daysUntilNext);
  let phase = 'luteal';
  if (cycleDay <= avgPeriodLength) phase = 'menstrual';
  else if (cycleDay <= 13) phase = 'follicular';
  else if (cycleDay <= 16) phase = 'ovulation';
  const ovulationDay = avgCycleLength - 14;
  const accuracy = Math.min(95, 50 + lengths.length * 15);
  return {
    cycleDay, nextPeriod, cycleLength: avgCycleLength, periodLength: avgPeriodLength,
    phase, ovulationDay, fertileStart: ovulationDay - 5, fertileEnd: ovulationDay + 1,
    lastStart, accuracy, mergedPeriods: sorted,
  };
}

function getDayStatus(date: Date, cycleInfo: any): 'period' | 'predicted' | 'fertile' | 'ovulation' | 'normal' {
  const merged = cycleInfo.mergedPeriods || [];
  for (const period of merged) {
    const start = new Date(period.start);
    const end = new Date(period.end || period.start);
    if (date >= start && date <= end) return 'period';
  }
  if (cycleInfo.lastStart) {
    const daysSinceLast = differenceInDays(date, cycleInfo.lastStart);
    if (daysSinceLast >= 0) {
      const pos = daysSinceLast % cycleInfo.cycleLength;
      if (pos === cycleInfo.ovulationDay) return 'ovulation';
      if (pos >= cycleInfo.fertileStart && pos <= cycleInfo.fertileEnd) return 'fertile';
      if (pos < cycleInfo.periodLength) return 'predicted';
    }
  }
  return 'normal';
}

const PHASE_INSIGHTS: Record<string, { emoji: string; label: string; gradientFrom: string; gradientTo: string; textColor: string; tip: string; energy: string; mood: string; energyPct: number }> = {
  menstrual:  { emoji: '🔴', label: 'Menstrual',  gradientFrom: '#ff6b8a', gradientTo: '#ff8fa3', textColor: '#fff', tip: 'Rest is productive. Honour your body with warmth and gentle movement.', energy: 'Low', mood: 'Reflective', energyPct: 20 },
  follicular: { emoji: '🌸', label: 'Follicular', gradientFrom: '#c084fc', gradientTo: '#e879f9', textColor: '#fff', tip: 'Estrogen is rising! Great time to start new projects and socialise.', energy: 'Rising', mood: 'Optimistic', energyPct: 70 },
  ovulation:  { emoji: '⭐', label: 'Ovulation',  gradientFrom: '#f59e0b', gradientTo: '#fbbf24', textColor: '#fff', tip: 'Peak fertility and confidence. Ideal for big presentations.', energy: 'Peak', mood: 'Social', energyPct: 95 },
  luteal:     { emoji: '🌙', label: 'Luteal',     gradientFrom: '#818cf8', gradientTo: '#a5b4fc', textColor: '#fff', tip: 'Progesterone peaks then drops. Focus on completing tasks.', energy: 'Declining', mood: 'Introspective', energyPct: 35 },
  unknown:    { emoji: '✨', label: 'Unknown',    gradientFrom: '#c084fc', gradientTo: '#818cf8', textColor: '#fff', tip: 'Log your period dates to unlock personalised cycle insights.', energy: '—', mood: '—', energyPct: 0 },
};

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
          <button onClick={() => { onSave({ ...period, start, end }); onClose(); }}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-400 text-white text-sm font-bold">
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
  const sorted = [...merged].sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  return (
    <div className="rounded-3xl bg-white border border-rose-100 shadow-sm p-5 mb-4">
      <h3 className="text-sm font-bold text-gray-700 mb-4">Cycle History</h3>
      <div className="space-y-3">
        {sorted.slice(0, 6).map((p, idx) => {
          const pStart = new Date(p.start);
          const pEnd = new Date(p.end || p.start);
          const periodLen = differenceInDays(pEnd, pStart) + 1;
          const ovDay = cycleInfo.cycleLength - 14;
          const nextPeriod = sorted[idx - 1];
          const thisCycleLength = nextPeriod ? differenceInDays(new Date(nextPeriod.start), pStart) : null;
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

// ─── Full Month Calendar ──────────────────────────────────────────────────────
function FullCalendar({ month, cycleInfo, editMode, onDayTap, onPrevMonth, onNextMonth }: {
  month: Date; cycleInfo: any; editMode: boolean;
  onDayTap: (day: Date) => void; onPrevMonth: () => void; onNextMonth: () => void;
}) {
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const startPad = startOfMonth(month).getDay();
  const tapping = useRef(false);
  const [tappedDay, setTappedDay] = useState<string | null>(null);

  const handleTap = (day: Date) => {
    if (tapping.current) return;
    tapping.current = true;
    setTappedDay(format(day, 'yyyy-MM-dd'));
    setTimeout(() => { setTappedDay(null); tapping.current = false; }, 300);
    onDayTap(day);
  };

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={onPrevMonth} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <p className="text-sm font-bold text-gray-700">{format(month, 'MMMM yyyy')}</p>
        <button onClick={onNextMonth} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 px-2">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-gray-400 font-semibold py-1">{d}</div>
        ))}
        {Array.from({ length: startPad }).map((_, i) => <div key={`p-${i}`} />)}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const status = getDayStatus(day, cycleInfo);
          const isToday_ = isToday(day);
          const isTapped = tappedDay === dateStr;
          const isPeriod = status === 'period';
          const isPredicted = status === 'predicted';
          const isFertile = status === 'fertile';
          const isOvulation = status === 'ovulation';
          return (
            <div key={dateStr} className="flex flex-col items-center py-0.5">
              <button onClick={() => handleTap(day)}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 36, height: 36,
                  transform: isTapped ? 'scale(0.85)' : 'scale(1)',
                  transition: 'transform 0.1s ease',
                  background: isPeriod ? '#f43f5e' : isOvulation ? '#14b8a6' : isFertile ? 'rgba(20,184,166,0.15)' : isPredicted ? 'rgba(244,63,94,0.08)' : isToday_ ? 'rgba(0,0,0,0.07)' : 'transparent',
                  border: isToday_ && !isPeriod ? '2px solid #374151' : isPredicted && !isPeriod ? '1.5px dashed #f43f5e' : isFertile && !isPeriod && !isOvulation ? '1.5px solid rgba(20,184,166,0.5)' : 'none',
                  boxShadow: isPeriod ? '0 2px 6px rgba(244,63,94,0.3)' : isOvulation ? '0 2px 6px rgba(20,184,166,0.3)' : 'none',
                }}>
                {isPeriod
                  ? <Check strokeWidth={3} style={{ width: 14, height: 14, color: 'white' }} />
                  : <span style={{
                      fontSize: 13,
                      fontWeight: isToday_ ? '800' : '400',
                      color: isPeriod ? 'white' : isOvulation ? '#0f766e' : isFertile ? '#0d9488' : isPredicted ? '#f43f5e' : isToday_ ? '#111827' : '#6b7280',
                    }}>{format(day, 'd')}</span>
                }
              </button>
              {isToday_ && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#374151', marginTop: 1 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
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
  const [calendarMonth, setCalendarMonth] = useState(new Date());

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
      if (userData.lastPeriodStart) return [{
        id: generateId(),
        start: format(new Date(userData.lastPeriodStart), 'yyyy-MM-dd'),
        end: userData.lastPeriodEnd
          ? format(new Date(userData.lastPeriodEnd), 'yyyy-MM-dd')
          : format(addDays(new Date(userData.lastPeriodStart), 4), 'yyyy-MM-dd'),
      }];
      return [];
    } catch { return []; }
  });

  const savePeriods = (p: PeriodEntry[]) => { setPeriods(p); localStorage.setItem('zodiac_periods', JSON.stringify(p)); };
  const saveLogs = (l: Record<string, DayLog>) => { setLogs(l); localStorage.setItem('zodiac_day_logs', JSON.stringify(l)); };

  const cycleInfo = useMemo(() => calculateCycleInfo(periods), [periods]);
  const phase = PHASE_INSIGHTS[cycleInfo.phase];
  const daysToNext = Math.max(0, differenceInDays(cycleInfo.nextPeriod, new Date()));

  const handleDayTap = useCallback((day: Date) => {
    if (!editMode) {
      setSelectedDate(day);
      if (showFullCalendar) setShowFullCalendar(false);
      setShowLogModal(true);
      return;
    }
    const dateStr = format(day, 'yyyy-MM-dd');
    const existingIdx = periods.findIndex(p => {
      const start = new Date(p.start);
      const end = p.end ? new Date(p.end) : start;
      return day >= start && day <= end;
    });
    if (existingIdx >= 0) {
      const p = periods[existingIdx];
      const pStart = new Date(p.start);
      const pEnd = new Date(p.end || p.start);
      if (isSameDay(day, pStart) && isSameDay(day, pEnd)) {
        savePeriods(periods.filter((_, i) => i !== existingIdx));
      } else if (isSameDay(day, pStart)) {
        const np = [...periods]; np[existingIdx] = { ...p, start: format(addDays(pStart, 1), 'yyyy-MM-dd') }; savePeriods(np);
      } else if (isSameDay(day, pEnd)) {
        const np = [...periods]; np[existingIdx] = { ...p, end: format(addDays(pEnd, -1), 'yyyy-MM-dd') }; savePeriods(np);
      } else {
        const np = [...periods];
        np.splice(existingIdx, 1,
          { id: generateId(), start: p.start, end: format(addDays(day, -1), 'yyyy-MM-dd') },
          { id: generateId(), start: format(addDays(day, 1), 'yyyy-MM-dd'), end: p.end }
        );
        savePeriods(np);
      }
    } else {
      const nearby = periods.find(p => {
        const pEnd = new Date(p.end || p.start);
        const pStart = new Date(p.start);
        return differenceInDays(day, pEnd) === 1 || differenceInDays(pStart, day) === 1;
      });
      if (nearby) {
        const pEnd = new Date(nearby.end || nearby.start);
        savePeriods(periods.map(p => p.id === nearby.id
          ? differenceInDays(day, pEnd) === 1 ? { ...p, end: dateStr } : { ...p, start: dateStr }
          : p
        ));
      } else {
        savePeriods([...periods, { id: generateId(), start: dateStr, end: dateStr }]);
      }
    }
  }, [editMode, periods, showFullCalendar]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedLog = logs[selectedDateStr];
  const selectedStatus = getDayStatus(selectedDate, cycleInfo);

  // Mini week strip — centered on today
  const weekStart = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const heroLabel =
    cycleInfo.phase === 'ovulation' ? `Fertile window · Day ${cycleInfo.cycleDay - cycleInfo.fertileStart + 1} of ${cycleInfo.fertileEnd - cycleInfo.fertileStart + 1}` :
    cycleInfo.phase === 'menstrual' ? `Period · Day ${cycleInfo.cycleDay}` :
    cycleInfo.phase === 'follicular' ? `Building energy · Day ${cycleInfo.cycleDay}` :
    cycleInfo.phase === 'luteal' ? `Winding down · Day ${cycleInfo.cycleDay}` :
    `Cycle Day ${cycleInfo.cycleDay}`;

  return (
    <div className="pb-28">

      {/* ── Hero banner ── */}
      <div style={{ background: `linear-gradient(160deg, ${phase.gradientFrom}, ${phase.gradientTo})` }}
        className="px-5 pt-6 pb-8 -mx-0 mb-0">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80" style={{ color: phase.textColor }}>
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color: phase.textColor }}>{heroLabel}</p>
            <p className="text-sm opacity-80 mt-1" style={{ color: phase.textColor }}>{phase.tip}</p>
          </div>
          <div className="text-4xl ml-3 mt-1">{phase.emoji}</div>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-4">
          {[
            { label: 'Energy', value: phase.energy },
            { label: 'Mood', value: phase.mood },
            { label: 'Period in', value: daysToNext > 0 ? `${daysToNext}d` : 'Today' },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-2xl px-3 py-2.5 text-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <p className="text-[9px] uppercase tracking-wide opacity-70" style={{ color: phase.textColor }}>{s.label}</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: phase.textColor }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Moon sign */}
        {userData.moon_sign && (
          <p className="text-xs mt-3 opacity-70" style={{ color: phase.textColor }}>
            🌙 {userData.moon_sign} Moon · {cycleInfo.accuracy}% accurate
          </p>
        )}
      </div>

      {/* ── Week strip + calendar toggle ── */}
      <div className="bg-white border-b border-gray-100 px-3 py-3">
        {/* Mini week */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const status = getDayStatus(day, cycleInfo);
            const isToday_ = isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            const isPeriod = status === 'period';
            const isFertile = status === 'fertile';
            const isOvulation = status === 'ovulation';
            const isPredicted = status === 'predicted';
            return (
              <button key={dateStr} onClick={() => { setSelectedDate(day); setShowLogModal(true); }}
                className="flex flex-col items-center gap-1 py-1">
                <span className="text-[10px] text-gray-400">{format(day, 'EEE')[0]}</span>
                <div className="flex items-center justify-center rounded-full"
                  style={{
                    width: 34, height: 34,
                    background: isPeriod ? '#f43f5e' : isOvulation ? '#14b8a6' : isFertile ? 'rgba(20,184,166,0.15)' : isSelected ? 'rgba(0,0,0,0.08)' : 'transparent',
                    border: isToday_ && !isPeriod ? '2px solid #374151' : isPredicted ? '1.5px dashed #f43f5e' : 'none',
                  }}>
                  {isPeriod
                    ? <Check strokeWidth={3} style={{ width: 13, height: 13, color: 'white' }} />
                    : <span style={{
                        fontSize: 13,
                        fontWeight: isToday_ ? '800' : '400',
                        color: isOvulation ? '#0f766e' : isFertile ? '#0d9488' : isPredicted ? '#f43f5e' : isToday_ ? '#111827' : '#6b7280',
                      }}>{format(day, 'd')}</span>
                  }
                </div>
                {isToday_ && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#374151' }} />}
              </button>
            );
          })}
        </div>

        {/* Log period + expand calendar */}
        <div className="flex gap-2">
          <button onClick={() => {
                setEditMode(m => !m);
                setShowFullCalendar(true);
                setCalendarMonth(new Date());
               }}
            className="flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5"
            style={{
              background: editMode ? 'linear-gradient(135deg, #f43f5e, #fb7185)' : 'rgba(244,63,94,0.07)',
              color: editMode ? 'white' : '#f43f5e',
              border: editMode ? 'none' : '1.5px solid rgba(244,63,94,0.2)',
            }}>
            <span>🩸</span>
            {editMode ? 'Tap days to mark period' : 'Log period'}
          </button>
          <button onClick={() => setShowFullCalendar(v => !v)}
            className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ── Expanded full calendar ── */}
      {showFullCalendar && (
        <div className="bg-white border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
  <p className="text-xs text-gray-400">Tap days to mark • {editMode ? 'Edit mode ON' : 'Tap Log Period to edit'}</p>
  <button onClick={() => { if (window.confirm('Clear all period data?')) savePeriods([]); }}
    className="text-xs text-rose-400 font-medium">Clear all</button>
</div>
          <FullCalendar
            month={calendarMonth}
            cycleInfo={cycleInfo}
            editMode={editMode}
            onDayTap={handleDayTap}
            onPrevMonth={() => setCalendarMonth(m => subMonths(m, 1))}
            onNextMonth={() => setCalendarMonth(m => addMonths(m, 1))}
          />
          {editMode && (
            <div className="px-4 pt-2">
              <button onClick={() => { setEditMode(false); setShowFullCalendar(false); }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-400 text-white text-sm font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Done — period saved
              </button>
            </div>
          )}
          {/* Legend */}
          <div className="flex items-center gap-4 px-4 pt-3">
            {[
              { bg: '#f43f5e', label: 'Period' },
              { bg: 'rgba(244,63,94,0.08)', border: '1.5px dashed #f43f5e', label: 'Predicted' },
              { bg: 'rgba(20,184,166,0.15)', border: '1.5px solid rgba(20,184,166,0.5)', label: 'Fertile' },
              { bg: '#14b8a6', label: 'Ovulation' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.bg, border: l.border }} />
                <span className="text-[9px] text-gray-400">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="px-4 pt-4">
        {/* Today's log card */}
        <div className="rounded-3xl bg-white border border-rose-100 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-gray-800 text-sm">{format(selectedDate, 'MMMM d')} · Day {cycleInfo.cycleDay}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedStatus === 'period' ? '🔴 Period day' :
                 selectedStatus === 'fertile' ? '🟢 Fertile window' :
                 selectedStatus === 'ovulation' ? '⭐ Ovulation day' :
                 selectedStatus === 'predicted' ? '🔮 Predicted period' :
                 selectedLog ? '✓ Logged' : 'Nothing logged yet'}
              </p>
            </div>
            <button onClick={() => setShowLogModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-400 to-pink-400 text-white text-xs font-bold">
              <Edit3 className="w-3 h-3" />
              {selectedLog ? 'Edit' : 'Log day'}
            </button>
          </div>
          {selectedLog ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedLog.flow && <span className="text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-500 font-medium capitalize">💧 {selectedLog.flow}</span>}
              {selectedLog.mood && <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-500 font-medium">{selectedLog.mood}</span>}
              {(selectedLog.symptoms || []).slice(0, 3).map(s => (
                <span key={s} className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-600 font-medium">{s}</span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Tap "Log day" to track symptoms, mood and flow.</p>
          )}
        </div>

        <CycleHistory cycleInfo={cycleInfo} onEdit={setEditingPeriod} />
        <SymptomTrends logs={logs} />
        <div className="mt-2">
         <Suspense fallback={<div className="h-16" />}>
  <AdBanner
    slot={import.meta.env.VITE_AD_SLOT_CYCLE}
    format="horizontal"
    className="mt-2 mb-4"
  />
</Suspense>
        </div>
      </div>

      {showLogModal && (
        <LogModal
          date={selectedDate}
          log={selectedLog || { date: selectedDateStr }}
          onSave={log => saveLogs({ ...logs, [log.date]: log })}
          onClose={() => setShowLogModal(false)}
        />
      )}
      {editingPeriod && (
        <EditPeriodModal
          period={editingPeriod}
          onSave={updated => savePeriods(periods.map(p => p.id === updated.id ? updated : p))}
          onDelete={id => savePeriods(periods.filter(p => p.id !== id))}
          onClose={() => setEditingPeriod(null)}
        />
      )}
    </div>
  );
} 