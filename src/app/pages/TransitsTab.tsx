import { useState, useEffect } from 'react';
import { useUserData } from '../context/UserDataContext';
import { Card } from '../components/ui/card';
import { format } from 'date-fns';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../lib/i18n';
import { cacheTransitSummary } from '../../lib/notifications';

const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const SUPABASE_URL = 'https://owmmrkowqkjbrimazftv.supabase.co/functions/v1';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', de: 'German', fr: 'French', es: 'Spanish', pt: 'Portuguese',
  it: 'Italian', nl: 'Dutch', pl: 'Polish', ru: 'Russian', tr: 'Turkish',
  ar: 'Arabic', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', hi: 'Hindi',
  sv: 'Swedish', da: 'Danish', fi: 'Finnish', nb: 'Norwegian', uk: 'Ukrainian',
  id: 'Indonesian', ms: 'Malay', th: 'Thai', vi: 'Vietnamese',
};

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☀️', moon: '🌙', mercury: '☿', venus: '♀️', mars: '♂️', jupiter: '♃', saturn: '♄',
};

const ASPECT_ORBS: Record<string, number> = {
  conjunction: 8, opposition: 8, trine: 6, square: 6, sextile: 4,
};

function getSignDegree(sign: string, degree: number): number {
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  return SIGNS.indexOf(sign) * 30 + degree;
}

function getAspect(lon1: number, lon2: number): { name: string; angle: number; orb: number } | null {
  let diff = Math.abs(lon1 - lon2) % 360;
  if (diff > 180) diff = 360 - diff;
  const aspects = [
    { name: 'conjunction', angle: 0 }, { name: 'sextile', angle: 60 },
    { name: 'square', angle: 90 }, { name: 'trine', angle: 120 }, { name: 'opposition', angle: 180 },
  ];
  for (const asp of aspects) {
    const orb = Math.abs(diff - asp.angle);
    if (orb <= ASPECT_ORBS[asp.name]) return { name: asp.name, angle: asp.angle, orb };
  }
  return null;
}

function getAspectSymbol(a: string): string {
  return ({ conjunction: '☌', sextile: '⚹', square: '□', trine: '△', opposition: '☍' } as Record<string,string>)[a] || '';
}

function getAspectColor(a: string): string {
  return ({
    conjunction: 'border-l-amber-400', trine: 'border-l-green-400',
    sextile: 'border-l-blue-400', square: 'border-l-rose-400', opposition: 'border-l-purple-400',
  } as Record<string,string>)[a] || 'border-l-primary';
}

function getIntensity(aspect: string, orb: number): number {
  return Math.round(5 * (1 - orb / ASPECT_ORBS[aspect]));
}

async function fetchCurrentPlanetPositions() {
  const url = `${SUPABASE_URL}/chart2?datetime=${encodeURIComponent(new Date().toISOString())}&coordinates=0,0`;
  const res = await fetch(url);
  const json = await res.json();
  return json.data as Record<string, { sign: string; degree: number; house: number }>;
}

