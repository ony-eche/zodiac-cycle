import { useState, useEffect } from 'react';
import { X, Share2, Sparkles, RefreshCw } from 'lucide-react';
import { useUserData } from '../context/UserDataContext';

const WORKER_URL = import.meta.env.VITE_WORKER_URL;

const PHASE_CONFIG: Record<string, {
  emoji: string; season: string;
  bg: string; accent: string; star: string;
  energy: string; mood: string; element: string; bestFor: string;
}> = {
  Menstrual:  { emoji: '🔴', season: 'Inner Winter', bg: '#1a0510', accent: '#ff4d8f', star: '#ffb3d1', energy: 'Restorative', mood: 'Reflective',   element: 'Water', bestFor: 'Rest & journaling' },
  Follicular: { emoji: '🌸', season: 'Inner Spring', bg: '#0d0518', accent: '#c084fc', star: '#e8d5ff', energy: 'Rising',      mood: 'Optimistic',   element: 'Air',   bestFor: 'New beginnings' },
  Ovulation:  { emoji: '⭐', season: 'Inner Summer', bg: '#120a00', accent: '#f59e0b', star: '#fde68a', energy: 'Peak',        mood: 'Magnetic',     element: 'Fire',  bestFor: 'Connecting' },
  Luteal:     { emoji: '🌙', season: 'Inner Autumn', bg: '#080518', accent: '#818cf8', star: '#c7d2fe', energy: 'Inward',      mood: 'Intuitive',    element: 'Earth', bestFor: 'Completing' },
};

// 🎭 Personality selector (deterministic)
function getPersonality(userId: string) {
  const types = ['soft', 'bold', 'mysterious'];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return types[Math.abs(hash) % types.length];
}

export function CosmicWrapped({ onClose }: { onClose: () => void }) {
  const { userData } = useUserData();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  const cycleDay = userData.lastPeriodStart
    ? Math.max(1, Math.floor((Date.now() - new Date(userData.lastPeriodStart).getTime()) / 86400000) % 28 + 1)
    : 14;

  const phaseName =
    cycleDay <= 5 ? 'Menstrual'
    : cycleDay <= 13 ? 'Follicular'
    : cycleDay <= 16 ? 'Ovulation'
    : 'Luteal';

  const p = PHASE_CONFIG[phaseName];

  const emotionalPhase =
    phaseName === 'Luteal' || phaseName === 'Menstrual';

 const personality = getPersonality(
  userData.email || userData.name || userData.dateOfBirth || 'user'
);

  useEffect(() => {
    fetchMessage();
  }, []);

  // 🔮 VIRAL AI MESSAGE
  const fetchMessage = async () => {
    setLoading(true);

    const toneMap: any = {
      soft: 'gentle, emotional, validating, comforting',
      bold: 'confident, direct, slightly provocative, powerful',
      mysterious: 'intriguing, slightly cryptic, poetic, magnetic'
    };

    try {
      const res = await fetch(`${WORKER_URL}/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `
You are ZodiacCycle.

Write ONE short, viral, emotionally striking message.

STRICT RULES:
- Max 18 words
- Must feel personal and specific
- No generic astrology phrases
- No "the universe"
- Must feel like a truth someone screenshots
- First 3 words must hook attention

STYLE:
${toneMap[personality]}

Make it feel like:
"This is so me"
          `,
          messages: [
            {
              role: 'user',
              content: `
Sun ${userData.sun_sign}
Moon ${userData.moon_sign}
Rising ${userData.rising_sign || 'unknown'}

Current state:
${phaseName} phase, day ${cycleDay}
Energy: ${p.energy}
Mood: ${p.mood}

Emotional context:
${emotionalPhase ? 'sensitive, reflective, inward' : 'outgoing, expressive, confident'}

Write message.
              `,
            },
          ],
        }),
      });

      const data = await res.json();
      const text = data?.content?.[0]?.text?.trim();

      if (text && text.length > 10) {
        setMessage(text);
      } else {
        throw new Error();
      }

    } catch {
      // 🔥 Viral fallback per personality
      const fallbackMap: any = {
        soft: "You're not too sensitive—you're just finally paying attention to what actually matters.",
        bold: "You’ve outgrown what you’re still tolerating—and you know it.",
        mysterious: "Something feels off because something is shifting—you're closer than you think."
      };

      setMessage(fallbackMap[personality]);
    }

    setLoading(false);
  };

  const handleShare = async () => {
    const text = `✨ My Cosmic Wrapped

${p.emoji} ${phaseName} · Day ${cycleDay}
☀️ ${userData.sun_sign} · 🌙 ${userData.moon_sign}

"${message}"

🌙 zodiaccycle.app`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Cosmic Wrapped ✨',
          text,
          url: 'https://zodiaccycle.app',
        });
      } else {
        await navigator.clipboard.writeText(text);
      }

      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: p.bg }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-2">
        <button onClick={fetchMessage}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: p.star }}/>
        </button>

        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: p.star }}>
          Cosmic Wrapped
        </p>

        <button onClick={onClose}>
          <X className="w-4 h-4" style={{ color: p.star }}/>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5">

        <div className="text-center py-6">
          <div className="text-6xl mb-2">{p.emoji}</div>
          <h1 className="text-2xl font-bold text-white">{p.season}</h1>
          <p className="text-sm" style={{ color: p.accent }}>
            {phaseName} · Day {cycleDay}
          </p>
        </div>

        {/* MESSAGE */}
        <div
          className="rounded-3xl p-6 mb-4 text-center"
          style={{
            background: `linear-gradient(135deg, ${p.accent}20, ${p.accent}05)`,
            border: `1px solid ${p.accent}40`
          }}
        >
          <Sparkles className="mx-auto mb-3" style={{ color: p.accent }}/>

          {loading ? (
            <p className="text-sm text-white opacity-60">Thinking...</p>
          ) : (
            <p className="text-lg font-semibold text-white leading-snug">
              {message}
            </p>
          )}
        </div>

        <p className="text-center text-xs opacity-40 text-white">
          Screenshot this ✦
        </p>
      </div>

      {/* Share */}
      <div className="px-5 pb-8">
        <button
          onClick={handleShare}
          className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${p.accent}, ${p.accent}99)`,
            color: p.bg
          }}
        >
          <Share2 className="w-4 h-4"/>
          {shared ? 'Copied!' : 'Share ✨'}
        </button>
      </div>
    </div>
  );
}