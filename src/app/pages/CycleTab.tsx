import { useState, useCallback } from 'react';
import { useUserData } from '../context/UserDataContext';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, subMonths, addMonths, isToday, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Check, Trash2, Edit3, Droplet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DayLog {
  date: string; flow?: 'light'|'medium'|'heavy'|'spotting';
  mood?: string; symptoms?: string[]; notes?: string;
}
interface PeriodEntry { id: string; start: string; end: string; }

function generateId() { return Math.random().toString(36).slice(2, 9); }

function calculateCycleInfo(periods: PeriodEntry[], currentDate: Date = new Date()) {
  if (periods.length === 0) return {
    cycleDay: 14, nextPeriod: addDays(currentDate, 14), cycleLength: 28,
    periodLength: 5, phase: 'unknown', ovulationDay: 14, fertileStart: 9, fertileEnd: 15, lastStart: null,
  };
  const sorted = [...periods].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const lastStart = new Date(sorted[sorted.length - 1].start);
  let avgCycleLength = 28;
  if (sorted.length >= 2) {
    const lengths: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const diff = differenceInDays(new Date(sorted[i].start), new Date(sorted[i-1].start));
      if (diff >= 20 && diff <= 45) lengths.push(diff);
    }
    if (lengths.length > 0) avgCycleLength = Math.round(lengths.reduce((a, b) => a + b) / lengths.length);
  }
  let avgPeriodLength = 5;
  const pLengths = sorted.map(p => p.end ? differenceInDays(new Date(p.end), new Date(p.start)) + 1 : 5).filter(l => l >= 2 && l <= 10);
  if (pLengths.length > 0) avgPeriodLength = Math.round(pLengths.reduce((a, b) => a + b) / pLengths.length);
  const cycleDay = Math.max(1, differenceInDays(currentDate, lastStart) % avgCycleLength + 1);
  const daysUntilNext = avgCycleLength - (differenceInDays(currentDate, lastStart) % avgCycleLength);
  const nextPeriod = addDays(currentDate, daysUntilNext);
  let phase = 'luteal';
  if (cycleDay <= avgPeriodLength) phase = 'menstrual';
  else if (cycleDay <= 13) phase = 'follicular';
  else if (cycleDay <= 16) phase = 'ovulation';
  const ovulationDay = avgCycleLength - 14;
  return { cycleDay, nextPeriod, cycleLength: avgCycleLength, periodLength: avgPeriodLength,
    phase, ovulationDay, fertileStart: ovulationDay - 5, fertileEnd: ovulationDay + 1, lastStart };
}

function getDayType(date: Date, periods: PeriodEntry[], cycleInfo: any): string {
  for (const period of periods) {
    const start = new Date(period.start);
    const end = period.end ? new Date(period.end) : addDays(start, 4);
    if (date >= start && date <= end) return 'period';
  }
  if (cycleInfo.lastStart) {
    const daysSinceLast = differenceInDays(date, cycleInfo.lastStart);
    if (daysSinceLast > 0) {
      const pos = daysSinceLast % cycleInfo.cycleLength;
      if (pos < cycleInfo.periodLength) return 'predicted';
      if (pos === cycleInfo.ovulationDay) return 'ovulation';
      if (pos >= cycleInfo.fertileStart && pos <= cycleInfo.fertileEnd) return 'fertile';
    }
  }
  return 'normal';
}

