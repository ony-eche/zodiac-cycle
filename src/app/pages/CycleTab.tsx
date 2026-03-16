import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useUserData } from '../context/UserDataContext';
import {
  format, addDays, differenceInDays, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, addMonths, subMonths, isToday,
} from 'date-fns';
import { X, Check, Trash2, Edit3, Droplet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdBanner } from '../components/AdBanner';

interface DayLog {
  date: string; flow?: 'light' | 'medium' | 'heavy' | 'spotting';
  mood?: string; symptoms?: string[]; notes?: string;
}
interface PeriodEntry { id: string; start: string; end: string; }

function generateId() { return Math.random().toString(36).slice(2, 9); }

// ─── Merge single-day taps into proper period ranges ──────────────────────────
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

function getDayStatus(date: Date, rawPeriods: PeriodEntry[], cycleInfo: any): 'period' | 'predicted' | 'fertile' | 'ovulation' | 'normal' {
  const merged = cycleInfo.mergedPeriods || mergePeriods(rawPeriods);
  for (const period of merged) {
    const start = new Date(period.start);
    const end = new Date(period.end || period.start);
    const endPlusOne = addDays(end, 0);
    if (date >= start && date <= endPlusOne) return 'period';
  }
  if (cycleInfo.lastStart) {
    const daysSinceLast = differenceInDays(date, cycleInfo.lastStart);
    if (daysSinceLast > 0) {
      const pos = daysSinceLast % cycleInfo.cycleLength;
      if (pos >= cycleInfo.fertileStart && pos <= cycleInfo.fertileEnd) return 'fertile';
      if (pos === cycleInfo.ovulationDay) return 'ovulation';
      if (pos < cycleInfo.periodLength) return 'predicted';
    }
  }
  return 'normal';
}

