import { format } from 'date-fns';
import i18n from './i18n';

const WORKER_URL = import.meta.env.VITE_WORKER_URL;

export interface Prediction {
  id: string;
  date: string;
  title: string;
  preview: string;
  full: string;
  tag: string;
  tagColor: string;
  unread: boolean;
  type: 'cosmic' | 'cycle' | 'wellness';
}

interface UserChartData {
  name?: string;
  sun_sign?: string;
  moon_sign?: string;
  rising_sign?: string;
  venus_sign?: string;
  mars_sign?: string;
  mercury_sign?: string;
  houses?: Record<string, number>;
  lastPeriodStart?: Date;
  cycleDay?: number;
  cyclePhase?: string;
  cycleLength?: number;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', de: 'German', fr: 'French', es: 'Spanish', pt: 'Portuguese',
  it: 'Italian', nl: 'Dutch', pl: 'Polish', ru: 'Russian', tr: 'Turkish',
  ar: 'Arabic', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', hi: 'Hindi',
  sv: 'Swedish', da: 'Danish', fi: 'Finnish', nb: 'Norwegian', uk: 'Ukrainian',
  id: 'Indonesian', ms: 'Malay', th: 'Thai', vi: 'Vietnamese', ro: 'Romanian',
  hu: 'Hungarian', cs: 'Czech', el: 'Greek', he: 'Hebrew', bn: 'Bengali',
  sw: 'Swahili', yo: 'Yoruba', ig: 'Igbo', ha: 'Hausa', am: 'Amharic',
  tl: 'Filipino', ta: 'Tamil', ur: 'Urdu', fa: 'Persian', ka: 'Georgian',
};

function getUserLanguage(): string {
  const code = i18n.language?.split('-')[0] || 'en';
  return LANGUAGE_NAMES[code] || 'English';
}

function getCyclePhase(cycleDay: number, cycleLength: number = 28): string {
  const ovulationDay = cycleLength - 14;
  if (cycleDay <= 5) return 'Menstrual';
  if (cycleDay <= ovulationDay - 5) return 'Follicular';
  if (cycleDay <= ovulationDay + 1) return 'Ovulation';
  return 'Luteal';
}

