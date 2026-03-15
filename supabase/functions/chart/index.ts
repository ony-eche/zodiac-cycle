import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

function normalize(deg: number): number {
  return ((deg % 360) + 360) % 360;
}
function toSign(lon: number): string {
  return SIGNS[Math.floor(normalize(lon) / 30)];
}
function getDegree(lon: number): number {
  return Math.floor(normalize(lon) % 30);
}
function julianDay(year: number, month: number, day: number, hour: number): number {
  let y = year; let m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25*(y+4716)) + Math.floor(30.6001*(m+1)) + day + hour/24 + B - 1524.5;
}
function sunLon(T: number): number {
  const L0 = 280.46646 + 36000.76983*T + 0.0003032*T*T;
  const M = (357.52911 + 35999.05029*T - 0.0001537*T*T) * Math.PI/180;
  const C = (1.914602 - 0.004817*T - 0.000014*T*T)*Math.sin(M)
    + (0.019993 - 0.000101*T)*Math.sin(2*M) + 0.000289*Math.sin(3*M);
  const omega = (125.04 - 1934.136*T) * Math.PI/180;
  return normalize(L0 + C - 0.00569 - 0.00478*Math.sin(omega));
}
function moonLon(T: number): number {
  const L  = 218.3164477 + 481267.88123421*T - 0.0015786*T*T;
  const M  = (357.5291092 + 35999.0502909*T) * Math.PI/180;
  const Mp = (134.9633964 + 477198.8675055*T + 0.0087414*T*T) * Math.PI/180;
  const D  = (297.8501921 + 445267.1114034*T - 0.0018819*T*T) * Math.PI/180;
  const F  = (93.2720950  + 483202.0175233*T - 0.0036539*T*T) * Math.PI/180;
  const E  = 1 - 0.002516*T - 0.0000074*T*T;
  return normalize(L
    + 6.288774*Math.sin(Mp) + 1.274027*Math.sin(2*D-Mp)
    + 0.658314*Math.sin(2*D) + 0.213618*Math.sin(2*Mp)
    - 0.185116*E*Math.sin(M) - 0.114332*Math.sin(2*F)
    + 0.058793*Math.sin(2*D-2*Mp) + 0.057066*E*Math.sin(2*D-M-Mp)
    + 0.053322*Math.sin(2*D+Mp) + 0.045758*E*Math.sin(2*D-M)
    - 0.040923*E*Math.sin(M-Mp) - 0.034720*Math.sin(D)
    - 0.030383*E*Math.sin(M+Mp) + 0.015327*Math.sin(2*D-2*F)
    + 0.010980*Math.sin(Mp-2*F) + 0.010675*Math.sin(4*D-Mp)
    + 0.010034*Math.sin(3*Mp) + 0.008548*Math.sin(4*D-2*Mp));
}
function mercuryLon(T: number): number {
  const L0 = 252.250906 + 149474.0722491*T + 0.0003035*T*T;
  const M  = (174.7948 + 149472.5153*T) * Math.PI/180;
  const Ms = (357.52911 + 35999.05029*T) * Math.PI/180;
  const Mv = (212.877 + 58517.803*T) * Math.PI/180;
  return normalize(L0
    + 23.4400*Math.sin(M) + 2.9818*Math.sin(2*M)
    + 0.5255*Math.sin(3*M) + 0.1058*Math.sin(4*M)
    + 0.0219*Math.sin(5*M) - 0.1359*Math.sin(Ms)
    + 0.0253*Math.sin(2*Ms-M) - 0.0895*Math.sin(Mv-M)
    + 0.0428*Math.sin(2*Mv-2*M) - 0.0200*Math.sin(Ms-M));
}
function venusLon(T: number): number {
  const L0 = 181.979801 + 58517.8156760*T + 0.00000165*T*T;
  const M  = (212.877 + 58517.803*T) * Math.PI/180;
  const Ms = (357.52911 + 35999.05029*T) * Math.PI/180;
  return normalize(L0
    + (0.7758*Math.sin(M) + 0.0033*Math.sin(2*M)) * 180/Math.PI
    + 0.0726*Math.sin(Ms) - 0.0527*Math.sin(Ms-2*M)
    + 0.0142*Math.sin(2*Ms-3*M) - 0.0098*Math.sin(2*Ms-2*M));
}
function marsLon(T: number): number {
  const L0 = 355.433 + 19140.2993*T + 0.000261*T*T;
  const M  = (319.529 + 19139.858*T) * Math.PI/180;
  const Ms = (357.52911 + 35999.05029*T) * Math.PI/180;
  const Mj = (20.9 + 3034.906*T) * Math.PI/180;
  return normalize(L0
    + 10.6912*Math.sin(M) + 0.6228*Math.sin(2*M)
    + 0.0503*Math.sin(3*M) + 0.0046*Math.sin(4*M)
    - 0.0934*Math.sin(Ms) + 0.0253*Math.sin(2*Ms-2*M)
    - 0.0204*Math.sin(Ms-M) + 0.0108*Math.sin(Ms+M)
    - 0.0064*Math.sin(Mj-M));
}
function jupiterLon(T: number): number {
  const L0 = 34.351519 + 3034.9056606*T;
  const M  = (20.9 + 3034.906*T) * Math.PI/180;
  const Ms = (317.1 + 1221.552*T) * Math.PI/180;
  return normalize(L0
    + 5.5549*Math.sin(M) + 0.1683*Math.sin(2*M)
    - 0.4721*Math.sin(M-Ms) - 0.2990*Math.sin(2*M-Ms)
    + 0.1481*Math.sin(M+Ms));
}
function saturnLon(T: number): number {
  const L0 = 50.077444 + 1222.1138488*T;
  const M  = (317.1 + 1221.552*T) * Math.PI/180;
  const Mj = (20.9 + 3034.906*T) * Math.PI/180;
  return normalize(L0
    + 6.3585*Math.sin(M) + 0.2204*Math.sin(2*M)
    - 0.6684*Math.sin(Mj-M) + 0.3971*Math.sin(2*Mj-2*M)
    - 0.1792*Math.sin(Mj));
}
function ascendant(T: number, jd: number, lat: number, lng: number): number {
  const GMST = normalize(280.46061837 + 360.98564736629*(jd-2451545) + 0.000387933*T*T);
  const LST  = normalize(GMST + lng);
  const eps  = (23.439291111 - 0.013004167*T) * Math.PI/180;
  const LSTr = LST * Math.PI/180;
  const latR = lat * Math.PI/180;
  return normalize(Math.atan2(
    Math.cos(LSTr),
    -(Math.sin(LSTr)*Math.cos(eps) + Math.tan(latR)*Math.sin(eps))
  ) * 180/Math.PI);
}

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Support both GET (query params) and POST (JSON body)
    let datetime = '';
    let coordinates = '';

    if (req.method === 'POST') {
      const body = await req.json();
      datetime    = body.datetime    || '';
      coordinates = body.coordinates || '';
    } else {
      const url   = new URL(req.url);
      datetime    = url.searchParams.get('datetime')    || '';
      coordinates = url.searchParams.get('coordinates') || '';
    }

    if (!datetime || !coordinates) {
      return new Response(JSON.stringify({ error: 'Missing datetime or coordinates' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dt      = new Date(datetime);
    const year    = dt.getUTCFullYear();
    const month   = dt.getUTCMonth() + 1;
    const day     = dt.getUTCDate();
    const utcHour = dt.getUTCHours() + dt.getUTCMinutes()/60;
    const [lat, lng] = coordinates.split(',').map(Number);

    const jd  = julianDay(year, month, day, utcHour);
    const T   = (jd - 2451545) / 36525;
    const asc = ascendant(T, jd, lat, lng);
    const cusps = Array.from({length:12}, (_:unknown, i:number) => normalize(asc + i*30));

    function house(lon: number): number {
      const norm = normalize(lon);
      for (let i = 0; i < 12; i++) {
        const start = cusps[i];
        const end   = cusps[(i+1)%12];
        if (start < end ? (norm >= start && norm < end) : (norm >= start || norm < end)) return i+1;
      }
      return 1;
    }

    const sunL    = sunLon(T);
    const moonL   = moonLon(T);
    const mercL   = mercuryLon(T);
    const venL    = venusLon(T);
    const marL    = marsLon(T);
    const jupL    = jupiterLon(T);
    const satL    = saturnLon(T);

    const out = {
      rising:  { sign: toSign(asc),   house: 1,            degree: getDegree(asc)  },
      sun:     { sign: toSign(sunL),  house: house(sunL),  degree: getDegree(sunL)  },
      moon:    { sign: toSign(moonL), house: house(moonL), degree: getDegree(moonL) },
      mercury: { sign: toSign(mercL), house: house(mercL), degree: getDegree(mercL) },
      venus:   { sign: toSign(venL),  house: house(venL),  degree: getDegree(venL)  },
      mars:    { sign: toSign(marL),  house: house(marL),  degree: getDegree(marL)  },
      jupiter: { sign: toSign(jupL),  house: house(jupL),  degree: getDegree(jupL)  },
      saturn:  { sign: toSign(satL),  house: house(satL),  degree: getDegree(satL)  },
    };

    return new Response(JSON.stringify({ status: 'ok', data: out }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
