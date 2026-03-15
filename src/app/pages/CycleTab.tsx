import { useState, useEffect, useRef, useCallback } from 'react';
import { useUserData } from '../context/UserDataContext';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, subMonths, addMonths, isToday, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Check, Droplet, Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DayLog {
  date: string; flow?: 'light'|'medium'|'heavy'|'spotting';
  mood?: string; symptoms?: string[]; discharge?: string; sex?: boolean; notes?: string;
}
interface PeriodEntry { start: string; end: string; }

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
      if (pos < cycleInfo.periodLength) return 'predicted-period';
      if (pos === cycleInfo.ovulationDay) return 'ovulation';
      if (pos >= cycleInfo.fertileStart && pos <= cycleInfo.fertileEnd) return 'fertile';
    }
  }
  return 'normal';
}

// ─── Phase Arc ────────────────────────────────────────────────────────────────
function PhaseArc({ cycleDay, cycleLength, periodLength }: { cycleDay: number; cycleLength: number; periodLength: number }) {
  const r = 52, cx = 68, cy = 68;
  const phases = [
    { start: 0, len: periodLength, color: '#f43f5e' },
    { start: periodLength, len: Math.max(1, 13 - periodLength), color: '#c084fc' },
    { start: 13, len: 3, color: '#f59e0b' },
    { start: 16, len: Math.max(1, cycleLength - 16), color: '#fbbfd4' },
  ];
  return (
    <svg viewBox="0 0 136 136" style={{ width: 136, height: 136 }}>
      <defs>
        <filter id="arcg"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(192,132,252,0.12)" strokeWidth="8"/>
      {phases.map((ph, i) => {
        const sa = (ph.start / cycleLength) * 360 - 90;
        const sw = (ph.len / cycleLength) * 360;
        if (sw <= 0) return null;
        const s = sa * Math.PI / 180, e = (sa + sw) * Math.PI / 180;
        const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
        const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
        return <path key={i} d={`M${x1},${y1} A${r},${r} 0 ${sw > 180 ? 1 : 0} 1 ${x2},${y2}`}
          fill="none" stroke={ph.color} strokeWidth="8" strokeLinecap="round" opacity="0.85" filter="url(#arcg)"/>;
      })}
      {(() => {
        const angle = ((cycleDay - 1) / cycleLength) * 360 - 90;
        const rad = angle * Math.PI / 180;
        const x = cx + r * Math.cos(rad), y = cy + r * Math.sin(rad);
        return <g filter="url(#arcg)">
          <circle cx={x} cy={y} r={9} fill="white" stroke="#c084fc" strokeWidth="2.5"
            style={{ filter: 'drop-shadow(0 0 8px rgba(192,132,252,0.9))' }}/>
          <circle cx={x} cy={y} r={4} fill="#c084fc"/>
        </g>;
      })()}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="24" fontWeight="bold" fill="#2d1b3d">{cycleDay}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#8b5a9f" opacity="0.8">day</text>
    </svg>
  );
}

