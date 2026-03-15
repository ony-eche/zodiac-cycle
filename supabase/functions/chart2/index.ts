import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as Astronomy from "./astronomy.ts";

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

function toSign(lon: number): string {
  return SIGNS[Math.floor(((lon % 360) + 360) % 360 / 30)];
}
function getDegree(lon: number): number {
  return Math.floor(((lon % 360) + 360) % 360 % 30);
}

serve(async (req: Request) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
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
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
const date      = new Date(datetime.replace(' ', '+'));
    const astroTime = new Astronomy.AstroTime(date);
    const [lat, lng] = coordinates.split(',').map(Number);

    function getHouse(lon: number, ascDeg: number): number {
      const rel = ((lon - ascDeg) % 360 + 360) % 360;
      return Math.floor(rel / 30) + 1;
    }

    // Get obliquity from e_tilt
    const tilt    = Astronomy.e_tilt(astroTime);
    const epsRad  = tilt.mobl * Math.PI / 180;
    const gast    = Astronomy.SiderealTime(astroTime);
    const lst     = ((gast + lng / 15) % 24 + 24) % 24;
    const lstRad  = lst * 15 * Math.PI / 180;
    const latRad  = lat * Math.PI / 180;
    const ascRad  = Math.atan2(
      Math.cos(lstRad),
      -(Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad))
    );
    const ascDeg = ((ascRad * 180 / Math.PI) % 360 + 360) % 360;

   const sunPos = Astronomy.SunPosition(astroTime);
    const sunL  = sunPos.elon;

    function geoLon(body: string): number {
      const vec = Astronomy.GeoVector(body as any, astroTime, true);
      const ecl = Astronomy.Ecliptic(vec);
      return ecl.elon;
    }

    const moonL = geoLon('Moon');
    const mercL = geoLon('Mercury');
    const venL  = geoLon('Venus');
    const marL  = geoLon('Mars');
    const jupL  = geoLon('Jupiter');
    const satL  = geoLon('Saturn');

    return new Response(JSON.stringify({
      status: 'ok',
      data: {
        rising:  { sign: toSign(ascDeg), house: 1,                      degree: getDegree(ascDeg) },
        sun:     { sign: toSign(sunL),   house: getHouse(sunL, ascDeg),  degree: getDegree(sunL)   },
        moon:    { sign: toSign(moonL),  house: getHouse(moonL, ascDeg), degree: getDegree(moonL)  },
        mercury: { sign: toSign(mercL),  house: getHouse(mercL, ascDeg), degree: getDegree(mercL)  },
        venus:   { sign: toSign(venL),   house: getHouse(venL, ascDeg),  degree: getDegree(venL)   },
        mars:    { sign: toSign(marL),   house: getHouse(marL, ascDeg),  degree: getDegree(marL)   },
        jupiter: { sign: toSign(jupL),   house: getHouse(jupL, ascDeg),  degree: getDegree(jupL)   },
        saturn:  { sign: toSign(satL),   house: getHouse(satL, ascDeg),  degree: getDegree(satL)   },
      }
    }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch(err) {
    return new Response(JSON.stringify({ error: String(err), stack: (err as Error).stack }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
