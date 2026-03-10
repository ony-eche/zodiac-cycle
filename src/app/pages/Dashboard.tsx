import { useState } from 'react';
import { useUserData } from '../context/UserDataContext';
import { ZodiacCycleLogo } from '../components/ZodiacCycleLogo';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import {
  Moon,
  Calendar,
  Star,
  TrendingUp,
  Heart,
  Droplet,
  Sparkles,
  Bell,
  ChevronRight,
  Home,
  User,
  MessageCircle,
  Activity,
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = 'home' | 'cycle' | 'chart' | 'transits' | 'messages' | 'profile';

// ─── Mock messages (replace with real AI-generated ones later) ───────────────
const MESSAGES = [
  {
    id: 1,
    date: 'March 14',
    title: 'Venus square Moon',
    preview: 'Emotional sensitivity peak today',
    full: `Venus is currently transiting your 6th house while forming a square with your natal Moon.\n\nThis can correlate with emotional sensitivity and hormonal imbalance.\n\nYou may notice:\n• Delayed ovulation\n• Mood fluctuations\n• Stronger PMS symptoms`,
    tag: 'Transit Insight',
    tagColor: 'bg-primary/20 text-primary',
    unread: true,
  },
  {
    id: 2,
    date: 'March 18',
    title: 'Full Moon in Virgo',
    preview: 'Your ovulation window opens',
    full: `The Full Moon in Virgo on March 18 aligns with your predicted ovulation window.\n\nVirgo energy supports body awareness and health routines. This is a powerful time to:\n• Track your basal body temperature\n• Notice cervical mucus changes\n• Support your body with nourishing foods\n\nThe moon illuminates what your body already knows.`,
    tag: 'Cycle Alert',
    tagColor: 'bg-secondary/40 text-foreground',
    unread: true,
  },
  {
    id: 3,
    date: 'March 12',
    title: 'Mars square Moon',
    preview: 'Possible stress on your cycle',
    full: `Mars is forming a square aspect to your natal Moon this week.\n\nThis transit can bring:\n• Heightened irritability before your period\n• Increased physical tension\n• Disrupted sleep patterns\n\nSelf-care ritual: Take a warm bath with magnesium salts tonight. Mars energy responds well to water and stillness.`,
    tag: 'Wellness',
    tagColor: 'bg-accent text-foreground',
    unread: false,
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function getZodiacSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '♈ Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '♉ Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return '♊ Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return '♋ Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '♌ Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '♍ Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return '♎ Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return '♏ Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return '♐ Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '♑ Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '♒ Aquarius';
  return '♓ Pisces';
}

function getCyclePhaseInfo(day: number) {
  if (day <= 5) return { label: 'Menstrual Phase', color: 'text-rose-400', desc: 'Rest and restore. Your body is releasing.' };
  if (day <= 13) return { label: 'Follicular Phase', color: 'text-primary', desc: 'Energy rising. Good time to start new things.' };
  if (day <= 16) return { label: 'Ovulation Phase', color: 'text-amber-400', desc: 'Peak energy and confidence. You are magnetic.' };
  return { label: 'Luteal Phase', color: 'text-secondary', desc: 'Turn inward. Slow down and reflect.' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HomeTab({ userData, cycleDay, nextPeriod, cycleProgress }: any) {
  const phase = getCyclePhaseInfo(cycleDay);
  return (
    <div className="space-y-5 pb-24">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-medium">
          Welcome back, {userData.name || 'Starlighter'} ✨
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Cycle ring card */}
      <Card className="p-6 border-border bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
              <circle
                cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - cycleProgress / 100)}`}
                strokeLinecap="round"
                className="text-primary transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold leading-none">{cycleDay}</span>
              <span className="text-xs text-muted-foreground">day</span>
            </div>
          </div>
          <div className="flex-1">
            <span className={`text-sm font-semibold ${phase.color}`}>{phase.label}</span>
            <p className="text-sm text-muted-foreground mt-1">{phase.desc}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Next period in <span className="text-foreground font-medium">{differenceInDays(nextPeriod, new Date())} days</span> · {format(nextPeriod, 'MMM d')}
            </p>
          </div>
        </div>
        <Progress value={cycleProgress} className="h-1.5 mt-4" />
      </Card>

      {/* 3 quick stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 border-border bg-gradient-to-br from-primary/5 to-transparent text-center">
          <Moon className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Moon</p>
          <p className="text-sm font-medium mt-0.5">Waxing</p>
          <p className="text-xs text-muted-foreground">Gibbous</p>
        </Card>
        <Card className="p-4 border-border bg-gradient-to-br from-secondary/5 to-transparent text-center">
          <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Transit</p>
          <p className="text-sm font-medium mt-0.5">Venus</p>
          <p className="text-xs text-muted-foreground">6th house</p>
        </Card>
        <Card className="p-4 border-border bg-gradient-to-br from-accent/5 to-transparent text-center">
          <Star className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Sun Sign</p>
          <p className="text-sm font-medium mt-0.5">
            {userData.dateOfBirth ? getZodiacSign(userData.dateOfBirth).split(' ')[1] : '—'}
          </p>
        </Card>
      </div>

      {/* Today's insight preview */}
      <Card className="p-5 border-border bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm">Today's Cosmic Insight</p>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Venus square Moon</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Venus is transiting your 6th house while squaring your natal Moon. Emotional sensitivity is heightened — honour it rather than push through.
            </p>
            <button className="flex items-center gap-1 text-xs text-primary mt-2 font-medium">
              Read full message <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </Card>

      {/* Wellness snapshot */}
      <Card className="p-5 border-border">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">Today's Wellness</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Mood', value: userData.hormonalTracking?.mood || 'Not logged' },
            { label: 'Stress', value: userData.hormonalTracking?.stressLevel ? `${userData.hormonalTracking.stressLevel}/10` : 'Not logged' },
            { label: 'Sleep', value: userData.hormonalTracking?.sleepQuality ? `${userData.hormonalTracking.sleepQuality}/10` : 'Not logged' },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm capitalize">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
function CycleTab({ cycleDay, nextPeriod, cycleProgress }: any) {
  const phase = getCyclePhaseInfo(cycleDay);
  const phases = [
    { name: 'Menstrual', days: '1–5', color: 'bg-rose-400', desc: 'Bleeding, rest, release' },
    { name: 'Follicular', days: '6–13', color: 'bg-primary', desc: 'Energy builds, clarity rises' },
    { name: 'Ovulation', days: '14–16', color: 'bg-amber-400', desc: 'Peak power, high social energy' },
    { name: 'Luteal', days: '17–28', color: 'bg-secondary', desc: 'Inward focus, PMS window' },
  ];

  return (
    <div className="space-y-5 pb-24">
      <h2 className="text-2xl font-medium">Your Cycle</h2>

      {/* Visual cycle wheel */}
      <Card className="p-6 border-border">
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Phase arcs */}
              {[
                { color: '#fb7185', start: 0,   end: 64  },
                { color: '#c084fc', start: 64,  end: 170 },
                { color: '#fbbf24', start: 170, end: 206 },
                { color: '#fbbfd4', start: 206, end: 360 },
              ].map((arc, i) => {
                const r = 80;
                const cx = 100; const cy = 100;
                const startRad = (arc.start - 90) * Math.PI / 180;
                const endRad = (arc.end - 90) * Math.PI / 180;
                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);
                const large = arc.end - arc.start > 180 ? 1 : 0;
                return (
                  <path
                    key={i}
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
                    fill={arc.color}
                    opacity="0.25"
                  />
                );
              })}
              {/* Center circle */}
              <circle cx="100" cy="100" r="55" fill="white" />
              <text x="100" y="94" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#2d1b3d">
                {cycleDay}
              </text>
              <text x="100" y="112" textAnchor="middle" fontSize="11" fill="#8b5a9f">
                day of cycle
              </text>
              <text x="100" y="127" textAnchor="middle" fontSize="10" fill="#c084fc" fontWeight="500">
                {phase.label.split(' ')[0]}
              </text>
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          {phases.map((p) => (
            <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl bg-accent/10">
              <div className={`w-3 h-3 rounded-full ${p.color} flex-shrink-0`} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">Days {p.days}</span>
                </div>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Next period countdown */}
      <Card className="p-5 border-border bg-gradient-to-br from-rose-50 to-transparent">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Next Period</h3>
        </div>
        <p className="text-3xl font-bold text-primary">
          {differenceInDays(nextPeriod, new Date())} <span className="text-base font-normal text-muted-foreground">days away</span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">Predicted: {format(nextPeriod, 'EEEE, MMMM d')}</p>
        <Progress value={cycleProgress} className="h-2 mt-4" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Day {cycleDay}</span>
          <span>Day 28</span>
        </div>
      </Card>

      {/* Symptoms log placeholder */}
      <Card className="p-5 border-border">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">Log Today's Symptoms</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Spotting', 'Mood swings', 'Tender breasts', 'Cravings'].map((s) => (
            <button
              key={s}
              className="px-3 py-1.5 text-xs rounded-full border border-border hover:bg-primary/10 hover:border-primary transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ChartTab({ userData }: any) {
  const planets = [
    { name: 'Sun', symbol: '☀️', value: userData.dateOfBirth ? getZodiacSign(userData.dateOfBirth) : 'Unknown', desc: 'Core identity and life force' },
    { name: 'Moon', symbol: '🌙', value: 'Calculating...', desc: 'Emotions and instincts' },
    { name: 'Rising', symbol: '⬆️', value: userData.timeOfBirth !== 'unknown' ? 'Calculating...' : 'Birth time needed', desc: 'How others see you' },
    { name: 'Venus', symbol: '♀️', value: 'Calculating...', desc: 'Love and attraction' },
    { name: 'Mars', symbol: '♂️', value: 'Calculating...', desc: 'Drive and desire' },
    { name: 'Mercury', symbol: '☿', value: 'Calculating...', desc: 'Communication and mind' },
  ];

  return (
    <div className="space-y-5 pb-24">
      <h2 className="text-2xl font-medium">Your Birth Chart</h2>

      {/* Chart wheel placeholder */}
      <Card className="p-6 border-border flex flex-col items-center">
        <div className="relative w-44 h-44 mb-4">
          <svg viewBox="0 0 180 180" className="w-full h-full">
            <circle cx="90" cy="90" r="85" fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.3" />
            <circle cx="90" cy="90" r="65" fill="none" stroke="#fbbfd4" strokeWidth="1" opacity="0.3" />
            <circle cx="90" cy="90" r="45" fill="none" stroke="#e9d5f5" strokeWidth="1" opacity="0.3" />
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
              const rad = (deg - 90) * Math.PI / 180;
              return (
                <line
                  key={i}
                  x1={90 + 45 * Math.cos(rad)} y1={90 + 45 * Math.sin(rad)}
                  x2={90 + 85 * Math.cos(rad)} y2={90 + 85 * Math.sin(rad)}
                  stroke="#c084fc" strokeWidth="0.5" opacity="0.4"
                />
              );
            })}
            <circle cx="90" cy="90" r="30" fill="#fdf5f8" />
            <text x="90" y="86" textAnchor="middle" fontSize="18">✦</text>
            <text x="90" y="103" textAnchor="middle" fontSize="9" fill="#8b5a9f">Birth Chart</text>
          </svg>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Full interactive chart unlocks after astrology engine is connected
        </p>
      </Card>

      {/* Planet list */}
      <div className="space-y-3">
        {planets.map((p) => (
          <Card key={p.name} className="p-4 border-border">
            <div className="flex items-center gap-4">
              <span className="text-2xl w-10 text-center">{p.symbol}</span>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  <span className="text-sm text-primary font-medium">{p.value}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TransitsTab() {
  const transits = [
    {
      planet: 'Venus', symbol: '♀️', aspect: 'square Moon',
      house: '6th house', intensity: 4, date: 'Active now',
      effect: 'Emotional sensitivity and hormonal fluctuation. Honour your body\'s signals.',
      color: 'border-l-primary',
    },
    {
      planet: 'Mars', symbol: '♂️', aspect: 'square Moon',
      house: '8th house', intensity: 3, date: 'March 14',
      effect: 'Possible stress response affecting your cycle. Avoid overexertion.',
      color: 'border-l-rose-400',
    },
    {
      planet: 'Full Moon', symbol: '🌕', aspect: 'in Virgo',
      house: '', intensity: 5, date: 'March 18',
      effect: 'Ovulation window. Peak fertility energy. High emotional clarity.',
      color: 'border-l-amber-400',
    },
    {
      planet: 'Mercury', symbol: '☿', aspect: 'trine Sun',
      house: '3rd house', intensity: 2, date: 'March 20',
      effect: 'Clear thinking and communication. Good time for health appointments.',
      color: 'border-l-secondary',
    },
  ];

  return (
    <div className="space-y-5 pb-24">
      <h2 className="text-2xl font-medium">Upcoming Transits</h2>
      <p className="text-sm text-muted-foreground -mt-3">How the planets affect your cycle this month</p>

      <div className="space-y-4">
        {transits.map((t, i) => (
          <Card key={i} className={`p-5 border-border border-l-4 ${t.color}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{t.symbol}</span>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="font-medium text-sm">{t.planet} {t.aspect}</p>
                    {t.house && <p className="text-xs text-muted-foreground">{t.house}</p>}
                  </div>
                  <span className="text-xs bg-accent/40 px-2 py-0.5 rounded-full">{t.date}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t.effect}</p>
                <div className="flex gap-1 mt-3">
                  {[...Array(5)].map((_, j) => (
                    <div
                      key={j}
                      className={`h-1.5 flex-1 rounded-full ${j < t.intensity ? 'bg-primary' : 'bg-border'}`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">intensity</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MessagesTab() {
  const [openId, setOpenId] = useState<number | null>(null);
  const unreadCount = MESSAGES.filter(m => m.unread).length;

  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">Messages</h2>
        {unreadCount > 0 && (
          <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground -mt-3">
        Personal insights delivered to you — also sent to your email so you never miss one.
      </p>

      <div className="space-y-3">
        {MESSAGES.map((msg) => (
          <Card
            key={msg.id}
            className={`border-border transition-all cursor-pointer ${openId === msg.id ? 'p-5' : 'p-4'}`}
            onClick={() => setOpenId(openId === msg.id ? null : msg.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${msg.unread ? 'bg-primary' : 'bg-transparent border border-border'}`} />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${msg.tagColor} mr-2`}>{msg.tag}</span>
                    <span className="text-xs text-muted-foreground">{msg.date}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${openId === msg.id ? 'rotate-90' : ''}`} />
                </div>
                <p className="font-medium text-sm mt-1">{msg.title}</p>

                {openId !== msg.id && (
                  <p className="text-xs text-muted-foreground mt-0.5">{msg.preview}</p>
                )}

                {openId === msg.id && (
                  <div className="mt-3 space-y-2">
                    {msg.full.split('\n').map((line, i) => (
                      <p key={i} className={`text-sm ${line.startsWith('•') ? 'pl-2 text-muted-foreground' : line === '' ? 'hidden' : 'text-foreground leading-relaxed'}`}>
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 border-border bg-accent/10">
        <div className="flex items-start gap-3">
          <Bell className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            All messages are also sent to your email, so you receive them even on older iOS devices that don't support push notifications.
          </p>
        </div>
      </Card>
    </div>
  );
}

function ProfileTab({ userData }: any) {
  return (
    <div className="space-y-5 pb-24">
      <h2 className="text-2xl font-medium">Your Profile</h2>

      {/* Avatar */}
      <Card className="p-6 border-border flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
          {userData.name ? userData.name[0].toUpperCase() : '✦'}
        </div>
        <div className="text-center">
          <p className="font-medium text-lg">{userData.name || 'Starlighter'}</p>
          <p className="text-sm text-muted-foreground">
            {userData.dateOfBirth ? getZodiacSign(userData.dateOfBirth) : ''} · {userData.currentCity || ''}
          </p>
        </div>
      </Card>

      {/* Details */}
      <Card className="p-5 border-border space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Birth Info</h3>
        {[
          { label: 'Date of Birth', value: userData.dateOfBirth ? format(new Date(userData.dateOfBirth), 'MMMM d, yyyy') : 'Not set' },
          { label: 'Birth Time', value: userData.timeOfBirth || 'Not set' },
          { label: 'Birth Place', value: userData.placeOfBirth || 'Not set' },
          { label: 'Current City', value: userData.currentCity || 'Not set' },
        ].map((item) => (
          <div key={item.label} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm text-right max-w-[55%]">{item.value}</span>
          </div>
        ))}
      </Card>

      <Card className="p-5 border-border space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Cycle Info</h3>
        {[
          { label: 'Avg Cycle Length', value: '28 days' },
          { label: 'Last Period Start', value: userData.lastPeriodStart ? format(new Date(userData.lastPeriodStart), 'MMM d, yyyy') : 'Not set' },
          { label: 'Last Period End', value: userData.lastPeriodEnd ? format(new Date(userData.lastPeriodEnd), 'MMM d, yyyy') : 'Not set' },
          { label: 'Tracks Periods', value: userData.tracksPeriods ? 'Yes' : 'No' },
        ].map((item) => (
          <div key={item.label} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm">{item.value}</span>
          </div>
        ))}
      </Card>

      <Card className="p-5 border-border space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Subscription</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Status</span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${userData.hasPaid ? 'bg-primary/20 text-primary' : 'bg-border text-muted-foreground'}`}>
            {userData.hasPaid ? '✦ Premium' : 'Free'}
          </span>
        </div>
        {!userData.hasPaid && (
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium mt-2">
            Upgrade to Premium
          </button>
        )}
      </Card>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export function Dashboard() {
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const cycleDay = userData.lastPeriodStart
    ? Math.max(1, differenceInDays(new Date(), new Date(userData.lastPeriodStart)) % 28 + 1)
    : 14;

  const nextPeriod = userData.lastPeriodStart
    ? addDays(new Date(userData.lastPeriodStart), 28)
    : addDays(new Date(), 14);

  const cycleProgress = (cycleDay / 28) * 100;

  const navItems = [
    { id: 'home',     label: 'Home',    icon: Home },
    { id: 'cycle',    label: 'Cycle',   icon: Droplet },
    { id: 'chart',    label: 'Chart',   icon: Star },
    { id: 'transits', label: 'Transits',icon: TrendingUp },
    { id: 'messages', label: 'Messages',icon: MessageCircle },
    { id: 'profile',  label: 'Profile', icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top header */}
      <header className="border-b border-border bg-card px-5 py-3 flex items-center justify-between sticky top-0 z-10">
        <ZodiacCycleLogo />
        <button className="relative p-2">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto px-5 pt-5">
        {activeTab === 'home'     && <HomeTab userData={userData} cycleDay={cycleDay} nextPeriod={nextPeriod} cycleProgress={cycleProgress} />}
        {activeTab === 'cycle'    && <CycleTab cycleDay={cycleDay} nextPeriod={nextPeriod} cycleProgress={cycleProgress} />}
        {activeTab === 'chart'    && <ChartTab userData={userData} />}
        {activeTab === 'transits' && <TransitsTab />}
        {activeTab === 'messages' && <MessagesTab />}
        {activeTab === 'profile'  && <ProfileTab userData={userData} />}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 z-10">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            const showBadge = id === 'messages' && MESSAGES.filter(m => m.unread).length > 0;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-all ${isActive ? 'scale-110' : ''}`} />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
                <span className={`text-xs transition-all ${isActive ? 'font-semibold' : 'font-normal'}`}>
                  {label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}