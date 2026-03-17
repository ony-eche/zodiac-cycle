import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUserData } from '../context/UserDataContext';
import { Card } from '../components/ui/card';
import { Bell, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { generateDailyPredictions, getCachedPredictions, cachePredictions, type Prediction } from '../../lib/predictions';
import { useTranslation } from 'react-i18next';

function getCycleDay(lastPeriodStart?: Date, cycleLength: number = 28): number {
  if (!lastPeriodStart) return 14;
  return Math.max(1, differenceInDays(new Date(), new Date(lastPeriodStart)) % cycleLength + 1);
}

function getCyclePhase(cycleDay: number, cycleLength: number = 28): string {
  const ovulationDay = cycleLength - 14;
  if (cycleDay <= 5) return 'Menstrual';
  if (cycleDay <= ovulationDay - 5) return 'Follicular';
  if (cycleDay <= ovulationDay + 1) return 'Ovulation';
  return 'Luteal';
}

export function MessagesTab() {
  const { userData } = useUserData();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cycleDay = getCycleDay(userData.lastPeriodStart);
  const cyclePhase = getCyclePhase(cycleDay);
  const isPremium = userData.hasPaid;

  const loadPredictions = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCachedPredictions();
      if (cached && cached.length > 0) { setMessages(cached); return; }
    }
    setLoading(true);
    setError(null);
    try {
      const predictions = await generateDailyPredictions({
        name: userData.name, sun_sign: userData.sun_sign, moon_sign: userData.moon_sign,
        rising_sign: userData.rising_sign, venus_sign: userData.venus_sign, mars_sign: userData.mars_sign,
        mercury_sign: userData.mercury_sign, houses: userData.houses,
        lastPeriodStart: userData.lastPeriodStart, cycleDay, cyclePhase, cycleLength: 28,
      });
      cachePredictions(predictions);
      setMessages(predictions);
    } catch {
      setError(t('messages.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  loadPredictions();
}, []);

  const unreadCount = messages.filter(m => m.unread).length;

  // ── Premium gate ───────────────────────────────────────────────────────────
  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 px-4 pb-24">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{t('premium.dailyInsightsTitle')}</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
            {t('premium.dailyInsightsSub')}
          </p>
        </div>
        <div className="glass rounded-3xl p-5 border border-white/40 w-full space-y-3">
          {(['feature1','feature2','feature3','feature4','feature5'] as const).map(f => (
            <div key={f} className="flex items-center gap-3">
              <span className="text-sm">{t(`premium.${f}` as any)}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate('/onboarding/paywall')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-base"
          style={{ boxShadow: '0 4px 24px rgba(192,132,252,0.4)' }}
        >
          {t('premium.unlockPremium')}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          {t('premium.trialNote')}
        </p>
      </div>
    );
  }

  // ── Premium content ────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium">{t('messages.title')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('messages.phase', { phase: cyclePhase, day: cycleDay })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
              {t('messages.new', { count: unreadCount })}
            </span>
          )}
          <button
            onClick={() => loadPredictions(true)}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-accent/20 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && (
        <Card className="p-8 border-border flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{t('messages.loading')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('messages.loadingDesc', { phase: cyclePhase })}
            </p>
          </div>
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i*0.15}s` }}/>
            ))}
          </div>
        </Card>
      )}

      {error && !loading && (
        <Card className="p-5 border-rose-200 bg-rose-50">
          <p className="text-sm text-rose-600">{error}</p>
          <button onClick={() => loadPredictions(true)} className="text-xs text-rose-500 underline mt-2">
            {t('messages.tryAgain')}
          </button>
        </Card>
      )}

      {!loading && messages.length > 0 && (
        <div className="space-y-3">
          {messages.map(msg => (
            <Card
              key={msg.id}
              className={`border-border transition-all cursor-pointer ${openId === msg.id ? 'p-5' : 'p-4'}`}
              onClick={() => setOpenId(openId === msg.id ? null : msg.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${msg.unread ? 'bg-primary' : 'bg-transparent border border-border'}`}/>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${msg.tagColor}`}>{msg.tag}</span>
                      <span className="text-xs text-muted-foreground">{msg.date}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${openId === msg.id ? 'rotate-90' : ''}`}/>
                  </div>
                  <p className="font-medium text-sm mt-1">{msg.title}</p>
                  {openId !== msg.id && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{msg.preview}</p>
                  )}
                  {openId === msg.id && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">{msg.full}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && messages.length === 0 && (
        <Card className="p-8 border-border flex flex-col items-center gap-3 text-center">
          <Sparkles className="w-8 h-8 text-primary/40"/>
          <p className="text-sm text-muted-foreground">{t('messages.noMessages')}</p>
          <button
            onClick={() => loadPredictions(true)}
            className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium"
          >
            {t('messages.generate')}
          </button>
        </Card>
      )}

      <Card className="p-4 border-border bg-accent/10">
        <div className="flex items-start gap-3">
          <Bell className="w-4 h-4 text-primary mt-0.5 flex-shrink-0"/>
          <p className="text-xs text-muted-foreground">{t('messages.notice')}</p>
        </div>
      </Card>
    </div>
  );
} 