// ─── Edit Period Modal ────────────────────────────────────────────────────────
function EditPeriodModal({ period, onSave, onDelete, onClose }: {
  period: PeriodEntry;
  onSave: (p: PeriodEntry) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [start, setStart] = useState(period.start);
  const [end, setEnd] = useState(period.end);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-5" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl p-6 space-y-5 border border-white/30"
        style={{ background: 'rgba(255,240,245,0.92)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-rose-700">Edit Period</h3>
          <button onClick={onClose} className="p-2 hover:bg-rose-100 rounded-xl">
            <X className="w-4 h-4 text-rose-400"/>
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-rose-400 font-semibold mb-1 block">Start Date</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)}
              className="w-full p-3 rounded-2xl border border-rose-200 bg-white/80 text-sm focus:outline-none focus:border-rose-400"/>
          </div>
          <div>
            <label className="text-xs text-rose-400 font-semibold mb-1 block">End Date</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)}
              className="w-full p-3 rounded-2xl border border-rose-200 bg-white/80 text-sm focus:outline-none focus:border-rose-400"/>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { onDelete(period.id); onClose(); }}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-rose-100 text-rose-500 text-sm font-semibold hover:bg-rose-200 transition-colors">
            <Trash2 className="w-4 h-4"/> Delete
          </button>
          <button onClick={() => { onSave({ ...period, start, end }); onClose(); }}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-400 text-white text-sm font-bold">
            <Check className="w-4 h-4 inline mr-1.5"/>Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Log Modal ────────────────────────────────────────────────────────────────
function LogModal({ date, log, onSave, onClose }: {
  date: Date; log: DayLog; onSave: (log: DayLog) => void; onClose: () => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<DayLog>({ ...log, date: format(date, 'yyyy-MM-dd') });

  const MOODS = ['😊','😔','😤','😰','😴','⚡','💆','🤯'];
  const MOOD_LABELS = ['Happy','Sad','Irritable','Anxious','Tired','Energetic','Calm','Overwhelmed'];
  const SYMPTOMS = ['Cramps','Bloating','Headache','Fatigue','Backache','Nausea','Tender breasts','Cravings','Insomnia','Acne'];

  const toggle = (v: string) => {
    const arr = draft.symptoms || [];
    setDraft({ ...draft, symptoms: arr.includes(v) ? arr.filter(s => s !== v) : [...arr, v] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto border-t border-white/30"
        style={{ background: 'rgba(255,240,250,0.95)' }}
        onClick={e => e.stopPropagation()}>

        <div className="w-10 h-1 rounded-full bg-rose-200 mx-auto"/>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-rose-700">{format(date, 'EEEE')}</h3>
            <p className="text-xs text-rose-400">{format(date, 'MMMM d, yyyy')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-100 rounded-xl">
            <X className="w-4 h-4 text-rose-300"/>
          </button>
        </div>

        {/* Flow */}
        <div>
          <p className="text-xs font-bold text-rose-600 mb-2">Flow</p>
          <div className="flex gap-2">
            {(['spotting','light','medium','heavy'] as const).map((f, i) => {
              const sizes = [16, 40, 65, 90];
              const active = draft.flow === f;
              return (
                <button key={f} onClick={() => setDraft({ ...draft, flow: active ? undefined : f })}
                  className={`flex-1 py-3 rounded-2xl text-xs font-medium transition-all border-2 ${
                    active ? 'border-rose-300 bg-rose-50 scale-105' : 'border-transparent bg-white/60 hover:border-rose-200'
                  }`}>
                  <div className="relative w-6 h-7 mx-auto mb-1">
                    <svg viewBox="0 0 24 28" className="w-full h-full">
                      <path d="M12 1 C12 1 3 12 3 17 C3 23 7 26 12 26 C17 26 21 23 21 17 C21 12 12 1 12 1Z"
                        fill="rgba(251,191,204,0.3)" stroke="rgba(251,191,204,0.5)" strokeWidth="1"/>
                      <clipPath id={`f-${f}`}><rect x="0" y={28 - 28 * sizes[i] / 100} width="24" height="28"/></clipPath>
                      <path d="M12 1 C12 1 3 12 3 17 C3 23 7 26 12 26 C17 26 21 23 21 17 C21 12 12 1 12 1Z"
                        fill="#f43f5e" clipPath={`url(#f-${f})`} opacity="0.7"/>
                    </svg>
                  </div>
                  <span className={`text-[10px] capitalize ${active ? 'text-rose-500 font-bold' : 'text-rose-300'}`}>{f}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mood */}
        <div>
          <p className="text-xs font-bold text-rose-600 mb-2">Mood</p>
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map((e, i) => (
              <button key={e} onClick={() => setDraft({ ...draft, mood: draft.mood === MOOD_LABELS[i] ? undefined : MOOD_LABELS[i] })}
                className={`flex flex-col items-center gap-1 py-2 rounded-2xl transition-all border-2 ${
                  draft.mood === MOOD_LABELS[i] ? 'border-pink-300 bg-pink-50 scale-105' : 'border-transparent bg-white/60 hover:border-pink-200'
                }`}>
                <span className="text-xl">{e}</span>
                <span className="text-[9px] text-rose-300">{MOOD_LABELS[i]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <p className="text-xs font-bold text-rose-600 mb-2">Symptoms</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map(s => (
              <button key={s} onClick={() => toggle(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  (draft.symptoms||[]).includes(s)
                    ? 'border-amber-300 bg-amber-50 text-amber-600'
                    : 'border-rose-100 bg-white/60 text-rose-400 hover:border-rose-300'
                }`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-bold text-rose-600 mb-2">Notes</p>
          <textarea value={draft.notes || ''} onChange={e => setDraft({ ...draft, notes: e.target.value })}
            placeholder="How are you feeling today?"
            className="w-full p-3 rounded-2xl border border-rose-100 bg-white/70 text-sm resize-none h-20 focus:outline-none focus:border-rose-300 text-rose-800 placeholder:text-rose-200"/>
        </div>

        <button onClick={() => { onSave(draft); onClose(); }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold shadow-lg shadow-rose-200 flex items-center justify-center gap-2">
          <Check className="w-4 h-4"/> Save
        </button>
      </div>
    </div>
  );
}

// ─── Day Cell ─────────────────────────────────────────────────────────────────
function DayCell({ day, dayType, log, isSelected, isPeriodMode, onTap }: {
  day: Date; dayType: string; log?: DayLog;
  isSelected: boolean; isPeriodMode: boolean;
  onTap: () => void;
}) {
  const today = isToday(day);

  // Soft Flo-style colors
  let bg = '';
  let textColor = 'text-gray-600';
  let dotColor = '';

  if (dayType === 'period') {
    bg = 'bg-rose-300';
    textColor = 'text-white';
    dotColor = 'bg-rose-200';
  } else if (dayType === 'predicted') {
    bg = 'bg-rose-100';
    textColor = 'text-rose-400';
  } else if (dayType === 'ovulation') {
    bg = 'bg-amber-200';
    textColor = 'text-amber-700';
  } else if (dayType === 'fertile') {
    bg = 'bg-emerald-100';
    textColor = 'text-emerald-600';
  }

  const selectedRing = isSelected && !isPeriodMode ? 'ring-2 ring-primary ring-offset-1' : '';
  const todayStyle = today && !bg ? 'ring-2 ring-primary/40' : '';
  const periodModeHover = isPeriodMode ? 'hover:bg-rose-200 cursor-cell' : 'cursor-pointer';

  return (
    <button onClick={onTap}
      className={`relative flex flex-col items-center justify-center h-10 w-full rounded-2xl transition-all duration-100 select-none
        ${bg || 'hover:bg-purple-50'}
        ${textColor}
        ${selectedRing}
        ${todayStyle}
        ${periodModeHover}
        ${isSelected && !bg ? 'bg-purple-50' : ''}
      `}>
      <span className={`text-xs font-medium leading-none ${today && !bg ? 'font-bold text-primary' : ''}`}>
        {format(day, 'd')}
      </span>
      {/* Log dots */}
      <div className="flex gap-0.5 mt-0.5">
        {log?.flow && <div className="w-1 h-1 rounded-full bg-rose-400"/>}
        {log?.mood && <div className="w-1 h-1 rounded-full bg-purple-400"/>}
        {(log?.symptoms||[]).length > 0 && <div className="w-1 h-1 rounded-full bg-amber-400"/>}
      </div>
    </button>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function CycleTab() {
  const { userData } = useUserData();
  const { t } = useTranslation();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PeriodEntry | null>(null);
  const [isPeriodMode, setIsPeriodMode] = useState(false);

  const [logs, setLogs] = useState<Record<string, DayLog>>(() => {
    try { return JSON.parse(localStorage.getItem('zodiac_day_logs') || '{}'); } catch { return {}; }
  });

  const [periods, setPeriods] = useState<PeriodEntry[]>(() => {
    try {
      const s = localStorage.getItem('zodiac_periods');
      if (s) {
        const parsed = JSON.parse(s);
        // Add ids to old entries if missing
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

  const cycleInfo = calculateCycleInfo(periods);

  // Month calendar days
  const monthDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startWeekday = (startOfMonth(currentMonth).getDay() + 6) % 7;

  // Week strip
  const today = new Date();
  const weekStart = startOfWeek(selectedDate || today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Toggle period day on tap in period mode
  const handleDayTap = useCallback((day: Date) => {
    if (isPeriodMode) {
      const dateStr = format(day, 'yyyy-MM-dd');
      // Check if this day is already in a period
      const existingIdx = periods.findIndex(p => {
        const start = new Date(p.start);
        const end = p.end ? new Date(p.end) : addDays(start, 4);
        return day >= start && day <= end;
      });

      if (existingIdx >= 0) {
        // Remove day from period — shrink or split
        const p = periods[existingIdx];
        const pStart = new Date(p.start);
        const pEnd = new Date(p.end);
        if (isSameDay(day, pStart) && isSameDay(day, pEnd)) {
          // Single day period — delete it
          savePeriods(periods.filter((_, i) => i !== existingIdx));
        } else if (isSameDay(day, pStart)) {
          // Remove start day
          const newPeriods = [...periods];
          newPeriods[existingIdx] = { ...p, start: format(addDays(pStart, 1), 'yyyy-MM-dd') };
          savePeriods(newPeriods);
        } else if (isSameDay(day, pEnd)) {
          // Remove end day
          const newPeriods = [...periods];
          newPeriods[existingIdx] = { ...p, end: format(addDays(pEnd, -1), 'yyyy-MM-dd') };
          savePeriods(newPeriods);
        } else {
          // Remove middle day — split into two periods
          const newPeriods = [...periods];
          newPeriods.splice(existingIdx, 1,
            { id: generateId(), start: p.start, end: format(addDays(day, -1), 'yyyy-MM-dd') },
            { id: generateId(), start: format(addDays(day, 1), 'yyyy-MM-dd'), end: p.end }
          );
          savePeriods(newPeriods);
        }
      } else {
        // Add as new single-day period or extend existing nearby period
        const nearby = periods.find(p => {
          const pEnd = new Date(p.end);
          const pStart = new Date(p.start);
          return differenceInDays(day, pEnd) === 1 || differenceInDays(pStart, day) === 1;
        });
        if (nearby) {
          const pEnd = new Date(nearby.end);
          const pStart = new Date(nearby.start);
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
  }, [isPeriodMode, periods]);

  const phaseInfo: Record<string, { emoji: string; label: string; desc: string; color: string }> = {
    menstrual:  { emoji: '🔴', label: 'Menstrual',  desc: 'Rest and be gentle with yourself', color: 'text-rose-500' },
    follicular: { emoji: '💜', label: 'Follicular', desc: 'Energy is rising — great for new starts', color: 'text-purple-500' },
    ovulation:  { emoji: '⭐', label: 'Ovulation',  desc: 'Peak energy and fertility window', color: 'text-amber-500' },
    luteal:     { emoji: '🌸', label: 'Luteal',     desc: 'Wind down and focus inward', color: 'text-pink-400' },
    unknown:    { emoji: '✨', label: 'Unknown',    desc: 'Add your period dates to get insights', color: 'text-muted-foreground' },
  };
  const phase = phaseInfo[cycleInfo.phase];
  const daysToNext = Math.max(0, differenceInDays(cycleInfo.nextPeriod, new Date()));

  return (
    <div className="space-y-4 pb-28">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">{t('cycle.title')}</h2>
        <button
          onClick={() => setIsPeriodMode(m => !m)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
            isPeriodMode
              ? 'bg-rose-400 text-white border-rose-400 shadow-lg shadow-rose-200'
              : 'glass border-white/40 text-rose-400'
          }`}>
          <Droplet className="w-3.5 h-3.5"/>
          {isPeriodMode ? 'Tap days to mark ✓' : 'Log Period'}
        </button>
      </div>

      {/* Period mode banner */}
      {isPeriodMode && (
        <div className="rounded-2xl p-3 border border-rose-200 text-center"
          style={{ background: 'rgba(255,228,230,0.6)' }}>
          <p className="text-sm text-rose-500 font-medium">🩸 Tap any day to mark or unmark as period</p>
          <p className="text-xs text-rose-400 mt-0.5">Tap "Log Period" again when done</p>
        </div>
      )}

      {/* ── Cycle summary card ── */}
      <div className="rounded-3xl p-5 border border-white/30"
        style={{ background: 'linear-gradient(135deg, rgba(255,228,230,0.6) 0%, rgba(243,232,255,0.6) 100%)' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.6)' }}>
            {phase.emoji}
          </div>
          <div className="flex-1">
            <p className={`text-base font-bold ${phase.color}`}>{phase.label} Phase</p>
            <p className="text-xs text-muted-foreground mt-0.5">{phase.desc}</p>
            <div className="flex gap-3 mt-2">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">{cycleInfo.cycleDay}</p>
                <p className="text-[10px] text-muted-foreground">Cycle day</p>
              </div>
              <div className="w-px bg-white/40"/>
              <div className="text-center">
                <p className="text-lg font-bold text-rose-400">{daysToNext}</p>
                <p className="text-[10px] text-muted-foreground">Days to period</p>
              </div>
              <div className="w-px bg-white/40"/>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-400">{cycleInfo.cycleLength}</p>
                <p className="text-[10px] text-muted-foreground">Cycle length</p>
              </div>
            </div>
          </div>
        </div>

        {/* Soft progress bar */}
        <div className="mt-4">
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.4)' }}>
            {[
              { start: 0, len: cycleInfo.periodLength, color: 'rgba(251,113,133,0.8)' },
              { start: cycleInfo.periodLength, len: cycleInfo.fertileStart - cycleInfo.periodLength, color: 'rgba(192,132,252,0.6)' },
              { start: cycleInfo.fertileStart, len: cycleInfo.fertileEnd - cycleInfo.fertileStart + 1, color: 'rgba(52,211,153,0.7)' },
              { start: cycleInfo.fertileEnd + 1, len: cycleInfo.cycleLength - cycleInfo.fertileEnd, color: 'rgba(251,191,204,0.6)' },
            ].map((seg, i) => (
              <div key={i} className="absolute h-2.5 rounded-full"
                style={{
                  left: `${(seg.start / cycleInfo.cycleLength) * 100}%`,
                  width: `${(seg.len / cycleInfo.cycleLength) * 100}%`,
                  background: seg.color,
                  position: 'absolute',
                }}/>
            ))}
          </div>
          {/* Current day marker */}
          <div className="relative h-2.5 -mt-2.5">
            <div className="absolute top-0 w-3 h-3 rounded-full bg-white border-2 border-primary shadow-md -translate-y-0 transition-all"
              style={{ left: `calc(${((cycleInfo.cycleDay - 1) / cycleInfo.cycleLength) * 100}% - 6px)` }}/>
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-3 px-0.5">
            <span>🔴 Period</span><span>💜 Follicular</span><span>🟢 Fertile</span><span>🌸 Luteal</span>
          </div>
        </div>
      </div>

      {/* ── Week strip ── */}
      <div className="rounded-3xl p-4 border border-white/30" style={{ background: 'rgba(255,255,255,0.5)' }}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setSelectedDate(d => addDays(d || today, -7))} className="p-1.5 hover:bg-rose-50 rounded-xl">
            <ChevronLeft className="w-4 h-4 text-rose-300"/>
          </button>
          <p className="text-xs font-semibold text-muted-foreground">
            {isPeriodMode ? '🩸 Tap to mark period days' : 'Tap to select • tap Log to add notes'}
          </p>
          <button onClick={() => setSelectedDate(d => addDays(d || today, 7))} className="p-1.5 hover:bg-rose-50 rounded-xl">
            <ChevronRight className="w-4 h-4 text-rose-300"/>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-muted-foreground font-semibold">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <DayCell key={format(day, 'yyyy-MM-dd')} day={day}
              dayType={getDayType(day, periods, cycleInfo)}
              log={logs[format(day, 'yyyy-MM-dd')]}
              isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
              isPeriodMode={isPeriodMode}
              onTap={() => handleDayTap(day)}
            />
          ))}
        </div>
      </div>

      {/* ── Selected day panel ── */}
      {selectedDate && !isPeriodMode && (
        <div className="rounded-3xl p-4 border border-pink-100" style={{ background: 'rgba(255,240,245,0.8)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-rose-700">{format(selectedDate, 'EEEE, MMMM d')}</p>
              <p className="text-xs text-rose-400 mt-0.5">
                {logs[format(selectedDate, 'yyyy-MM-dd')] ? '✓ Logged' : 'Nothing logged yet'}
              </p>
            </div>
            <button onClick={() => setShowLogModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-400 to-pink-400 text-white text-xs font-bold shadow-md shadow-rose-200">
              <Edit3 className="w-3 h-3"/>
              {logs[format(selectedDate, 'yyyy-MM-dd')] ? 'Edit' : 'Log day'}
            </button>
          </div>
          {/* Show logged data */}
          {logs[format(selectedDate, 'yyyy-MM-dd')] && (
            <div className="flex flex-wrap gap-2 mt-3">
              {logs[format(selectedDate, 'yyyy-MM-dd')].flow && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-500 font-medium capitalize">
                  💧 {logs[format(selectedDate, 'yyyy-MM-dd')].flow}
                </span>
              )}
              {logs[format(selectedDate, 'yyyy-MM-dd')].mood && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-500 font-medium">
                  {logs[format(selectedDate, 'yyyy-MM-dd')].mood}
                </span>
              )}
              {(logs[format(selectedDate, 'yyyy-MM-dd')].symptoms || []).map(s => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-600 font-medium">{s}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Monthly calendar ── */}
      <div className="rounded-3xl p-4 border border-white/30" style={{ background: 'rgba(255,255,255,0.5)' }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-rose-50 rounded-xl">
            <ChevronLeft className="w-4 h-4 text-rose-300"/>
          </button>
          <p className="font-bold text-sm text-rose-700">{format(currentMonth, 'MMMM yyyy')}</p>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-rose-50 rounded-xl">
            <ChevronRight className="w-4 h-4 text-rose-300"/>
          </button>
        </div>
        <div className="grid grid-cols-7 mb-2">
          {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
            <div key={d} className="text-center text-[10px] text-muted-foreground font-bold py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startWeekday }).map((_, i) => <div key={`e-${i}`}/>)}
          {monthDays.map(day => (
            <DayCell key={format(day, 'yyyy-MM-dd')} day={day}
              dayType={getDayType(day, periods, cycleInfo)}
              log={logs[format(day, 'yyyy-MM-dd')]}
              isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
              isPeriodMode={isPeriodMode}
              onTap={() => handleDayTap(day)}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-rose-100">
          {[
            { color: 'bg-rose-300', label: 'Period' },
            { color: 'bg-rose-100', label: 'Predicted' },
            { color: 'bg-emerald-100', label: 'Fertile' },
            { color: 'bg-amber-200', label: 'Ovulation' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${l.color}`}/>
              <span className="text-[10px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Period history ── */}
      <div className="rounded-3xl p-5 border border-white/30" style={{ background: 'rgba(255,255,255,0.5)' }}>
        <h3 className="text-sm font-bold text-rose-700 mb-3">Period History</h3>
        {periods.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">🩸</p>
            <p className="text-sm text-muted-foreground">No periods logged yet</p>
            <p className="text-xs text-muted-foreground mt-1">Tap "Log Period" and mark your days</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...periods]
              .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
              .slice(0, 6)
              .map(p => (
                <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-2xl border border-rose-100"
                  style={{ background: 'rgba(255,228,230,0.4)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-300"/>
                    <span className="text-sm font-medium text-rose-700">
                      {format(new Date(p.start), 'MMM d')} – {p.end ? format(new Date(p.end), 'MMM d') : '?'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.end && (
                      <span className="text-xs text-rose-400">
                        {differenceInDays(new Date(p.end), new Date(p.start)) + 1}d
                      </span>
                    )}
                    <button onClick={() => setEditingPeriod(p)}
                      className="p-1.5 hover:bg-rose-100 rounded-lg transition-colors">
                      <Edit3 className="w-3.5 h-3.5 text-rose-400"/>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showLogModal && selectedDate && (
        <LogModal
          date={selectedDate}
          log={logs[format(selectedDate, 'yyyy-MM-dd')] || { date: format(selectedDate, 'yyyy-MM-dd') }}
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
