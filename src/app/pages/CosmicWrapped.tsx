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

export function CosmicWrapped({ onClose }: { onClose: () => void }) {
  const { userData } = useUserData();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  const cycleDay = userData.lastPeriodStart
    ? Math.max(1, Math.floor((Date.now() - new Date(userData.lastPeriodStart).getTime()) / 86400000) % 28 + 1)
    : 14;
  const phaseName = cycleDay <= 5 ? 'Menstrual' : cycleDay <= 13 ? 'Follicular' : cycleDay <= 16 ? 'Ovulation' : 'Luteal';
  const p = PHASE_CONFIG[phaseName];

  const planets = [
    { symbol: '☀️', name: 'Sun',     sign: userData.sun_sign },
    { symbol: '🌙', name: 'Moon',    sign: userData.moon_sign },
    { symbol: '⬆️', name: 'Rising',  sign: userData.rising_sign },
    { symbol: '☿',  name: 'Mercury', sign: userData.mercury_sign },
    { symbol: '♀️', name: 'Venus',   sign: userData.venus_sign },
    { symbol: '♂️', name: 'Mars',    sign: userData.mars_sign },
  ].filter(pl => pl.sign);

  useEffect(() => { fetchMessage(); }, []);

  const fetchMessage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'You are ZodiacCycle. Write a single beautiful, poetic, personal cosmic sentence (max 25 words) for this person. Be specific to their placements. No hashtags.',
          messages: [{
            role: 'user',
            content: `Sun ${userData.sun_sign}, Moon ${userData.moon_sign}, Rising ${userData.rising_sign || 'unknown'}, Venus ${userData.venus_sign || 'unknown'}, Mars ${userData.mars_sign || 'unknown'}. Currently ${phaseName} phase day ${cycleDay}. One cosmic sentence.`,
          }],
        }),
      });
      const data = await res.json();
      setMessage(data.content?.[0]?.text?.trim() || 'The cosmos conspires beautifully in your favour right now.');
    } catch {
      setMessage('The cosmos conspires beautifully in your favour right now.');
    }
    setLoading(false);
  };

  const handleShare = async () => {
    const text = `✨ My Cosmic Wrapped\n\n${p.emoji} ${phaseName} · ${p.season} · Day ${cycleDay}\n☀️ ${userData.sun_sign} Sun · 🌙 ${userData.moon_sign} Moon · ⬆️ ${userData.rising_sign || '?'} Rising\n⚡ ${p.energy} · 💭 ${p.mood} · 🌊 ${p.element}\n\n"${message}"\n\n🌙 zodiaccycle.app`;
    try {
      if (navigator.share) await navigator.share({ title: 'My Cosmic Wrapped ✨', text, url: 'https://zodiaccycle.app' });
      else await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: p.bg }}>

      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            borderRadius: '50%',
            background: p.star,
            opacity: Math.random() * 0.6 + 0.2,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}/>
        ))}
      </div>

      {/* Header buttons */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-2">
        <button onClick={fetchMessage} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: p.star }}/>
        </button>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: p.star, opacity: 0.7 }}>Cosmic Wrapped</p>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <X className="w-4 h-4" style={{ color: p.star }}/>
        </button>
      </div>

      {/* Main card — scrollable */}
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-6">

        {/* Phase hero */}
        <div className="text-center py-6">
          <div className="text-7xl mb-3" style={{ filter: 'drop-shadow(0 0 20px ' + p.accent + '80)' }}>{p.emoji}</div>
          <h1 className="text-3xl font-bold text-white mb-1">{p.season}</h1>
          <p className="text-sm font-medium" style={{ color: p.accent }}>{phaseName} Phase · Day {cycleDay}</p>
          <p className="text-xs mt-1" style={{ color: p.star, opacity: 0.5 }}>{userData.name || 'Starlighter'}</p>
        </div>

        {/* Phase stats row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Energy', value: p.energy },
            { label: 'Mood', value: p.mood },
            { label: 'Element', value: p.element },
            { label: 'Best for', value: p.bestFor },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${p.accent}30` }}>
              <p className="text-[8px] uppercase tracking-wide mb-1" style={{ color: p.accent }}>{s.label}</p>
              <p className="text-[10px] font-bold text-white leading-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Birth chart */}
        {planets.length > 0 && (
          <div className="rounded-3xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${p.accent}20` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: p.accent }}>Birth Chart</p>
            <div className="grid grid-cols-3 gap-2">
              {planets.map(pl => (
                <div key={pl.name} className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-base">{pl.symbol}</span>
                  <div>
                    <p className="text-[8px] uppercase" style={{ color: p.star, opacity: 0.5 }}>{pl.name}</p>
                    <p className="text-xs font-bold text-white">{pl.sign}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI cosmic message */}
        <div className="rounded-3xl p-5 mb-4" style={{ background: `linear-gradient(135deg, ${p.accent}15, ${p.accent}05)`, border: `1px solid ${p.accent}30` }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5" style={{ color: p.accent }}/>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: p.accent }}>Your Cosmic Message</p>
          </div>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: p.accent }}/>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: p.accent, animationDelay: '0.2s' }}/>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: p.accent, animationDelay: '0.4s' }}/>
            </div>
          ) : (
            <p className="text-sm leading-relaxed italic text-white opacity-90">"{message}"</p>
          )}
        </div>

        {/* Footer watermark */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-px flex-1" style={{ background: p.accent + '30' }}/>
          <p className="text-[10px] font-bold" style={{ color: p.accent, opacity: 0.5 }}>🌙 zodiaccycle.app</p>
          <div className="h-px flex-1" style={{ background: p.accent + '30' }}/>
        </div>
        <p className="text-center text-[9px]" style={{ color: p.star, opacity: 0.3 }}>Screenshot to share ✦</p>
      </div>

      {/* Share button */}
      <div className="relative z-10 px-5 pb-8 pt-3" style={{ background: `linear-gradient(to top, ${p.bg}, transparent)` }}>
        <button onClick={handleShare}
          className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl"
          style={{ background: `linear-gradient(135deg, ${p.accent}, ${p.accent}99)`, color: p.bg, boxShadow: `0 8px 32px ${p.accent}40` }}>
          <Share2 className="w-4 h-4"/>
          {shared ? '✅ Copied to clipboard!' : 'Share My Wrapped ✨'}
        </button>
      </div>
    </div>
  );
}