async function getTransitInterpretation(
  transitPlanet: string, natalPlanet: string, aspect: string,
  transitSign: string, natalSign: string, cyclePhase: string,
  sunSign: string, moonSign: string,
  planetNames: Record<string, string>, language: string,
): Promise<string> {
  const response = await fetch(`${WORKER_URL}/ai/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system: `You are ZodiacCycle's astrologer. Give brief, specific transit interpretations (2 sentences max) connecting planetary transits to menstrual cycle effects. Be warm, practical, specific. No generic horoscope language. CRITICAL: Respond entirely in ${language}.`,
      messages: [{
        role: 'user',
        content: `Transit: ${planetNames[transitPlanet] || transitPlanet} in ${transitSign} ${aspect} natal ${planetNames[natalPlanet] || natalPlanet} in ${natalSign}.\nUser has Sun in ${sunSign}, Moon in ${moonSign}.\nCurrent cycle phase: ${cyclePhase}.\nHow does this transit affect their body, mood, and cycle this week? 2 sentences max. Respond in ${language}.`,
      }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || 'This transit activates your natal energy in meaningful ways.';
}

interface Transit {
  id: string; transitPlanet: string; natalPlanet: string; aspect: string; aspectSymbol: string;
  transitSign: string; natalSign: string; intensity: number; color: string; interpretation: string;
}

export function TransitsTab() {
  const { userData } = useUserData();
  const { t } = useTranslation();
  const [transits, setTransits] = useState<Transit[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const cyclePhase = (() => {
    if (!userData.lastPeriodStart) return 'Luteal';
    const day = Math.max(1, Math.floor((Date.now() - new Date(userData.lastPeriodStart).getTime()) / 86400000) % 28 + 1);
    if (day <= 5) return 'Menstrual';
    if (day <= 13) return 'Follicular';
    if (day <= 16) return 'Ovulation';
    return 'Luteal';
  })();

  const planetNames: Record<string, string> = {
    sun: t('transits.planets.sun'), moon: t('transits.planets.moon'),
    mercury: t('transits.planets.mercury'), venus: t('transits.planets.venus'),
    mars: t('transits.planets.mars'), jupiter: t('transits.planets.jupiter'),
    saturn: t('transits.planets.saturn'),
  };

  const language = LANGUAGE_NAMES[i18n.language?.split('-')[0]] || 'English';

  const loadTransits = async () => {
    if (!userData.sun_sign) { setError(t('transits.noChart')); return; }
    setLoading(true);
    setError(null);
    try {
      const current = await fetchCurrentPlanetPositions();
      const natal: Record<string, { sign: string; degree: number }> = {
        sun: { sign: userData.sun_sign || '', degree: 15 },
        moon: { sign: userData.moon_sign || '', degree: 15 },
        mercury: { sign: userData.mercury_sign || '', degree: 15 },
        venus: { sign: userData.venus_sign || '', degree: 15 },
        mars: { sign: userData.mars_sign || '', degree: 15 },
      };

      const foundTransits: Omit<Transit, 'interpretation'>[] = [];
      for (const tp of ['sun','moon','mercury','venus','mars','jupiter','saturn']) {
        if (!current[tp]) continue;
        const tLon = getSignDegree(current[tp].sign, current[tp].degree);
        for (const np of ['sun','moon','venus','mars','mercury']) {
          if (!natal[np].sign) continue;
          const nLon = getSignDegree(natal[np].sign, natal[np].degree);
          const aspect = getAspect(tLon, nLon);
          if (aspect) foundTransits.push({
            id: `${tp}-${np}-${aspect.name}`,
            transitPlanet: tp, natalPlanet: np, aspect: aspect.name,
            aspectSymbol: getAspectSymbol(aspect.name),
            transitSign: current[tp].sign, natalSign: natal[np].sign,
            intensity: getIntensity(aspect.name, aspect.orb),
            color: getAspectColor(aspect.name),
          });
        }
      }

      const top = foundTransits.sort((a, b) => b.intensity - a.intensity).slice(0, 5);

      // Cache transit summary for notifications
      if (top.length > 0) {
        const topAspect = `${planetNames[top[0].transitPlanet]} ${t(`transits.aspects.${top[0].aspect}` as any)} ${planetNames[top[0].natalPlanet]}`;
        cacheTransitSummary(top.length, topAspect);
      } else {
        cacheTransitSummary(0);
      }

      if (top.length === 0) { setTransits([]); setLoading(false); setLastUpdated(format(new Date(), 'h:mm a')); return; }

      setTransits(top.map(tr => ({ ...tr, interpretation: '...' })));
      setLoading(false);
      setLoadingAI(true);

      const withAI = await Promise.all(top.map(async tr => {
        const interp = await getTransitInterpretation(
          tr.transitPlanet, tr.natalPlanet, tr.aspect,
          tr.transitSign, tr.natalSign, cyclePhase,
          userData.sun_sign || '', userData.moon_sign || '',
          planetNames, language,
        );
        return { ...tr, interpretation: interp };
      }));

      setTransits(withAI);
      setLastUpdated(format(new Date(), 'h:mm a'));
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
      setLoadingAI(false);
    }
  };

  useEffect(() => { loadTransits(); }, []);

  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium">{t('transits.title')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('transits.subtitle')}{lastUpdated && ` · ${t('transits.updated', { time: lastUpdated })}`}
          </p>
        </div>
        <button onClick={loadTransits} disabled={loading || loadingAI} className="p-2 rounded-xl hover:bg-accent/20 transition-colors">
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${(loading || loadingAI) ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <Card className="p-4 border-border bg-gradient-to-r from-primary/10 to-transparent">
        <p className="text-xs text-muted-foreground">
          {t('transits.phase', { phase: cyclePhase })} — {t('transits.phaseSubtitle', { sun: userData.sun_sign, moon: userData.moon_sign })}
        </p>
      </Card>

      {loading && (
        <Card className="p-8 border-border flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><Sparkles className="w-6 h-6 text-primary animate-pulse" /></div>
          <p className="text-sm font-medium">{t('transits.scanning')}</p>
          <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
        </Card>
      )}

      {error && !loading && (
        <Card className="p-5 border-rose-200 bg-rose-50">
          <p className="text-sm text-rose-600">{error}</p>
          <button onClick={loadTransits} className="text-xs text-rose-500 underline mt-2">{t('common.retry')}</button>
        </Card>
      )}

      {!loading && transits.length > 0 && (
        <div className="space-y-4">
          {transits.map(tr => (
            <Card key={tr.id} className={`p-5 border-border border-l-4 ${tr.color}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{PLANET_SYMBOLS[tr.transitPlanet]}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-medium text-sm">
                        {planetNames[tr.transitPlanet]} in {tr.transitSign}
                        {' '}<span className="text-muted-foreground">{tr.aspectSymbol}</span>{' '}
                        natal {planetNames[tr.natalPlanet]}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {t(`transits.aspects.${tr.aspect}` as any)} · natal {tr.natalSign}
                      </p>
                    </div>
                    <span className="text-xs bg-accent/40 px-2 py-0.5 rounded-full">{t('transits.activeNow')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {tr.interpretation === '...' && loadingAI ? (
                      <span className="flex items-center gap-1">
                        {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" style={{ animationDelay: `${i*0.2}s` }} />)}
                      </span>
                    ) : tr.interpretation}
                  </p>
                  <div className="flex gap-1 mt-3 items-center">
                    {[...Array(5)].map((_, j) => <div key={j} className={`h-1.5 flex-1 rounded-full ${j < tr.intensity ? 'bg-primary' : 'bg-border'}`} />)}
                    <span className="text-xs text-muted-foreground ml-2">{t('transits.intensity')}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && transits.length === 0 && (
        <Card className="p-8 border-border text-center">
          <p className="text-2xl mb-3">✨</p>
          <p className="text-sm font-medium">{t('transits.noTransits')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('transits.noTransitsDesc')}</p>
        </Card>
      )}

      <Card className="p-4 border-border">
        <p className="text-xs font-medium mb-2 text-muted-foreground">{t('transits.aspectGuide')}</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { symbol: '☌', key: 'conjunction', color: 'text-amber-500' },
            { symbol: '△', key: 'trine',       color: 'text-green-500' },
            { symbol: '□', key: 'square',      color: 'text-rose-500' },
            { symbol: '☍', key: 'opposition',  color: 'text-purple-500' },
          ].map(a => (
            <div key={a.key} className="flex items-center gap-2">
              <span className={`text-lg ${a.color}`}>{a.symbol}</span>
              <div>
                <p className="text-xs font-medium">{t(`transits.aspects.${a.key}` as any)}</p>
                <p className="text-xs text-muted-foreground">{t(`transits.aspectDesc.${a.key}` as any)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
