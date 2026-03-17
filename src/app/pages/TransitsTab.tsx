import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useUserData } from '../context/UserDataContext';
import { Card } from '../components/ui/card';
import { RefreshCw, Sparkles, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import i18n from '../../lib/i18n';
import { cacheTransitSummary } from '../../lib/notifications';
import { AdBanner } from '../components/AdBanner';

const WORKER_URL = import.meta.env.VITE_WORKER_URL;

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

const SIGN_TRANSLATIONS: Record<string, Record<string, string>> = {
  French: { Aries: 'Bélier', Taurus: 'Taureau', Gemini: 'Gémeaux', Cancer: 'Cancer', Leo: 'Lion', Virgo: 'Vierge', Libra: 'Balance', Scorpio: 'Scorpion', Sagittarius: 'Sagittaire', Capricorn: 'Capricorne', Aquarius: 'Verseau', Pisces: 'Poissons' },
  German: { Aries: 'Widder', Taurus: 'Stier', Gemini: 'Zwillinge', Cancer: 'Krebs', Leo: 'Löwe', Virgo: 'Jungfrau', Libra: 'Waage', Scorpio: 'Skorpion', Sagittarius: 'Schütze', Capricorn: 'Steinbock', Aquarius: 'Wassermann', Pisces: 'Fische' },
  Spanish: { Aries: 'Aries', Taurus: 'Tauro', Gemini: 'Géminis', Cancer: 'Cáncer', Leo: 'Leo', Virgo: 'Virgo', Libra: 'Libra', Scorpio: 'Escorpio', Sagittarius: 'Sagitario', Capricorn: 'Capricornio', Aquarius: 'Acuario', Pisces: 'Piscis' },
  Portuguese: { Aries: 'Áries', Taurus: 'Touro', Gemini: 'Gêmeos', Cancer: 'Câncer', Leo: 'Leão', Virgo: 'Virgem', Libra: 'Libra', Scorpio: 'Escorpião', Sagittarius: 'Sagitário', Capricorn: 'Capricórnio', Aquarius: 'Aquário', Pisces: 'Peixes' },
};

function translateSign(sign: string, language: string): string {
  return SIGN_TRANSLATIONS[language]?.[sign] || sign;
}

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
  const url = `${WORKER_URL}/chart?datetime=${encodeURIComponent(new Date().toISOString())}&coordinates=0,0`;
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
  // Always use English names in the astrological query for accuracy
  const ENGLISH_PLANETS: Record<string, string> = {
    sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus',
    mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn',
  };
  const tPlanet = ENGLISH_PLANETS[transitPlanet] || transitPlanet;
  const nPlanet = ENGLISH_PLANETS[natalPlanet] || natalPlanet;

  try {
    const response = await fetch(`${WORKER_URL}/ai/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: `You are ZodiacCycle's personal astrologer. Write warm, specific, personal transit interpretations that connect planetary transits to the user's menstrual cycle and daily life. Be like a knowledgeable friend — practical, insightful, never generic. Maximum 2 sentences. Never say "this transit is active in your chart". CRITICAL: Write your ENTIRE response in ${language}. Every word must be in ${language}.`,
        messages: [{
          role: 'user',
          content: `${tPlanet} in ${transitSign} is forming a ${aspect} with this person's natal ${nPlanet} in ${natalSign}. They have Sun in ${sunSign} and Moon in ${moonSign}, currently in their ${cyclePhase} phase. What specific effect does this transit have on their body, mood, and energy this week? Be warm and personal. 2 sentences max. Respond in ${language}.`,
        }],
      }),
    });
    if (!response.ok) {
      console.error('Transit AI HTTP error:', response.status, await response.text());
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() || '';
    if (!text || text.length < 10) throw new Error('Empty or too short response');
    return text;
  } catch (err) {
    console.error('Transit AI error:', err);
    // Meaningful fallback that at least describes the transit
    const aspectMeanings: Record<string, string> = {
      conjunction: 'merges powerfully with',
      trine: 'flows harmoniously with',
      square: 'creates dynamic tension with',
      opposition: 'brings awareness to',
      sextile: 'opens opportunities through',
    };
    const meaning = aspectMeanings[aspect] || 'aspects';
    return `${tPlanet} in ${transitSign} ${meaning} your natal ${nPlanet} in ${natalSign} this week. Open the app to refresh for your personalised interpretation.`;
  }
} 

interface Transit {
  id: string; transitPlanet: string; natalPlanet: string; aspect: string; aspectSymbol: string;
  transitSign: string; natalSign: string; intensity: number; color: string; interpretation: string;
}