async function callClaude(system: string, userMessage: string): Promise<string> {
  const response = await fetch(`${WORKER_URL}/ai/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  if (!response.ok) throw new Error('AI request failed');
  const data = await response.json();
  return data.content?.[0]?.text || '';
}

export async function generateDailyPredictions(user: UserChartData): Promise<Prediction[]> {
  const today = format(new Date(), 'MMMM d, yyyy');
  const cycleDay = user.cycleDay || 14;
  const cycleLength = user.cycleLength || 28;
  const phase = user.cyclePhase || getCyclePhase(cycleDay, cycleLength);
  const daysUntilPeriod = cycleLength - cycleDay;
  const language = getUserLanguage();

  const chartContext = `
User's Natal Chart:
- Sun: ${user.sun_sign || 'Unknown'}
- Moon: ${user.moon_sign || 'Unknown'}
- Rising: ${user.rising_sign || 'Unknown'}
- Venus: ${user.venus_sign || 'Unknown'}
- Mars: ${user.mars_sign || 'Unknown'}
- Mercury: ${user.mercury_sign || 'Unknown'}

Cycle Data:
- Today: ${today}
- Cycle Day: ${cycleDay} of ${cycleLength}
- Current Phase: ${phase} Phase
- Days until next period: ${daysUntilPeriod}
`.trim();

  const system = `You are ZodiacCycle's AI astrologer — a warm, insightful guide who combines Western tropical astrology with menstrual cycle wisdom.
You give deeply personal, actionable insights that feel like they come from a knowledgeable friend, not a generic horoscope.
Keep responses concise (2-4 sentences), warm, specific to the user's chart and cycle phase, and avoid generic advice.
Never mention that you're an AI. Write as if you truly know this person's cosmic blueprint.
CRITICAL: You must write your ENTIRE response in ${language}. Every single word must be in ${language}. Do not mix languages.`;

  const predictions: Prediction[] = [];

  // ── Localised labels ────────────────────────────────────────────────────────
  const labels: Record<string, Record<string, string>> = {
    cosmicTitle:  { English: "Today's Cosmic Energy", German: 'Heutige kosmische Energie', French: 'Énergie cosmique du jour', Spanish: 'Energía cósmica de hoy', Portuguese: 'Energia cósmica de hoje' },
    cosmicTag:    { English: 'Daily Insight', German: 'Tageseinblick', French: 'Insight du jour', Spanish: 'Insight diario', Portuguese: 'Insight diário' },
    cycleTag:     { English: 'Cycle Insight', German: 'Zykluseinblick', French: 'Insight cycle', Spanish: 'Insight del ciclo', Portuguese: 'Insight do ciclo' },
    wellnessTitle:{ English: 'Wellness & Body Ritual', German: 'Wellness & Körperritual', French: 'Bien-être & Rituel corporel', Spanish: 'Bienestar & Ritual corporal', Portuguese: 'Bem-estar & Ritual corporal' },
    wellnessTag:  { English: 'Wellness', German: 'Wellness', French: 'Bien-être', Spanish: 'Bienestar', Portuguese: 'Bem-estar' },
  };

  const phaseTitles: Record<string, Record<string, string>> = {
    English:    { Menstrual: 'Your Menstrual Phase Energy', Follicular: 'Rising Energy — Follicular Phase', Ovulation: 'Peak Power — Ovulation Window', Luteal: 'Turning Inward — Luteal Phase' },
    German:     { Menstrual: 'Energie der Menstruationsphase', Follicular: 'Steigende Energie — Follikelphase', Ovulation: 'Höchstleistung — Ovulationsfenster', Luteal: 'Nach innen — Lutealphase' },
    French:     { Menstrual: 'Énergie phase menstruelle', Follicular: 'Énergie montante — Phase folliculaire', Ovulation: "Puissance max — Fenêtre d'ovulation", Luteal: 'Vers l\'intérieur — Phase lutéale' },
    Spanish:    { Menstrual: 'Tu energía menstrual', Follicular: 'Energía en aumento — Fase folicular', Ovulation: 'Poder máximo — Ventana de ovulación', Luteal: 'Hacia adentro — Fase lútea' },
    Portuguese: { Menstrual: 'Sua energia menstrual', Follicular: 'Energia crescente — Fase folicular', Ovulation: 'Poder máximo — Janela de ovulação', Luteal: 'Para dentro — Fase lútea' },
  };

  const l = (key: string) => labels[key]?.[language] || labels[key]?.['English'] || '';
  const phaseTitle = (phaseTitles[language] || phaseTitles['English'])[phase] || `${phase} Phase`;

  try {
    // 1. Daily Cosmic Insight
    const cosmicText = await callClaude(system, `
${chartContext}
Write a daily cosmic insight for today (${today}).
Reference their specific natal placements and how today's energy interacts with their chart.
Give ONE specific action they can take today.
Format: 2-3 sentences max. No bullet points. Warm and personal tone.
Respond entirely in ${language}.
`);

    predictions.push({
      id: `cosmic-${Date.now()}`,
      date: format(new Date(), 'MMMM d'),
      title: l('cosmicTitle'),
      preview: cosmicText.length > 120 ? cosmicText.slice(0, 120).trim() + '...' : cosmicText, 
      full: cosmicText,
      tag: l('cosmicTag'),
      tagColor: 'bg-primary/20 text-primary',
      unread: true,
      type: 'cosmic',
    });

    // 2. Cycle + Astrology Prediction
    const cycleText = await callClaude(system, `
${chartContext}
Write a cycle-astrology insight for someone in their ${phase} Phase (day ${cycleDay}).
Connect their natal Moon in ${user.moon_sign || 'their sign'} with what they might feel this phase.
Mention specific physical or emotional patterns they might notice.
Give one supportive suggestion aligned with this phase's energy.
Format: 2-3 sentences. Warm, empowering, specific.
Respond entirely in ${language}.
`);

    predictions.push({
      id: `cycle-${Date.now() + 1}`,
      date: format(new Date(), 'MMMM d'),
      title: phaseTitle,
      preview: cosmicText.length > 120 ? cosmicText.slice(0, 120).trim() + '...' : cosmicText,
      full: cycleText,
      tag: l('cycleTag'),
      tagColor: 'bg-rose-100 text-rose-600',
      unread: true,
      type: 'cycle',
    });

    // 3. Wellness Tip
    const wellnessText = await callClaude(system, `
${chartContext}
Write a wellness tip that combines their ${phase} Phase with their natal chart.
Use their Venus in ${user.venus_sign || 'their sign'} and Mars in ${user.mars_sign || 'their sign'} to suggest how to care for their body and energy today.
Be specific and practical — mention a food, activity, or ritual.
Format: 2-3 sentences. Grounding and nurturing tone.
Respond entirely in ${language}.
`);

    predictions.push({
      id: `wellness-${Date.now() + 2}`,
      date: format(new Date(), 'MMMM d'),
      title: l('wellnessTitle'),
      preview: cosmicText.length > 120 ? cosmicText.slice(0, 120).trim() + '...' : cosmicText,
      full: wellnessText,
      tag: l('wellnessTag'),
      tagColor: 'bg-green-100 text-green-700',
      unread: true,
      type: 'wellness',
    });

  } catch (err) {
    console.error('Prediction error:', err);
  }

  return predictions;
}

// Cache per day AND per language — switching language auto-regenerates
export function getCachedPredictions(): Prediction[] | null {
  try {
    const cached = localStorage.getItem('zodiac_predictions');
    if (!cached) return null;
    const { date, predictions, lang } = JSON.parse(cached);
    const today = format(new Date(), 'yyyy-MM-dd');
    const currentLang = i18n.language?.split('-')[0] || 'en';
    if (date !== today || lang !== currentLang) {
      localStorage.removeItem('zodiac_predictions'); // clear stale cache
      return null;
    }
    return predictions;
  } catch {
    return null;
  }
}

export function cachePredictions(predictions: Prediction[]): void {
  localStorage.setItem('zodiac_predictions', JSON.stringify({
    date: format(new Date(), 'yyyy-MM-dd'),
    lang: i18n.language?.split('-')[0] || 'en',
    predictions,
  }));
}