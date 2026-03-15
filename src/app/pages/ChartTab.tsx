import { useState } from 'react';
import { useUserData } from '../context/UserDataContext';
import { useTranslation } from 'react-i18next';

function getZodiacSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

const SIGN_LIST = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_ELEMENTS: Record<string, string> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};
const ELEMENT_COLORS: Record<string, string> = {
  fire: '#f97316', earth: '#84cc16', air: '#38bdf8', water: '#818cf8',
};

const CX = 160, CY = 160;
const R_OUTER = 148, R_ZODIAC = 126, R_HOUSE = 104, R_PLANET = 78, R_INNER = 48;

function polar(r: number, deg: number) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function signDeg(sign: string, offset = 15) {
  return SIGN_LIST.indexOf(sign) * 30 + offset;
}

interface Planet {
  key: string; symbol: string; glyph: string;
  sign: string | undefined; color: string; glowColor: string; offset: number;
}

export function ChartTab() {
  const { userData } = useUserData();
  const { t } = useTranslation();
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  const sunSign = userData.sun_sign || (userData.dateOfBirth ? getZodiacSign(new Date(userData.dateOfBirth)) : undefined);

  const planets: Planet[] = [
    { key: 'sun',     symbol: '☀️', glyph: '☉', sign: sunSign,                color: '#f59e0b', glowColor: 'rgba(245,158,11,0.6)',  offset: 0  },
    { key: 'moon',    symbol: '🌙', glyph: '☽', sign: userData.moon_sign,     color: '#c084fc', glowColor: 'rgba(192,132,252,0.6)', offset: 8  },
    { key: 'rising',  symbol: '⬆️', glyph: 'AC', sign: userData.rising_sign,  color: '#d4d4f8', glowColor: 'rgba(212,212,248,0.7)', offset: -5 },
    { key: 'venus',   symbol: '♀️', glyph: '♀', sign: userData.venus_sign,   color: '#fb7185', glowColor: 'rgba(251,113,133,0.6)', offset: 5  },
    { key: 'mars',    symbol: '♂️', glyph: '♂', sign: userData.mars_sign,    color: '#ef4444', glowColor: 'rgba(239,68,68,0.6)',   offset: 12 },
    { key: 'mercury', symbol: '☿',  glyph: '☿', sign: userData.mercury_sign, color: '#06b6d4', glowColor: 'rgba(6,182,212,0.6)',   offset: -8 },
    { key: 'jupiter', symbol: '♃',  glyph: '♃', sign: userData.jupiter_sign, color: '#f97316', glowColor: 'rgba(249,115,22,0.5)',  offset: 3  },
    { key: 'saturn',  symbol: '♄',  glyph: '♄', sign: userData.saturn_sign,  color: '#94a3b8', glowColor: 'rgba(148,163,184,0.5)', offset: -3 },
  ];

  const valid = planets.filter(p => p.sign && SIGN_LIST.includes(p.sign));

  // Aspect lines
  const aspects: { x1:number; y1:number; x2:number; y2:number; color:string; dash:string }[] = [];
  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      const a = signDeg(valid[i].sign!, valid[i].offset);
      const b = signDeg(valid[j].sign!, valid[j].offset);
      let diff = Math.abs(a - b) % 360;
      if (diff > 180) diff = 360 - diff;
      let color = '';
      let dash = '4,4';
      if (diff < 8)                    { color = 'rgba(245,158,11,0.45)';  dash = '0'; }
      else if (Math.abs(diff-60)  < 6) { color = 'rgba(56,189,248,0.4)';  dash = '3,4'; }
      else if (Math.abs(diff-90)  < 6) { color = 'rgba(239,68,68,0.4)';   dash = '2,3'; }
      else if (Math.abs(diff-120) < 6) { color = 'rgba(134,239,172,0.5)'; dash = '0'; }
      else if (Math.abs(diff-180) < 8) { color = 'rgba(192,132,252,0.4)'; dash = '4,3'; }
      if (color) {
        const p1 = polar(R_PLANET - 8, a);
        const p2 = polar(R_PLANET - 8, b);
        aspects.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, color, dash });
      }
    }
  }

  const sel = selectedPlanet ? planets.find(p => p.key === selectedPlanet) : null;

  const info: Record<string, { name: string; desc: string }> = {
    sun:     { name: t('chart.sun'),     desc: t('chart.sunDesc') },
    moon:    { name: t('chart.moon'),    desc: t('chart.moonDesc') },
    rising:  { name: t('chart.rising'),  desc: t('chart.risingDesc') },
    venus:   { name: t('chart.venus'),   desc: t('chart.venusDesc') },
    mars:    { name: t('chart.mars'),    desc: t('chart.marsDesc') },
    mercury: { name: t('chart.mercury'), desc: t('chart.mercuryDesc') },
    jupiter: { name: t('chart.jupiter'), desc: t('chart.jupiterDesc') },
    saturn:  { name: t('chart.saturn'),  desc: t('chart.saturnDesc') },
  };

  return (
    <div className="space-y-4 pb-24">
      <h2 className="text-2xl font-medium">{t('chart.title')}</h2>

      {/* ── Wheel card ── */}
      <div className="glass glossy rounded-3xl p-5 border border-white/40 flex flex-col items-center">
        <svg viewBox="0 0 320 320" style={{ width: '100%', maxWidth: 300 }}>
          <defs>
            <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
            </radialGradient>
            <filter id="pGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Background glow */}
          <circle cx={CX} cy={CY} r={R_OUTER} fill="url(#bgGlow)" />

          {/* Zodiac element bands */}
          {SIGN_LIST.map((sign, i) => {
            const s1 = polar(R_ZODIAC, i * 30 - 90 + 1);
            const s2 = polar(R_ZODIAC, i * 30 + 30 - 90 - 1);
            const e1 = polar(R_OUTER,  i * 30 - 90 + 1);
            const e2 = polar(R_OUTER,  i * 30 + 30 - 90 - 1);
            const color = ELEMENT_COLORS[SIGN_ELEMENTS[sign]];
            const isHighlighted = sel?.sign === sign;
            return (
              <path key={sign}
                d={`M${s1.x},${s1.y} A${R_ZODIAC},${R_ZODIAC} 0 0,1 ${s2.x},${s2.y} L${e2.x},${e2.y} A${R_OUTER},${R_OUTER} 0 0,0 ${e1.x},${e1.y} Z`}
                fill={color} opacity={isHighlighted ? 0.4 : 0.13}
                stroke={color} strokeWidth="0.4" strokeOpacity="0.4"
              />
            );
          })}

          {/* Ring borders */}
          <circle cx={CX} cy={CY} r={R_OUTER}  fill="none" stroke="rgba(192,132,252,0.5)" strokeWidth="1.5" />
          <circle cx={CX} cy={CY} r={R_ZODIAC} fill="none" stroke="rgba(192,132,252,0.25)" strokeWidth="0.8" />
          <circle cx={CX} cy={CY} r={R_HOUSE}  fill="none" stroke="rgba(192,132,252,0.15)" strokeWidth="0.5" />

          {/* Zodiac glyphs */}
          {SIGN_GLYPHS.map((glyph, i) => {
            const mid = polar((R_OUTER + R_ZODIAC) / 2, i * 30 + 15 - 90);
            return (
              <text key={i} x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="11" fill={ELEMENT_COLORS[SIGN_ELEMENTS[SIGN_LIST[i]]]}
                opacity="0.95" fontWeight="bold" filter="url(#softGlow)">
                {glyph}
              </text>
            );
          })}

          {/* House spokes */}
          {Array.from({ length: 12 }).map((_, i) => {
            const inner = polar(R_INNER, i * 30 - 90);
            const outer = polar(R_ZODIAC, i * 30 - 90);
            return (
              <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke="rgba(192,132,252,0.2)" strokeWidth={i % 3 === 0 ? 1.2 : 0.5} />
            );
          })}

          {/* House numbers */}
          {Array.from({ length: 12 }).map((_, i) => {
            const pos = polar((R_HOUSE + R_ZODIAC) / 2 - 4, i * 30 + 15 - 90);
            return (
              <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="6.5" fill="rgba(139,90,159,0.45)">{i + 1}</text>
            );
          })}

          {/* Inner atmosphere */}
          <circle cx={CX} cy={CY} r={R_INNER + 22} fill="none"
            stroke="rgba(192,132,252,0.08)" strokeWidth="16" />

          {/* Aspect lines */}
          {aspects.map((asp, i) => (
            <line key={i} x1={asp.x1} y1={asp.y1} x2={asp.x2} y2={asp.y2}
              stroke={asp.color} strokeWidth="1"
              strokeDasharray={asp.dash}
              opacity="0.9"
            />
          ))}

          {/* Planet orbs */}
          {valid.map(p => {
            const deg = signDeg(p.sign!, p.offset);
            const pos = polar(R_PLANET, deg);
            const isSel = selectedPlanet === p.key;
            return (
              <g key={p.key} onClick={() => setSelectedPlanet(prev => prev === p.key ? null : p.key)}
                style={{ cursor: 'pointer' }} filter="url(#pGlow)">
                {/* Outer glow */}
                <circle cx={pos.x} cy={pos.y} r={isSel ? 15 : 11}
                  fill={p.glowColor} opacity={isSel ? 0.6 : 0.35} />
                {/* Orb */}
                <circle cx={pos.x} cy={pos.y} r={isSel ? 9 : 7}
                  fill={p.color} stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
                {/* Glyph */}
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize={p.glyph === 'AC' ? 4.5 : 6.5} fill="white" fontWeight="bold">
                  {p.glyph}
                </text>
              </g>
            );
          })}

          {/* Center circle */}
          <circle cx={CX} cy={CY} r={R_INNER}
            fill="rgba(253,245,248,0.88)" stroke="rgba(192,132,252,0.25)" strokeWidth="1" />
          <text x={CX} y={CY - 9} textAnchor="middle" fontSize="19" fill="#c084fc"
            style={{ filter: 'drop-shadow(0 0 8px rgba(192,132,252,0.7))' }}>✦</text>
          <text x={CX} y={CY + 9} textAnchor="middle" fontSize="7" fill="#8b5a9f" opacity="0.75">
            {userData.name || ''}
          </text>
        </svg>

        {/* Tap hint */}
        <p className="text-xs text-muted-foreground mt-1 mb-2">Tap a planet to explore</p>

        {/* Selected planet popup */}
        {sel && sel.sign && (
          <div className="w-full glass rounded-2xl p-4 border border-white/50 flex items-center gap-3 mb-2"
            style={{ boxShadow: `0 0 20px ${sel.glowColor}` }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${sel.color}22`, boxShadow: `0 0 14px ${sel.glowColor}` }}>
              {sel.symbol}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-sm">{info[sel.key]?.name}</p>
                <span className="text-sm font-bold text-primary">{sel.sign}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{info[sel.key]?.desc}</p>
            </div>
          </div>
        )}

        {/* Planet legend */}
        <div className="flex flex-wrap justify-center gap-2 px-2 mt-1">
          {valid.map(p => (
            <button key={p.key}
              onClick={() => setSelectedPlanet(prev => prev === p.key ? null : p.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-200 ${
                selectedPlanet === p.key ? 'bg-white/40 shadow-md scale-105' : 'hover:bg-white/20'
              }`}>
              <div className="w-2.5 h-2.5 rounded-full"
                style={{ background: p.color, boxShadow: `0 0 5px ${p.glowColor}` }} />
              <span className="text-muted-foreground font-medium">{p.sign}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Planet list cards ── */}
      <div className="space-y-2">
        {planets.map(p => {
          const value = p.sign || t('chart.calculating');
          const isSel = selectedPlanet === p.key;
          return (
            <button key={p.key}
              onClick={() => setSelectedPlanet(prev => prev === p.key ? null : p.key)}
              className={`w-full text-left glass rounded-2xl p-4 border transition-all duration-200 glossy-hover ${
                isSel ? 'border-primary/40 scale-[1.01]' : 'border-white/30 hover:border-white/50'
              }`}
              style={isSel ? { boxShadow: `0 0 16px ${p.glowColor}` } : {}}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${p.color}25, ${p.color}10)`,
                    boxShadow: isSel ? `0 0 12px ${p.glowColor}` : 'none',
                  }}>
                  {p.symbol}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{info[p.key]?.name}</p>
                      <p className="text-xs text-muted-foreground">{info[p.key]?.desc}</p>
                    </div>
                    <span className={`text-sm font-semibold ${!p.sign ? 'text-muted-foreground' : 'text-primary'}`}>
                      {value}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Aspect legend ── */}
      {aspects.length > 0 && (
        <div className="glass rounded-2xl p-4 border border-white/30">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Active Aspects</p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {[
              { color: 'rgba(245,158,11,0.85)',  label: 'Conjunction ☌', desc: 'Merging energies' },
              { color: 'rgba(134,239,172,0.85)', label: 'Trine △',       desc: 'Harmonious flow' },
              { color: 'rgba(239,68,68,0.85)',   label: 'Square □',      desc: 'Tension & growth' },
              { color: 'rgba(56,189,248,0.85)',  label: 'Sextile ⚹',    desc: 'Opportunity' },
              { color: 'rgba(192,132,252,0.85)', label: 'Opposition ☍',  desc: 'Awareness' },
            ].map(a => (
              <div key={a.label} className="flex items-center gap-2">
                <div className="w-7 h-0.5 rounded-full flex-shrink-0"
                  style={{ background: a.color, boxShadow: `0 0 4px ${a.color}` }} />
                <div>
                  <p className="text-xs font-medium leading-tight">{a.label}</p>
                  <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}