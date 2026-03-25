import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Share2, Sparkles } from 'lucide-react';
import { useUserData } from '../context/UserDataContext';

const WORKER_URL = import.meta.env.VITE_WORKER_URL;

const PHASE_DATA: Record<string, { emoji: string; gradient: string; energy: string; mood: string; title: string }> = {
  Menstrual:  { emoji: '🔴', gradient: 'from-rose-500 via-pink-500 to-rose-400',     energy: 'Low',      mood: 'Reflective',   title: 'Inner Winter' },
  Follicular: { emoji: '🌸', gradient: 'from-purple-500 via-fuchsia-500 to-pink-400', energy: 'Rising',   mood: 'Optimistic',   title: 'Inner Spring' },
  Ovulation:  { emoji: '⭐', gradient: 'from-amber-400 via-orange-400 to-yellow-400', energy: 'Peak',     mood: 'Magnetic',     title: 'Inner Summer' },
  Luteal:     { emoji: '🌙', gradient: 'from-indigo-500 via-purple-500 to-violet-400', energy: 'Inward',  mood: 'Intuitive',    title: 'Inner Autumn' },
};

const SLIDES = ['intro', 'chart', 'transits', 'cycle', 'message'] as const;
type Slide = typeof SLIDES[number];

export function CosmicWrapped({ onClose }: { onClose: () => void }) {
  const { userData } = useUserData();
  const [slide, setSlide] = useState<number>(0);
  const [cosmicMessage, setCosmicMessage] = useState<string>('');
  const [transitSummary, setTransitSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const cycleDay = userData.lastPeriodStart
    ? Math.max(1, Math.floor((Date.now() - new Date(userData.lastPeriodStart).getTime()) / 86400000) % 28 + 1)
    : 14;
  const phaseName = cycleDay <= 5 ? 'Menstrual' : cycleDay <= 13 ? 'Follicular' : cycleDay <= 16 ? 'Ovulation' : 'Luteal';
  const phase = PHASE_DATA[phaseName];

  useEffect(() => {
    generateCosmicReading();
  }, []);

  const generateCosmicReading = async () => {
    setLoading(true);
    try {
      const [messageRes, transitRes] = await Promise.all([
        fetch(`${WORKER_URL}/ai/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: 'You are ZodiacCycle, a warm cosmic astrologer. Write beautiful, personal, poetic readings. Be specific to their placements. Max 3 sentences.',
            messages: [{
              role: 'user',
              content: `Write a personal cosmic message for someone with Sun in ${userData.sun_sign}, Moon in ${userData.moon_sign}, Rising in ${userData.rising_sign || 'unknown'}, Mercury in ${userData.mercury_sign || 'unknown'}, Venus in ${userData.venus_sign || 'unknown'}, Mars in ${userData.mars_sign || 'unknown'}. They are currently in their ${phaseName} phase (Day ${cycleDay}). Make it feel like a beautiful gift — warm, specific, poetic. 3 sentences max.`,
            }],
          }),
        }),
        fetch(`${WORKER_URL}/ai/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: 'You are a cosmic astrologer. Write warm, personal transit insights. 2 sentences max.',
            messages: [{
              role: 'user',
              content: `Write a brief current cosmic weather reading for someone with Sun in ${userData.sun_sign} and Moon in ${userData.moon_sign}, currently in their ${phaseName} phase. What energies are supporting them right now? 2 sentences, warm and personal.`,
            }],
          }),
        }),
      ]);

      const [msgData, transitData] = await Promise.all([messageRes.json(), transitRes.json()]);
      setCosmicMessage(msgData.content?.[0]?.text?.trim() || 'The stars are writing your story with extraordinary care.');
      setTransitSummary(transitData.content?.[0]?.text?.trim() || 'The cosmos is aligning in your favour right now.');
    } catch {
      setCosmicMessage('The stars are writing your story with extraordinary care. Your unique cosmic blueprint is one of a kind.');
      setTransitSummary('The cosmos is aligning in your favour right now. Trust the timing of your journey.');
    }
    setLoading(false);
  };

  const handleShare = async () => {
    const text = `✨ My ZodiacCycle Cosmic Wrapped\n\n☀️ ${userData.sun_sign} Sun · 🌙 ${userData.moon_sign} Moon · ⬆️ ${userData.rising_sign || '?'} Rising\n\n${phase.emoji} ${phaseName} Phase · Day ${cycleDay} · ${phase.title}\n⚡ Energy: ${phase.energy} · 💭 Mood: ${phase.mood}\n\n"${cosmicMessage}"\n\nDiscover your cosmic blueprint 🌙\nzodiaccycle.app`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My ZodiacCycle Cosmic Wrapped ✨', text, url: 'https://zodiaccycle.app' });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch {}
  };

  const currentSlide = SLIDES[slide];

  const planets = [
    { symbol: '☀️', name: 'Sun', sign: userData.sun_sign },
    { symbol: '🌙', name: 'Moon', sign: userData.moon_sign },
    { symbol: '⬆️', name: 'Rising', sign: userData.rising_sign },
    { symbol: '☿', name: 'Mercury', sign: userData.mercury_sign },
    { symbol: '♀️', name: 'Venus', sign: userData.venus_sign },
    { symbol: '♂️', name: 'Mars', sign: userData.mars_sign },
  ].filter(p => p.sign);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      <button onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
        <X className="w-5 h-5 text-white"/>
      </button>

      {/* Progress dots */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === slide ? 'w-6 bg-white' : i < slide ? 'w-2 bg-white/60' : 'w-2 bg-white/30'}`}/>
        ))}
      </div>

      {/* Slide content */}
      <div ref={cardRef} className="w-full h-full">

        {/* SLIDE 1: Intro */}
        {currentSlide === 'intro' && (
          <div className={`w-full h-full bg-gradient-to-br ${phase.gradient} flex flex-col items-center justify-center p-8 text-white text-center`}>
            <div className="text-8xl mb-6 animate-pulse">🌙</div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">ZodiacCycle</p>
            <h1 className="text-4xl font-bold mb-3">Your Cosmic<br/>Wrapped ✨</h1>
            <p className="text-lg opacity-80">{userData.name || 'Starlighter'}</p>
            <div className="mt-8 flex gap-3">
              <div className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(255,255,255,0.2)' }}>
                ☀️ {userData.sun_sign}
              </div>
              <div className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(255,255,255,0.2)' }}>
                🌙 {userData.moon_sign}
              </div>
            </div>
            <p className="mt-12 text-sm opacity-60 animate-bounce">Tap to explore →</p>
          </div>
        )}

        {/* SLIDE 2: Birth Chart */}
        {currentSlide === 'chart' && (
          <div className="w-full h-full bg-gradient-to-br from-[#0f0a1e] to-[#1a0f2e] flex flex-col p-8 text-white">
            <div className="mt-12 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Your Blueprint</p>
              <h2 className="text-3xl font-bold">Birth Chart ✦</h2>
            </div>
            <div className="space-y-3 flex-1">
              {planets.map(p => (
                <div key={p.name} className="flex items-center gap-4 rounded-2xl p-4" style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)' }}>
                  <span className="text-2xl w-10 text-center">{p.symbol}</span>
                  <div className="flex-1">
                    <p className="text-xs text-purple-300 uppercase tracking-wide">{p.name}</p>
                    <p className="text-lg font-bold">{p.sign}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-purple-400"/>
                </div>
              ))}
              {planets.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl mb-3">🔮</p>
                    <p className="text-purple-300">Complete your birth chart<br/>in the Chart tab</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-purple-400/50 mt-4">zodiaccycle.app</p>
          </div>
        )}

        {/* SLIDE 3: Current Transits */}
        {currentSlide === 'transits' && (
          <div className="w-full h-full bg-gradient-to-br from-[#0a0a1e] to-[#0f1a2e] flex flex-col p-8 text-white">
            <div className="mt-12 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">Right Now</p>
              <h2 className="text-3xl font-bold">Cosmic Weather 🌌</h2>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <Sparkles className="w-8 h-8 text-blue-400 animate-pulse"/>
                  <p className="text-blue-300 text-sm">Reading the stars...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-3xl p-6" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <p className="text-xs text-blue-400 uppercase tracking-wide mb-3">Current Energy</p>
                    <p className="text-lg leading-relaxed text-blue-100">{transitSummary}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Sun', value: userData.sun_sign, color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', text: 'text-amber-300' },
                      { label: 'Moon', value: userData.moon_sign, color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30', text: 'text-blue-300' },
                      { label: 'Rising', value: userData.rising_sign || '?', color: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/30', text: 'text-purple-300' },
                    ].map(s => (
                      <div key={s.label} className={`rounded-2xl p-3 text-center bg-gradient-to-br ${s.color} border ${s.border}`}>
                        <p className={`text-[9px] uppercase tracking-wide ${s.text} opacity-70`}>{s.label}</p>
                        <p className={`text-sm font-bold ${s.text} mt-1`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-blue-400/50 mt-4">zodiaccycle.app</p>
          </div>
        )}

        {/* SLIDE 4: Cycle Phase */}
        {currentSlide === 'cycle' && (
          <div className={`w-full h-full bg-gradient-to-br ${phase.gradient} flex flex-col p-8 text-white`}>
            <div className="mt-12 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Your Season</p>
              <h2 className="text-3xl font-bold">{phase.title} {phase.emoji}</h2>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-5">
              <div className="text-center">
                <div className="text-8xl mb-4">{phase.emoji}</div>
                <p className="text-2xl font-bold">{phaseName} Phase</p>
                <p className="text-lg opacity-80">Day {cycleDay}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Energy', value: phase.energy, icon: '⚡' },
                  { label: 'Mood', value: phase.mood, icon: '💭' },
                  { label: 'Best for', value: phaseName === 'Follicular' ? 'New starts' : phaseName === 'Ovulation' ? 'Connecting' : phaseName === 'Luteal' ? 'Completing' : 'Resting', icon: '✨' },
                  { label: 'Element', value: phaseName === 'Follicular' ? 'Air' : phaseName === 'Ovulation' ? 'Fire' : phaseName === 'Luteal' ? 'Earth' : 'Water', icon: '🌊' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <p className="text-xl mb-1">{s.icon}</p>
                    <p className="text-[9px] uppercase tracking-wide opacity-70">{s.label}</p>
                    <p className="text-sm font-bold mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-xs opacity-50 mt-4">zodiaccycle.app</p>
          </div>
        )}

        {/* SLIDE 5: Personal Message */}
        {currentSlide === 'message' && (
          <div className="w-full h-full bg-gradient-to-br from-[#0f0a1e] via-[#1a0f2e] to-[#0f0a1e] flex flex-col p-8 text-white">
            <div className="mt-12 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Your Reading</p>
              <h2 className="text-3xl font-bold">From the Stars 🔮</h2>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-6">
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <Sparkles className="w-8 h-8 text-purple-400 animate-pulse"/>
                  <p className="text-purple-300 text-sm">Channelling your reading...</p>
                </div>
              ) : (
                <>
                  <div className="rounded-3xl p-6" style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.3)' }}>
                    <p className="text-purple-300 text-xs uppercase tracking-wide mb-3">✦ Personal Message</p>
                    <p className="text-lg leading-relaxed italic">"{cosmicMessage}"</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: 'rgba(192,132,252,0.08)' }}>
                    <div className="text-2xl">🌙</div>
                    <div>
                      <p className="text-xs text-purple-300">{userData.name || 'Starlighter'}</p>
                      <p className="text-xs opacity-50">☀️ {userData.sun_sign} · 🌙 {userData.moon_sign} · {phase.emoji} {phaseName}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Share button on last slide */}
            <div className="space-y-3 mt-6">
              <button onClick={handleShare}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg">
                <Share2 className="w-4 h-4"/>
                {shared ? '✅ Shared!' : 'Share My Wrapped ✨'}
              </button>
              <p className="text-center text-xs text-purple-400/50">Screenshot any slide to share on Instagram</p>
            </div>
            <p className="text-center text-xs text-purple-400/30 mt-3">zodiaccycle.app</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-between px-8">
        <button
          onClick={() => setSlide(s => Math.max(0, s - 1))}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${slide === 0 ? 'opacity-0 pointer-events-none' : 'bg-white/10'}`}>
          <ChevronLeft className="w-5 h-5 text-white"/>
        </button>
        <button
          onClick={() => slide < SLIDES.length - 1 ? setSlide(s => s + 1) : handleShare()}
          className="px-8 py-3 rounded-full bg-white/20 text-white font-bold text-sm">
          {slide < SLIDES.length - 1 ? 'Next →' : shared ? '✅ Shared!' : 'Share ✨'}
        </button>
        <button
          onClick={() => setSlide(s => Math.min(SLIDES.length - 1, s + 1))}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${slide === SLIDES.length - 1 ? 'opacity-0 pointer-events-none' : 'bg-white/10'}`}>
          <ChevronRight className="w-5 h-5 text-white"/>
        </button>
      </div>
    </div>
  );
}