// ─── Log Modal ────────────────────────────────────────────────────────────────
function LogModal({ date, log, onSave, onClose }: {
  date: Date; log: DayLog; onSave: (log: DayLog) => void; onClose: () => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<DayLog>({ ...log, date: format(date, 'yyyy-MM-dd') });

  const FLOW = [
    { key: 'spotting', label: t('cycle.flow.spotting'), pct: 15, color: '#fda4af' },
    { key: 'light',    label: t('cycle.flow.light'),    pct: 40, color: '#fb7185' },
    { key: 'medium',   label: t('cycle.flow.medium'),   pct: 65, color: '#f43f5e' },
    { key: 'heavy',    label: t('cycle.flow.heavy'),    pct: 90, color: '#e11d48' },
  ];
  const MOODS = [
    { e: '😊', l: t('cycle.moods.happy') },    { e: '😔', l: t('cycle.moods.sad') },
    { e: '😤', l: t('cycle.moods.irritable') }, { e: '😰', l: t('cycle.moods.anxious') },
    { e: '😴', l: t('cycle.moods.tired') },     { e: '⚡', l: t('cycle.moods.energetic') },
    { e: '💆', l: t('cycle.moods.calm') },      { e: '🤯', l: t('cycle.moods.overwhelmed') },
  ];
  const SYMPTOMS = [
    t('cycle.symptoms.cramps'), t('cycle.symptoms.bloating'), t('cycle.symptoms.headache'),
    t('cycle.symptoms.fatigue'), t('cycle.symptoms.backache'), t('cycle.symptoms.nausea'),
    t('cycle.symptoms.spotting'), t('cycle.symptoms.tenderBreasts'), t('cycle.symptoms.cravings'),
    t('cycle.symptoms.insomnia'), t('cycle.symptoms.acne'), t('cycle.symptoms.moodSwings'),
  ];
  const DISCHARGE = [
    t('cycle.discharge.none'), t('cycle.discharge.dry'), t('cycle.discharge.sticky'),
    t('cycle.discharge.creamy'), t('cycle.discharge.watery'), t('cycle.discharge.eggWhite'),
  ];
  const toggle = (v: string) => {
    const arr = draft.symptoms || [];
    setDraft({ ...draft, symptoms: arr.includes(v) ? arr.filter(s => s !== v) : [...arr, v] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-heavy w-full max-w-lg rounded-t-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto border-t border-white/40"
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="w-12 h-1.5 rounded-full bg-border/50 mx-auto -mt-2 mb-0"/>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{format(date, 'EEEE')}</h3>
            <p className="text-sm text-muted-foreground">{format(date, 'MMMM d, yyyy')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-5 h-5 text-muted-foreground"/>
          </button>
        </div>

        {/* Flow */}
        <div>
          <p className="text-sm font-bold mb-3">{t('cycle.log.flow')}</p>
          <div className="flex gap-2">
            {FLOW.map(f => (
              <button key={f.key}
                onClick={() => setDraft({ ...draft, flow: draft.flow === f.key as any ? undefined : f.key as any })}
                className={`flex-1 py-3 rounded-2xl text-xs font-medium transition-all border-2 ${
                  draft.flow === f.key
                    ? 'border-rose-400 bg-rose-50 shadow-md scale-105'
                    : 'border-transparent glass hover:border-rose-200'
                }`}>
                <div className="relative w-8 h-9 mx-auto mb-1">
                  <svg viewBox="0 0 32 36" className="w-full h-full">
                    <clipPath id={`fc-${f.key}`}>
                      <rect x="0" y={36 - 36 * f.pct / 100} width="32" height="36"/>
                    </clipPath>
                    <path d="M16 2 C16 2 4 16 4 23 C4 30 9.4 34 16 34 C22.6 34 28 30 28 23 C28 16 16 2 16 2Z"
                      fill="rgba(244,63,94,0.1)" stroke="rgba(244,63,94,0.25)" strokeWidth="1.5"/>
                    <path d="M16 2 C16 2 4 16 4 23 C4 30 9.4 34 16 34 C22.6 34 28 30 28 23 C28 16 16 2 16 2Z"
                      fill={f.color} clipPath={`url(#fc-${f.key})`} opacity="0.9"/>
                  </svg>
                </div>
                <span className={`text-[11px] ${draft.flow === f.key ? 'text-rose-600 font-semibold' : 'text-muted-foreground'}`}>
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div>
          <p className="text-sm font-bold mb-3">{t('cycle.log.mood')}</p>
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map(m => (
              <button key={m.e}
                onClick={() => setDraft({ ...draft, mood: draft.mood === m.l ? undefined : m.l })}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all border-2 ${
                  draft.mood === m.l
                    ? 'border-primary bg-primary/10 scale-105 shadow-md'
                    : 'border-transparent glass hover:border-primary/30'
                }`}>
                <span className="text-2xl">{m.e}</span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight px-0.5">
                  {m.l.replace(/^[^\s]+\s/, '')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <p className="text-sm font-bold mb-3">{t('cycle.log.symptoms')}</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map(s => (
              <button key={s} onClick={() => toggle(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2 ${
                  (draft.symptoms || []).includes(s)
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-transparent glass text-muted-foreground hover:border-amber-200'
                }`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Discharge */}
        <div>
          <p className="text-sm font-bold mb-3">{t('cycle.log.discharge')}</p>
          <div className="flex flex-wrap gap-2">
            {DISCHARGE.map(d => (
              <button key={d} onClick={() => setDraft({ ...draft, discharge: draft.discharge === d ? undefined : d })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2 ${
                  draft.discharge === d
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-transparent glass text-muted-foreground hover:border-blue-200'
                }`}>{d}</button>
            ))}
          </div>
        </div>

        {/* Sex */}
        <div className="flex items-center justify-between glass rounded-2xl px-4 py-3 border border-white/30">
          <p className="text-sm font-bold">{t('cycle.log.sex')}</p>
          <button onClick={() => setDraft({ ...draft, sex: !draft.sex })}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border-2 ${
              draft.sex ? 'border-pink-400 bg-pink-50 text-pink-600' : 'border-white/40 text-muted-foreground hover:border-pink-300'
            }`}>
            {draft.sex ? t('cycle.log.sexYes') : t('cycle.log.sexLog')}
          </button>
        </div>

        {/* Notes */}
        <div>
          <p className="text-sm font-bold mb-2">{t('cycle.log.notes')}</p>
          <textarea value={draft.notes || ''} onChange={e => setDraft({ ...draft, notes: e.target.value })}
            placeholder={t('cycle.log.notesPlaceholder')}
            className="w-full p-3 rounded-2xl border-2 border-white/30 glass text-sm resize-none h-24 focus:outline-none focus:border-primary/50 transition-colors"/>
        </div>

        {/* Save */}
        <button onClick={() => { onSave(draft); onClose(); }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold btn-glow flex items-center justify-center gap-2">
          <Check className="w-5 h-5"/> {t('cycle.log.save')}
        </button>
      </div>
    </div>
  );
}

// ─── Add Period Modal ─────────────────────────────────────────────────────────
function AddPeriodModal({ onSave, onClose }: { onSave: (p: PeriodEntry) => void; onClose: () => void }) {
  const { t } = useTranslation();
  const [start, setStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [end, setEnd] = useState(format(addDays(new Date(), 4), 'yyyy-MM-dd'));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-5" onClick={onClose}>
      <div className="glass-heavy w-full max-w-sm rounded-3xl p-6 space-y-5 border border-white/40" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{t('cycle.addPeriodTitle')}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl"><X className="w-5 h-5 text-muted-foreground"/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">{t('onboarding.startDate')}</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)}
              className="w-full p-3 rounded-2xl border-2 border-white/30 glass text-sm focus:outline-none focus:border-primary/50"/>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">{t('onboarding.endDate')}</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)}
              className="w-full p-3 rounded-2xl border-2 border-white/30 glass text-sm focus:outline-none focus:border-primary/50"/>
          </div>
        </div>
        <button onClick={() => { onSave({ start, end }); onClose(); }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold btn-glow">
          {t('cycle.savePeriod')}
        </button>
      </div>
    </div>
  );
}

// ─── Day Cell ─────────────────────────────────────────────────────────────────
function DayCell({ day, dayType, log, isSelected, onSingleTap, onDoubleTap, size = 'md' }: {
  day: Date; dayType: string; log?: DayLog; isSelected: boolean;
  onSingleTap: () => void; onDoubleTap: () => void; size?: 'sm' | 'md';
}) {
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapCount = useRef(0);

  const handleTap = () => {
    tapCount.current += 1;
    if (tapCount.current === 1) {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
        onSingleTap();
      }, 250);
    } else if (tapCount.current === 2) {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapCount.current = 0;
      onDoubleTap();
    }
  };

  // Day type styling
  const todayDay = isToday(day);
  let bg = '';
  let textColor = 'text-foreground';
  let ring = '';
  let glow = '';

  if (dayType === 'period') {
    bg = 'bg-gradient-to-b from-rose-400 to-rose-500';
    textColor = 'text-white';
    glow = 'shadow-[0_2px_8px_rgba(244,63,94,0.4)]';
  } else if (dayType === 'predicted-period') {
    bg = 'bg-rose-100';
    textColor = 'text-rose-500';
    ring = 'ring-1 ring-dashed ring-rose-300';
  } else if (dayType === 'ovulation') {
    bg = 'bg-gradient-to-b from-amber-300 to-amber-400';
    textColor = 'text-amber-900';
    glow = 'shadow-[0_2px_8px_rgba(245,158,11,0.4)]';
  } else if (dayType === 'fertile') {
    bg = 'bg-emerald-100';
    textColor = 'text-emerald-700';
  }

  if (isSelected) {
    ring = 'ring-2 ring-primary ring-offset-2';
    glow = glow || 'shadow-[0_2px_12px_rgba(192,132,252,0.35)]';
  } else if (todayDay && !bg) {
    ring = 'ring-2 ring-primary/60';
    textColor = 'text-primary';
  }

  const h = size === 'sm' ? 'h-12' : 'h-11';

  return (
    <button onClick={handleTap}
      className={`relative flex flex-col items-center justify-center ${h} w-full rounded-xl transition-all duration-150 select-none
        ${bg || 'hover:bg-white/30'}
        ${textColor}
        ${ring}
        ${glow}
        ${isSelected && !bg ? 'bg-primary/10' : ''}
      `}>
      <span className={`text-xs leading-none ${todayDay && !bg ? 'font-bold' : 'font-medium'}`}>
        {format(day, 'd')}
      </span>
      {/* Dot indicators */}
      <div className="flex gap-0.5 mt-1 h-1.5">
        {log?.flow && <div className="w-1.5 h-1.5 rounded-full bg-rose-400"/>}
        {log?.mood && <div className="w-1 h-1 rounded-full bg-purple-400"/>}
        {(log?.symptoms||[]).length > 0 && <div className="w-1 h-1 rounded-full bg-amber-400"/>}
        {log?.sex && <div className="w-1 h-1 rounded-full bg-pink-400"/>}
      </div>
      {/* Double-tap hint on selected */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
          <Edit3 className="w-2 h-2 text-white"/>
        </div>
      )}
    </button>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function CycleTab() {
  const { userData } = useUserData();
  const { t } = useTranslation();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAddPeriod, setShowAddPeriod] = useState(false);

  const [logs, setLogs] = useState<Record<string, DayLog>>(() => {
    const s = localStorage.getItem('zodiac_day_logs');
    return s ? JSON.parse(s) : {};
  });
  const [periods, setPeriods] = useState<PeriodEntry[]>(() => {
    const s = localStorage.getItem('zodiac_periods');
    if (s) return JSON.parse(s);
    if (userData.lastPeriodStart) return [{
      start: format(new Date(userData.lastPeriodStart), 'yyyy-MM-dd'),
      end: userData.lastPeriodEnd
        ? format(new Date(userData.lastPeriodEnd), 'yyyy-MM-dd')
        : format(addDays(new Date(userData.lastPeriodStart), 4), 'yyyy-MM-dd'),
    }];
    return [];
  });

  useEffect(() => { localStorage.setItem('zodiac_day_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('zodiac_periods', JSON.stringify(periods)); }, [periods]);

  const cycleInfo = calculateCycleInfo(periods);

  const phaseColors: Record<string, string> = {
    menstrual: 'text-rose-500', follicular: 'text-primary',
    ovulation: 'text-amber-500', luteal: 'text-pink-400', unknown: 'text-muted-foreground',
  };
  const phaseEmoji: Record<string, string> = {
    menstrual: '🔴', follicular: '💜', ovulation: '🟡', luteal: '🌸', unknown: '✨',
  };

  // Week strip
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Month calendar
  const monthDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startWeekday = (startOfMonth(currentMonth).getDay() + 6) % 7; // Monday = 0

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedLog = logs[selectedDateStr];
  const selectedDayType = getDayType(selectedDate, periods, cycleInfo);

  const handleSingleTap = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleDoubleTap = useCallback((date: Date) => {
    setSelectedDate(date);
    setShowLogModal(true);
  }, []);

  // Day type info for the detail panel
  const dayTypeInfo: Record<string, { label: string; desc: string; color: string; bg: string }> = {
    'period':           { label: t('cycle.legend.period'),    desc: t('cycle.phaseDesc.menstrual'),  color: 'text-rose-600',   bg: 'bg-rose-50 border-rose-200' },
    'predicted-period': { label: t('cycle.legend.predicted'), desc: 'Your period is predicted here', color: 'text-rose-400',   bg: 'bg-rose-50 border-rose-100' },
    'ovulation':        { label: t('cycle.legend.ovulation'), desc: 'Peak fertility window today 🌟', color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200' },
    'fertile':          { label: t('cycle.legend.fertile'),   desc: 'You are in your fertile window', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  };
  const dayInfo = dayTypeInfo[selectedDayType];

  return (
    <div className="space-y-4 pb-28">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">{t('cycle.title')}</h2>
        <button onClick={() => setShowAddPeriod(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-white/40 text-primary text-xs font-bold">
          <Plus className="w-3.5 h-3.5"/> {t('cycle.addPeriod')}
        </button>
      </div>

      {/* ── Phase arc + stats ── */}
      <div className="glass glossy rounded-3xl p-5 border border-white/40">
        <div className="flex items-center gap-4">
          <PhaseArc cycleDay={cycleInfo.cycleDay} cycleLength={cycleInfo.cycleLength} periodLength={cycleInfo.periodLength}/>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">{phaseEmoji[cycleInfo.phase]}</span>
              <span className={`text-base font-bold ${phaseColors[cycleInfo.phase]}`}>
                {t(`cycle.phases.${cycleInfo.phase}` as any, { defaultValue: t('cycle.phases.unknown') })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {t(`cycle.phaseDesc.${cycleInfo.phase}` as any, { defaultValue: '' })}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="glass rounded-xl p-2.5 border border-white/30 text-center">
                <p className="text-[10px] text-muted-foreground">Cycle</p>
                <p className="text-sm font-bold text-primary">{cycleInfo.cycleLength}d</p>
              </div>
              <div className="glass rounded-xl p-2.5 border border-white/30 text-center">
                <p className="text-[10px] text-muted-foreground">Next 🔴</p>
                <p className="text-sm font-bold text-rose-500">
                  {Math.max(0, differenceInDays(cycleInfo.nextPeriod, new Date()))}d
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Segmented phase bar */}
        <div className="mt-4">
          <div className="relative h-3 rounded-full overflow-hidden bg-white/20">
            {[
              { start: 0, len: cycleInfo.periodLength, color: '#f43f5e' },
              { start: cycleInfo.periodLength, len: Math.max(1, cycleInfo.fertileStart - cycleInfo.periodLength), color: '#c084fc' },
              { start: cycleInfo.fertileStart, len: cycleInfo.fertileEnd - cycleInfo.fertileStart, color: '#10b981' },
              { start: cycleInfo.fertileEnd, len: cycleInfo.cycleLength - cycleInfo.fertileEnd, color: '#fbbfd4' },
            ].map((seg, i) => (
              <div key={i} className="absolute top-0 h-full opacity-80"
                style={{
                  left: `${(seg.start / cycleInfo.cycleLength) * 100}%`,
                  width: `${(seg.len / cycleInfo.cycleLength) * 100}%`,
                  background: seg.color,
                }}/>
            ))}
            {/* Marker */}
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-primary shadow-md transition-all"
              style={{ left: `calc(${((cycleInfo.cycleDay - 1) / cycleInfo.cycleLength) * 100}% - 6px)` }}/>
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1.5 px-0.5">
            <span>🔴 {t('cycle.phases.menstrual').split(' ')[0]}</span>
            <span>💜 {t('cycle.phases.follicular').split(' ')[0]}</span>
            <span>🟢 {t('cycle.legend.fertile')}</span>
            <span>🌸 {t('cycle.phases.luteal').split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* ── Week strip ── */}
      <div className="glass rounded-3xl p-4 border border-white/40">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setSelectedDate(d => addDays(d, -7))} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground"/>
          </button>
          <div className="text-center">
            <p className="text-sm font-bold">{format(weekStart, 'MMMM yyyy')}</p>
            <p className="text-[10px] text-muted-foreground">Tap once to select · double tap to log</p>
          </div>
          <button onClick={() => setSelectedDate(d => addDays(d, 7))} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground"/>
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
              isSelected={isSameDay(day, selectedDate)}
              onSingleTap={() => handleSingleTap(day)}
              onDoubleTap={() => handleDoubleTap(day)}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* ── Selected day panel ── */}
      <div className={`glass rounded-3xl p-5 border transition-all ${dayInfo ? `border-2 ${dayInfo.bg}` : 'border-white/40'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="font-bold text-base">{format(selectedDate, 'EEEE, MMMM d')}</p>
            {dayInfo ? (
              <div className="mt-1">
                <span className={`text-sm font-semibold ${dayInfo.color}`}>{dayInfo.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{dayInfo.desc}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedLog ? 'Logged ✓' : 'No data logged yet'}
              </p>
            )}
          </div>
          <button onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold btn-glow flex-shrink-0">
            <Edit3 className="w-3.5 h-3.5"/>
            {selectedLog ? 'Edit' : 'Log'}
          </button>
        </div>

        {/* Logged data preview */}
        {selectedLog && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {selectedLog.flow && (
              <div className="glass rounded-xl p-2.5 border border-white/30 flex items-center gap-2">
                <Droplet className="w-3.5 h-3.5 text-rose-400 flex-shrink-0"/>
                <div><p className="text-[9px] text-muted-foreground">{t('cycle.log.flow')}</p>
                <p className="text-xs font-semibold capitalize">{selectedLog.flow}</p></div>
              </div>
            )}
            {selectedLog.mood && (
              <div className="glass rounded-xl p-2.5 border border-white/30 flex items-center gap-2">
                <span className="text-base">{['😊','😔','😤','😰','😴','⚡','💆','🤯'][0]}</span>
                <div><p className="text-[9px] text-muted-foreground">{t('cycle.log.mood')}</p>
                <p className="text-xs font-semibold">{selectedLog.mood.split(' ').slice(-1)[0]}</p></div>
              </div>
            )}
            {(selectedLog.symptoms||[]).length > 0 && (
              <div className="col-span-2 glass rounded-xl p-2.5 border border-white/30">
                <p className="text-[9px] text-muted-foreground mb-1.5">{t('cycle.log.symptoms')}</p>
                <div className="flex flex-wrap gap-1">
                  {selectedLog.symptoms!.map(s => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {selectedLog.notes && (
              <div className="col-span-2 glass rounded-xl p-2.5 border border-white/30">
                <p className="text-[9px] text-muted-foreground mb-1">{t('cycle.log.notes')}</p>
                <p className="text-xs leading-relaxed">{selectedLog.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Monthly calendar ── */}
      <div className="glass rounded-3xl p-4 border border-white/40">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-muted-foreground"/>
          </button>
          <p className="font-bold text-sm">{format(currentMonth, 'MMMM yyyy')}</p>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5 text-muted-foreground"/>
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
              isSelected={isSameDay(day, selectedDate)}
              onSingleTap={() => handleSingleTap(day)}
              onDoubleTap={() => handleDoubleTap(day)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-3 border-t border-white/20">
          {[
            { color: 'bg-gradient-to-b from-rose-400 to-rose-500', label: t('cycle.legend.period') },
            { color: 'bg-rose-100 ring-1 ring-dashed ring-rose-300', label: t('cycle.legend.predicted') },
            { color: 'bg-emerald-100', label: t('cycle.legend.fertile') },
            { color: 'bg-gradient-to-b from-amber-300 to-amber-400', label: t('cycle.legend.ovulation') },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 rounded-full ${l.color}`}/>
              <span className="text-[10px] text-muted-foreground font-medium">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Period history ── */}
      <div className="glass rounded-3xl p-5 border border-white/40">
        <h3 className="text-sm font-bold mb-3">{t('cycle.history')}</h3>
        {periods.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('cycle.noHistory')}</p>
        ) : (
          <div className="space-y-2">
            {[...periods]
              .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
              .slice(0, 6)
              .map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-3 glass rounded-2xl border border-white/30">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-400"
                      style={{ boxShadow: '0 0 8px rgba(244,63,94,0.5)' }}/>
                    <span className="text-sm font-medium">
                      {format(new Date(p.start), 'MMM d')} – {p.end ? format(new Date(p.end), 'MMM d') : '?'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {p.end ? `${differenceInDays(new Date(p.end), new Date(p.start)) + 1} ${t('profile.days')}` : ''}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showLogModal && (
        <LogModal date={selectedDate}
          log={selectedLog || { date: selectedDateStr }}
          onSave={log => setLogs(prev => ({ ...prev, [log.date]: log }))}
          onClose={() => setShowLogModal(false)}
        />
      )}
      {showAddPeriod && (
        <AddPeriodModal
          onSave={period => setPeriods(prev => [...prev, period])}
          onClose={() => setShowAddPeriod(false)}
        />
      )}
    </div>
  );
}
