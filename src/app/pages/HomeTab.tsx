import { useUserData } from '../context/UserDataContext';
import { Moon, Star, Sparkles, Heart, ChevronRight } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getCachedPredictions } from '../../lib/predictions';
import { AdBanner } from '../components/AdBanner';

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

interface HomeTabProps {
  onNavigateToMessages: () => void;
}

export function HomeTab({ onNavigateToMessages }: HomeTabProps) {
  const { userData } = useUserData();
  const { t } = useTranslation();

  const cycleDay = userData.lastPeriodStart
    ? Math.max(1, differenceInDays(new Date(), new Date(userData.lastPeriodStart)) % 28 + 1)
    : 14;
  const nextPeriod = userData.lastPeriodStart
    ? addDays(new Date(userData.lastPeriodStart), 28)
    : addDays(new Date(), 14);
  const cycleProgress = (cycleDay / 28) * 100;

  const phaseKey = cycleDay <= 5 ? 'menstrual' : cycleDay <= 13 ? 'follicular' : cycleDay <= 16 ? 'ovulation' : 'luteal';
  const phaseColors: Record<string, string> = {
    menstrual: 'text-rose-400', follicular: 'text-primary',
    ovulation: 'text-amber-400', luteal: 'text-secondary',
  };
  const phaseGradients: Record<string, string> = {
    menstrual: 'from-rose-400/20 via-pink-300/10 to-transparent',
    follicular: 'from-primary/20 via-purple-300/10 to-transparent',
    ovulation: 'from-amber-400/20 via-yellow-300/10 to-transparent',
    luteal: 'from-secondary/20 via-pink-200/10 to-transparent',
  };

  const cachedPredictions = getCachedPredictions();
  const todayInsight = cachedPredictions?.[0] || null;
  const isPremium = userData.hasPaid;

  return (
    <div className="space-y-4 pb-24">

      {/* Greeting */}
      <div className="pt-1">
        <h1 className="text-3xl font-medium">
          {t('home.greeting', { name: userData.name || 'Starlighter' })}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Cycle ring card */}
      <div className={`glass glossy-hover rounded-3xl p-6 bg-gradient-to-br ${phaseGradients[phaseKey]} border border-white/40`}>
        <div className="flex items-center gap-5">
          <div className="relative w-22 h-22 flex-shrink-0">
            <svg viewBox="0 0 88 88" className="w-22 h-22 -rotate-90" style={{ width: 88, height: 88 }}>
              <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(192,132,252,0.15)" strokeWidth="7" />
              <circle cx="44" cy="44" r="38" fill="none"
                stroke="url(#cycleGrad)" strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - cycleProgress / 100)}`}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(192,132,252,0.5))' }}
              />
              <defs>
                <linearGradient id="cycleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#fbbfd4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold leading-none text-gradient">{cycleDay}</span>
              <span className="text-[10px] text-muted-foreground">{t('cycle.day')}</span>
            </div>
          </div>
          <div className="flex-1">
            <span className={`text-sm font-semibold ${phaseColors[phaseKey]}`}>
              {t(`cycle.phases.${phaseKey}` as any)}
            </span>
            <p className="text-sm text-muted-foreground mt-1">
              {t(`cycle.phaseDesc.${phaseKey}` as any)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {t('home.nextPeriod', {
                days: differenceInDays(nextPeriod, new Date()),
                date: format(nextPeriod, 'MMM d'),
              })}
            </p>
          </div>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${cycleProgress}%`,
              background: 'linear-gradient(90deg, #c084fc, #fbbfd4)',
              boxShadow: '0 0 8px rgba(192,132,252,0.5)',
            }}
          />
        </div>
      </div>

      {/* 3 stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Moon className="w-5 h-5 text-primary" />, label: t('home.moon'), value: '🌔' },
          { icon: <Sparkles className="w-5 h-5 text-primary" />, label: t('home.transit'), value: todayInsight ? '✦' : '—' },
          {
            icon: <Star className="w-5 h-5 text-primary" />,
            label: t('home.sunSign'),
            value: userData.sun_sign || (userData.dateOfBirth ? getZodiacSign(new Date(userData.dateOfBirth)).split(' ')[1] : '—'),
          },
        ].map((item, i) => (
          <div key={i} className="glass glossy rounded-2xl p-4 text-center border border-white/40 card-float">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center mx-auto mb-2">
              {item.icon}
            </div>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm font-semibold mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Today's cosmic insight */}
      <div
        className="glass glossy-hover rounded-3xl p-5 border border-white/40 cursor-pointer card-float"
        onClick={onNavigateToMessages}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center flex-shrink-0 float-sparkle">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="font-semibold text-sm">{t('home.todayInsight')}</p>
              {todayInsight && (
                <span className={`text-xs px-2 py-0.5 rounded-full glass-pill ${todayInsight.tagColor}`}>
                  {todayInsight.tag}
                </span>
              )}
            </div>
            {todayInsight ? (
              <>
                <p className="text-sm font-medium mb-1">{todayInsight.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {todayInsight.preview}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t('messages.generate')} →</p>
            )}
            <button className="flex items-center gap-1 text-xs text-primary mt-2 font-semibold">
              {t('home.readMore')} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Wellness snapshot */}
      <div className="glass rounded-3xl p-5 border border-white/40">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-400/20 to-pink-300/10 flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold">{t('home.todayWellness')}</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: t('home.mood'),   value: userData.hormonalTracking?.mood || t('home.notLogged') },
            { label: t('home.stress'), value: userData.hormonalTracking?.stressLevel ? `${userData.hormonalTracking.stressLevel}/10` : t('home.notLogged') },
            { label: t('home.sleep'),  value: userData.hormonalTracking?.sleepQuality ? `${userData.hormonalTracking.sleepQuality}/10` : t('home.notLogged') },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium capitalize">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ad banner — only for free users */}
      {!isPremium && (
        <AdBanner slot={import.meta.env.VITE_AD_SLOT_CYCLE} format="horizontal" />
      )}

    </div>
  );
} 