// ─── Phase insights ───────────────────────────────────────────────────────────
const PHASE_INSIGHTS: Record<string, { emoji: string; label: string; color: string; tip: string; energy: string; mood: string }> = {
  menstrual:  { emoji: '🔴', label: 'Menstrual',  color: '#f43f5e', tip: 'Rest is productive. Honour your body with warmth, gentle movement, and iron-rich foods.', energy: 'Low', mood: 'Reflective' },
  follicular: { emoji: '🌸', label: 'Follicular', color: '#c084fc', tip: 'Estrogen is rising! Great time to start new projects, socialise, and try new workouts.', energy: 'Rising', mood: 'Optimistic' },
  ovulation:  { emoji: '⭐', label: 'Ovulation',  color: '#f59e0b', tip: 'Peak fertility and confidence. Ideal for big presentations and important conversations.', energy: 'Peak', mood: 'Social' },
  luteal:     { emoji: '🌙', label: 'Luteal',     color: '#818cf8', tip: 'Progesterone peaks then drops. Focus on completing tasks and winding down.', energy: 'Declining', mood: 'Introspective' },
  unknown:    { emoji: '✨', label: 'Unknown',    color: '#c084fc', tip: 'Log your period dates to unlock personalised cycle insights and predictions.', energy: '—', mood: '—' },
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
          <button onClick={onClose} className="p-2 hover:bg-rose-100 rounded-xl">
            <X className="w-4 h-4 text-rose-300" />
          </button>
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
          <button onClick={onClose} className="p-2 hover:bg-rose-100 rounded-xl">
            <X className="w-4 h-4 text-rose-400" />
          </button>
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

// ─── Month Grid ───────────────────────────────────────────────────────────────
function MonthGrid({ month, periods, logs, cycleInfo, editMode, selectedDate, onDayTap, onEditTap }: {
  month: Date; periods: PeriodEntry[]; logs: Record<string, DayLog>;
  cycleInfo: any; editMode: boolean; selectedDate: Date | null;
  onDayTap: (day: Date) => void; onEditTap: (p: PeriodEntry) => void;
}) {
  const today = new Date();
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const startPad = startOfMonth(month).getDay();

  return (
    <div className="mb-6">
      <p className="text-center text-sm font-bold text-gray-700 mb-3">{format(month, 'MMMM yyyy')}</p>
      <div className="grid grid-cols-7 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-gray-400 font-semibold py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const status = getDayStatus(day, periods, cycleInfo);
          const isToday_ = isToday(day);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const hasLog = !!logs[dateStr];
          const isPeriod = status === 'period';
          const isPredicted = status === 'predicted';
          const isFertile = status === 'fertile';
          const isOvulation = status === 'ovulation';
          const isFuture = day > today;

          const periodEntry = cycleInfo.mergedPeriods?.find((p: PeriodEntry) => {
            const s = new Date(p.start);
            const e = new Date(p.end || p.start);
            return day >= s && day <= e;
          });

          return (
            <div key={dateStr} className="flex flex-col items-center py-1">
              {isToday_ && (
                <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-0.5">
                  TODAY
                </span>
              )}
              {/* THE FIX: number is now INSIDE the button */}
              <button
                onClick={() => onDayTap(day)}
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center transition-all relative select-none
                  ${isPeriod ? 'bg-rose-400 shadow-sm shadow-rose-200' : ''}
                  ${isPredicted && !isPeriod ? 'border-2 border-dashed border-rose-300 bg-rose-50/50' : ''}
                  ${isFertile && !isPeriod ? 'border-2 border-teal-300 bg-teal-50/50' : ''}
                  ${isOvulation && !isPeriod ? 'border-2 border-teal-400 bg-teal-100/50' : ''}
                  ${!isPeriod && !isPredicted && !isFertile && !isOvulation ? 'border-2 border-gray-200 hover:border-rose-300 active:bg-rose-50' : ''}
                  ${isSelected && !isPeriod ? 'ring-2 ring-rose-400 ring-offset-1' : ''}
                  ${isToday_ && !isPeriod ? 'border-2 border-gray-800' : ''}
                `}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isPeriod ? (
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                ) : (
                  <span className={`text-xs font-medium leading-none
                    ${isToday_ ? 'font-bold text-gray-900' : ''}
                    ${isFuture && !isPredicted && !isFertile && !isOvulation ? 'text-gray-300' : 'text-gray-600'}
                    ${isFertile ? 'text-teal-600 font-semibold' : ''}
                    ${isOvulation ? 'text-teal-700 font-bold' : ''}
                    ${isPredicted ? 'text-rose-400' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                )}
                {hasLog && !isPeriod && (
                  <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-rose-400" />
                )}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-4 border-b border-gray-100" />
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
              <div className="h-full rounded-full bg-gradient-to-r from-rose-300 to-pink-400"
                style={{ width: `${(count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cycle History ────────────────────────────────────────────────────────────
function CycleHistory({ periods, cycleInfo, onEdit }: {
  periods: PeriodEntry[];
  cycleInfo: any;
  onEdit: (p: PeriodEntry) => void;
}) {
  const merged = cycleInfo.mergedPeriods as PeriodEntry[];
  if (!merged || merged.length === 0) {
    return (
      <div className="rounded-3xl bg-white border border-rose-100 shadow-sm p-5 mb-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Cycle History</h3>
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🩸</p>
          <p className="text-sm text-gray-400">No cycles logged yet</p>
          <p className="text-xs text-gray-300 mt-1">Tap "Edit Period" and mark your period days</p>
        </div>
      </div>
    );
  }

  const sorted = [...merged].sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  const cycleLength = cycleInfo.cycleLength;

  return (
    <div className="rounded-3xl bg-white border border-rose-100 shadow-sm p-5 mb-4">
      <h3 className="text-sm font-bold text-gray-700 mb-4">Cycle History</h3>
      <div className="space-y-3">
        {sorted.slice(0, 6).map((p, idx) => {
          const pStart = new Date(p.start);
          const pEnd = new Date(p.end || p.start);
          const periodLen = differenceInDays(pEnd, pStart) + 1;
          const ovDay = cycleLength - 14;
          const fertileStartDate = addDays(pStart, ovDay - 5);
          const fertileEndDate = addDays(pStart, ovDay + 1);
          const ovulationDate = addDays(pStart, ovDay);

          // Cycle length to next period
          const nextPeriod = sorted[idx - 1];
          const thisCycleLength = nextPeriod
            ? differenceInDays(new Date(nextPeriod.start), pStart)
            : null;

          return (
            <div key={p.id} className="rounded-2xl border border-rose-100 overflow-hidden">
              {/* Header row */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-rose-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <p className="text-sm font-bold text-gray-700">
                    {format(pStart, 'MMM d')} – {format(pEnd, 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white text-rose-400 font-semibold px-2 py-0.5 rounded-full border border-rose-100">
                    {periodLen}d period
                  </span>
                  <button onClick={() => onEdit(p)} className="p-1 hover:bg-rose-100 rounded-lg">
                    <Edit3 className="w-3 h-3 text-rose-300" />
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-rose-50 px-0">
                <div className="px-3 py-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Cycle</p>
                  <p className="text-xs font-bold text-purple-500 mt-0.5">
                    {thisCycleLength ? `${thisCycleLength}d` : `~${cycleLength}d`}
                  </p>
                </div>
                <div className="px-3 py-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Fertile</p>
                  <p className="text-xs font-bold text-teal-500 mt-0.5">
                    {format(fertileStartDate, 'MMM d')}–{format(fertileEndDate, 'MMM d')}
                  </p>
                </div>
                <div className="px-3 py-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Ovulation</p>
                  <p className="text-xs font-bold text-amber-500 mt-0.5">
                    {format(ovulationDate, 'MMM d')}
                  </p>
                </div>
              </div>
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
  const todayRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PeriodEntry | null>(null);
  const [editMode, setEditMode] = useState(false);

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

  const savePeriods = (p: PeriodEntry[]) => {
    setPeriods(p);
    localStorage.setItem('zodiac_periods', JSON.stringify(p));
  };

  const saveLogs = (l: Record<string, DayLog>) => {
    setLogs(l);
    localStorage.setItem('zodiac_day_logs', JSON.stringify(l));
  };

  const cycleInfo = useMemo(() => calculateCycleInfo(periods), [periods]);
  const phase = PHASE_INSIGHTS[cycleInfo.phase];
  const daysToNext = Math.max(0, differenceInDays(cycleInfo.nextPeriod, new Date()));

  const months = useMemo(() => {
    const result: Date[] = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) result.push(subMonths(now, i));
    for (let i = 1; i <= 3; i++) result.push(addMonths(now, i));
    return result;
  }, []);

  useEffect(() => {
    setTimeout(() => {
      todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
  }, []);

  const handleDayTap = useCallback((day: Date) => {
    if (editMode) {
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
          const np = [...periods];
          np[existingIdx] = { ...p, start: format(addDays(pStart, 1), 'yyyy-MM-dd') };
          savePeriods(np);
        } else if (isSameDay(day, pEnd)) {
          const np = [...periods];
          np[existingIdx] = { ...p, end: format(addDays(pEnd, -1), 'yyyy-MM-dd') };
          savePeriods(np);
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
          const newPeriods = periods.map(p =>
            p.id === nearby.id
              ? differenceInDays(day, pEnd) === 1
                ? { ...p, end: dateStr }
                : { ...p, start: dateStr }
              : p
          );
          savePeriods(newPeriods);
        } else {
          savePeriods([...periods, { id: generateId(), start: dateStr, end: dateStr }]);
        }
      }
    } else {
      setSelectedDate(day);
    }
  }, [editMode, periods]);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedLog = selectedDateStr ? logs[selectedDateStr] : null;
  const selectedStatus = selectedDate ? getDayStatus(selectedDate, periods, cycleInfo) : 'normal';

  return (
    <div className="pb-28">

      {/* ── Phase summary card ── */}
      <div className="mb-5 rounded-3xl p-5 border border-rose-100 bg-white shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#fce7f3" strokeWidth="6" />
              <circle cx="40" cy="40" r="32" fill="none" stroke={phase.color} strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 32 * cycleInfo.cycleDay / cycleInfo.cycleLength} ${2 * Math.PI * 32}`}
                strokeLinecap="round" transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
              <text x="40" y="37" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1f2937">{cycleInfo.cycleDay}</text>
              <text x="40" y="50" textAnchor="middle" fontSize="8" fill="#9ca3af">of {cycleInfo.cycleLength}</text>
            </svg>
            <div className="absolute -bottom-1 -right-1 text-lg">{phase.emoji}</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-base font-bold text-gray-800">{phase.label} Phase</p>
              {cycleInfo.accuracy > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: `${phase.color}20`, color: phase.color }}>
                  {cycleInfo.accuracy}% accurate
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <div>
                <p className="text-xl font-bold text-rose-400">{daysToNext}</p>
                <p className="text-[10px] text-gray-400">days to period</p>
              </div>
              <div className="w-px bg-gray-100" />
              <div>
                <p className="text-xl font-bold text-teal-500">{cycleInfo.fertileEnd - cycleInfo.fertileStart + 1}</p>
                <p className="text-[10px] text-gray-400">fertile days</p>
              </div>
              <div className="w-px bg-gray-100" />
              <div>
                <p className="text-xl font-bold text-purple-400">{cycleInfo.cycleLength}</p>
                <p className="text-[10px] text-gray-400">cycle length</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-3 border" style={{ background: `${phase.color}08`, borderColor: `${phase.color}30` }}>
          <p className="text-xs text-gray-600 leading-relaxed">💡 {phase.tip}</p>
        </div>
        <div className="flex gap-2 mt-3">
          {[
            { label: 'Energy', value: phase.energy },
            { label: 'Mood', value: phase.mood },
            { label: 'Logged', value: `${cycleInfo.mergedPeriods?.length || 0} cycles` },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-xl p-2.5 text-center bg-gray-50">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Edit mode banner ── */}
      {editMode && (
        <div className="mb-3 rounded-2xl p-3 border border-rose-300 text-center bg-rose-50">
          <p className="text-sm text-rose-500 font-semibold">🩸 Tap any day to mark or unmark as period</p>
          <p className="text-xs text-rose-400 mt-0.5">Tap "Done ✓" when finished</p>
        </div>
      )}

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 px-1">
        {[
          { color: 'bg-rose-400', label: 'Period' },
          { color: 'bg-rose-50 border-2 border-dashed border-rose-300', label: 'Predicted' },
          { color: 'bg-teal-50 border-2 border-teal-300', label: 'Fertile' },
          { color: 'bg-teal-100 border-2 border-teal-400', label: 'Ovulation' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3.5 h-3.5 rounded-full ${l.color}`} />
            <span className="text-[10px] text-gray-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* ── Scrollable calendar ── */}
      <div className="rounded-3xl bg-white border border-rose-100 shadow-sm px-4 pt-4 pb-2 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-700">Calendar</p>
          <div className="flex gap-2">
            <button
              onClick={() => todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="text-xs px-3 py-1.5 rounded-full border border-rose-200 text-rose-400 font-medium hover:bg-rose-50"
            >
              Today
            </button>
            <button
              onClick={() => setEditMode(m => !m)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${editMode
                ? 'bg-rose-400 text-white shadow-md shadow-rose-200'
                : 'border border-rose-300 text-rose-400 hover:bg-rose-50'}`}
            >
              {editMode ? 'Done ✓' : '🩸 Edit Period'}
            </button>
          </div>
        </div>

        <div className="max-h-[520px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {months.map((month) => {
            const isCurrentMonth = format(month, 'yyyy-MM') === format(new Date(), 'yyyy-MM');
            return (
              <div key={format(month, 'yyyy-MM')} ref={isCurrentMonth ? todayRef : undefined}>
                <MonthGrid
                  month={month}
                  periods={periods}
                  logs={logs}
                  cycleInfo={cycleInfo}
                  editMode={editMode}
                  selectedDate={selectedDate}
                  onDayTap={handleDayTap}
                  onEditTap={setEditingPeriod}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Selected day panel ── */}
      {selectedDate && !editMode && (
        <div className="rounded-3xl bg-white border border-rose-100 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-gray-800">{format(selectedDate, 'MMMM d')} · Cycle day {cycleInfo.cycleDay}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedStatus === 'period' ? '🔴 Period day' :
                  selectedStatus === 'fertile' ? '🟢 Fertile window' :
                  selectedStatus === 'ovulation' ? '⭐ Ovulation day' :
                  selectedStatus === 'predicted' ? '🔮 Predicted period' :
                  selectedLog ? '✓ Logged' : 'Tap to log symptoms'}
              </p>
            </div>
            <button onClick={() => setShowLogModal(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-400 text-white text-xs font-bold shadow-md shadow-rose-200">
              <Edit3 className="w-3 h-3" />
              {selectedLog ? 'Edit' : 'Log day'}
            </button>
          </div>
          {selectedLog ? (
            <div className="flex flex-wrap gap-2">
              {selectedLog.flow && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-500 font-medium capitalize">💧 {selectedLog.flow}</span>
              )}
              {selectedLog.mood && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-500 font-medium">{selectedLog.mood}</span>
              )}
              {(selectedLog.symptoms || []).slice(0, 4).map(s => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-600 font-medium">{s}</span>
              ))}
              {(selectedLog.symptoms || []).length > 4 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                  +{(selectedLog.symptoms || []).length - 4} more
                </span>
              )}
              {selectedLog.notes && (
                <p className="w-full text-xs text-gray-500 mt-1 italic">"{selectedLog.notes}"</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No symptoms logged for this day yet.</p>
          )}
        </div>
      )}

      {/* ── Cycle History ── */}
      <CycleHistory
        periods={periods}
        cycleInfo={cycleInfo}
        onEdit={setEditingPeriod}
      />

      {/* ── Symptom trends ── */}
      <SymptomTrends logs={logs} />

      {/* ── Ad banner ── */}
      <div className="mt-2">
        <AdBanner slot={import.meta.env.VITE_AD_SLOT_CYCLE} format="horizontal" />
      </div>

      {/* Modals */}
      {showLogModal && selectedDate && (
        <LogModal
          date={selectedDate}
          log={selectedLog || { date: selectedDateStr! }}
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