const FREE_TRANSIT_LIMIT = 3;

export function TransitsTab() {
  const { userData } = useUserData();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [transits, setTransits] = useState<Transit[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const isPremium = userData.hasPaid;

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
        sun:     { sign: userData.sun_sign     || '', degree: 15 },
        moon:    { sign: userData.moon_sign    || '', degree: 15 },
        mercury: { sign: userData.mercury_sign || '', degree: 15 },
        venus:   { sign: userData.venus_sign   || '', degree: 15 },
        mars:    { sign: userData.mars_sign    || '', degree: 15 },
      };

      const foundTransits: Omit<Transit, 'interpretation'>[] = [];
      for (const tp of ['sun','moon','mercury','venus','mars','jupiter','saturn']) {
        if (!current[tp]) continue;
        const tLon = getSignDegree(current[tp].sign, current[tp].degree);
        for (const np of ['sun','moon','venus','mars','mercury']) {
          if (!natal[np]?.sign) continue;
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

      const allTransits = foundTransits.sort((a, b) => b.intensity - a.intensity);
      const top = isPremium ? allTransits.slice(0, 5) : allTransits.slice(0, FREE_TRANSIT_LIMIT);
      const total = allTransits.slice(0, 5);

      if (total.length > 0) {
        const topAspect = `${planetNames[total[0].transitPlanet]} ${t(`transits.aspects.${total[0].aspect}` as any)} ${planetNames[total[0].natalPlanet]}`;
        cacheTransitSummary(total.length, topAspect);
      } else {
        cacheTransitSummary(0);
      }

      if (top.length === 0) {
        setTransits([]);
        setLoading(false);
        setLastUpdated(format(new Date(), 'h:mm a'));
        return;
      }

      setTransits(top.map(tr => ({ ...tr, interpretation: '...' })));
      setLoading(false);
      setLoadingAI(true);

      // Load AI interpretations one by one and update state as each arrives
      const results: Transit[] = top.map(tr => ({ ...tr, interpretation: '...' }));
      await Promise.all(top.map(async (tr, idx) => {
        const interp = await getTransitInterpretation(
          tr.transitPlanet, tr.natalPlanet, tr.aspect,
          tr.transitSign, tr.natalSign, cyclePhase,
          userData.sun_sign || '', userData.moon_sign || '',
          planetNames, language,
        );
        results[idx] = { ...tr, interpretation: interp };
        setTransits([...results]);
      }));

      setLastUpdated(format(new Date(), 'h:mm a'));
    } catch (err) {
      console.error('Transit load error:', err);
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
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-sm font-medium">{t('transits.scanning')}</p>
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
          <button onClick={loadTransits} className="text-xs text-rose-500 underline mt-2">
            {t('common.retry')}
          </button>
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
                        natal {planetNames[tr.transitPlanet]} in {translateSign(tr.transitSign, language)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {t(`transits.aspects.${tr.aspect}` as any)} · natal {translateSign(tr.natalSign, language)}
                      </p>
                    </div>
                    <span className="text-xs bg-accent/40 px-2 py-0.5 rounded-full">
                      {t('transits.activeNow')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {tr.interpretation === '...' ? (
                      <span className="flex items-center gap-1">
                        {[0,1,2].map(i => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block"
                            style={{ animationDelay: `${i*0.2}s` }}/>
                        ))}
                      </span>
                    ) : tr.interpretation}
                  </p>
                  <div className="flex gap-1 mt-3 items-center">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className={`h-1.5 flex-1 rounded-full ${j < tr.intensity ? 'bg-primary' : 'bg-border'}`}/>
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">{t('transits.intensity')}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Free user upgrade prompt */}
          {!isPremium && (
            <div className="rounded-3xl border border-primary/20 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(192,132,252,0.08), rgba(244,114,182,0.05))' }}>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {Math.max(0, 5 - FREE_TRANSIT_LIMIT)} {t('premium.moreTransits')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('premium.transitLockedSub')}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {(['feature6','feature3','feature2','feature5'] as const).map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{t(`premium.${f}`)}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/onboarding/paywall')}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold"
                  style={{ boxShadow: '0 4px 16px rgba(192,132,252,0.3)' }}
                >
                  {t('premium.unlockTransits')}
                </button>
              </div>
            </div>
          )}
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

      <AdBanner
        slot={import.meta.env.VITE_AD_SLOT_TRANSITS}
        format="horizontal"
        className="mt-2 mb-4"
      />
    </div>
  );
} 