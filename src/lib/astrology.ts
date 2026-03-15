const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_LIST = SIGNS;

function longitudeToSign(longitude: number): string {
  const normalized = ((longitude % 360) + 360) % 360;
  return SIGNS[Math.floor(normalized / 30)];
}

// ─── Julian Day Number ────────────────────────────────────────────────────────
function dateToJD(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440;

  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);

  return Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day + B - 1524.5;
}

// ─── Birth date/time helper ───────────────────────────────────────────────────
function birthToJD(birthDate: Date, birthTime?: string, lng?: number): number {
  const year = birthDate.getUTCFullYear();
  const month = birthDate.getUTCMonth();
  const day = birthDate.getUTCDate();

  let hours = 12;
  let minutes = 0;

  if (birthTime && birthTime !== 'unknown' && birthTime.includes(':')) {
    const parts = birthTime.split(':');
    hours = parseInt(parts[0]);
    minutes = parseInt(parts[1]) || 0;
  }

  // Adjust for local timezone using longitude (15 degrees = 1 hour)
  const tzOffset = lng ? lng / 15 : 0;
  const utcHours = hours - tzOffset;

  const date = new Date(year, month, day, utcHours, minutes, 0);
  return dateToJD(date);
}

// ─── Sun ──────────────────────────────────────────────────────────────────────
function getSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
    + 0.000289 * Math.sin(3 * M);
  return L0 + C;
}

// ─── Moon ─────────────────────────────────────────────────────────────────────
function getMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L  = 218.3164477 + 481267.88123421 * T;
  const M  = (357.5291092 + 35999.0502909 * T)  * Math.PI / 180;
  const Mp = (134.9633964 + 477198.8675055 * T)  * Math.PI / 180;
  const D  = (297.8501921 + 445267.1114034 * T)  * Math.PI / 180;
  const F  = (93.2720950  + 483202.0175233 * T)  * Math.PI / 180;

  return L
    + 6.288774 * Math.sin(Mp)
    + 1.274027 * Math.sin(2 * D - Mp)
    + 0.658314 * Math.sin(2 * D)
    + 0.213618 * Math.sin(2 * Mp)
    - 0.185116 * Math.sin(M)
    - 0.114332 * Math.sin(2 * F)
    + 0.058793 * Math.sin(2 * D - 2 * Mp)
    + 0.057066 * Math.sin(2 * D - M - Mp)
    + 0.053322 * Math.sin(2 * D + Mp)
    + 0.045758 * Math.sin(2 * D - M)
    - 0.040923 * Math.sin(M - Mp)
    - 0.034720 * Math.sin(D)
    - 0.030383 * Math.sin(M + Mp);
}

// ─── Venus ────────────────────────────────────────────────────────────────────
function getVenusLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L = 181.979801 + 58517.8156760 * T;
  const M = (212.877 + 58517.803 * T) * Math.PI / 180;
  const sunM = (357.52911 + 35999.05029 * T) * Math.PI / 180;
  const C = (0.7758 * Math.sin(M) + 0.0033 * Math.sin(2 * M)) * 180 / Math.PI;
  const phase = 1.2720 * Math.sin(2 * (L * Math.PI / 180) - 2 * sunM);
  return L + C + phase;
}

// ─── Mars ─────────────────────────────────────────────────────────────────────
function getMarsLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L = 355.433 + 19140.2993 * T;
  const M = (319.529 + 19139.858 * T) * Math.PI / 180;
  return L
    + 10.6912 * Math.sin(M)
    + 0.6228  * Math.sin(2 * M)
    + 0.0503  * Math.sin(3 * M)
    + 0.0046  * Math.sin(4 * M);
}

// ─── Mercury ──────────────────────────────────────────────────────────────────
function getMercuryLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L = 252.250906 + 149474.0722491 * T;
  const M = (174.7948 + 149472.5153 * T) * Math.PI / 180;
  return L
    + 23.4400 * Math.sin(M)
    + 2.9818  * Math.sin(2 * M)
    + 0.5255  * Math.sin(3 * M)
    + 0.1058  * Math.sin(4 * M)
    + 0.0219  * Math.sin(5 * M);
}
// ─── Rising Sign (Ascendant) ──────────────────────────────────────────────────
function getAscendant(jd: number, lat: number, lng: number): number {
  const T = (jd - 2451545.0) / 36525;

  // Greenwich Mean Sidereal Time
  const GMST = 280.46061837
    + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T
    - T * T * T / 38710000;

  // Local Sidereal Time
  const LST = ((GMST + lng) % 360 + 360) % 360;

  const latRad = lat * Math.PI / 180;
  const obliquity = (23.439291111 - 0.013004167 * T) * Math.PI / 180;
  const LSTrad = LST * Math.PI / 180;

  const ascendant = Math.atan2(
    Math.cos(LSTrad),
    -(Math.sin(LSTrad) * Math.cos(obliquity) +
      Math.tan(latRad) * Math.sin(obliquity))
  ) * 180 / Math.PI;

  return ((ascendant % 360) + 360) % 360;
}

// ─── House Cusps (Placidus approximation) ─────────────────────────────────────
function getHouseCusps(jd: number, lat: number, lng: number): number[] {
  const T = (jd - 2451545.0) / 36525;
  const GMST = 280.46061837
    + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T
    - T * T * T / 38710000;
  const LST = ((GMST + lng) % 360 + 360) % 360;
  const obliquity = (23.439291111 - 0.013004167 * T) * Math.PI / 180;
  const latRad = lat * Math.PI / 180;

  const cusps: number[] = [];

  // House 1 = Ascendant
  const asc = getAscendant(jd, lat, lng);
  cusps.push(asc);

  // Houses 2-12 approximated by equal division from ASC
  // (True Placidus requires iterative solving — this is a close approximation)
  for (let i = 1; i < 12; i++) {
    cusps.push(((asc + i * 30) % 360 + 360) % 360);
  }

  return cusps;
}

function getHouseNumber(planetLongitude: number, cusps: number[]): number {
  const lon = ((planetLongitude % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];
    if (start < end) {
      if (lon >= start && lon < end) return i + 1;
    } else {
      if (lon >= start || lon < end) return i + 1;
    }
  }
  return 1;
}

// ─── Exported sign functions ──────────────────────────────────────────────────

export function getSunSign(birthDate: Date, birthTime?: string, lng?: number): string {
  const jd = birthToJD(birthDate, birthTime, lng);
  return longitudeToSign(getSunLongitude(jd));
}

export function getMoonSign(birthDate: Date, birthTime?: string, lng?: number): string {
  try {
    const jd = birthToJD(birthDate, birthTime, lng);
    return longitudeToSign(getMoonLongitude(jd));
  } catch {
    return 'Unknown';
  }
}

export function getRisingSign(
  birthDate: Date,
  birthTime: string,
  lat: number,
  lng: number
): string {
  if (!birthTime || birthTime === 'unknown') return 'Birth time needed';
  try {
    const jd = birthToJD(birthDate, birthTime, lng);
    return longitudeToSign(getAscendant(jd, lat, lng));
  } catch {
    return 'Unknown';
  }
}

export function getVenusSign(birthDate: Date, birthTime?: string, lng?: number): string {
  const jd = birthToJD(birthDate, birthTime, lng);
  return longitudeToSign(getVenusLongitude(jd));
}

export function getMarsSign(birthDate: Date, birthTime?: string, lng?: number): string {
  const jd = birthToJD(birthDate, birthTime, lng);
  return longitudeToSign(getMarsLongitude(jd));
}

export function getMercurySign(birthDate: Date, birthTime?: string, lng?: number): string {
  const jd = birthToJD(birthDate, birthTime, lng);
  return longitudeToSign(getMercuryLongitude(jd));
}

// ─── Current sky positions ────────────────────────────────────────────────────
export function getCurrentPlanetPositions() {
  const today = new Date();
  return {
    sun:     getSunSign(today),
    moon:    getMoonSign(today),
    venus:   getVenusSign(today),
    mars:    getMarsSign(today),
    mercury: getMercurySign(today),
  };
}

// ─── Moon phase ───────────────────────────────────────────────────────────────
export function getMoonPhase(): { phase: string; emoji: string } {
  const today = new Date();
  const jd = dateToJD(today);
  const knownNewMoon = 2451549.5;
  const synodicMonth = 29.53058867;
  const normalized = ((jd - knownNewMoon) % synodicMonth + synodicMonth) % synodicMonth;

  if (normalized < 1.85)  return { phase: 'New Moon',        emoji: '🌑' };
  if (normalized < 7.38)  return { phase: 'Waxing Crescent', emoji: '🌒' };
  if (normalized < 9.22)  return { phase: 'First Quarter',   emoji: '🌓' };
  if (normalized < 14.77) return { phase: 'Waxing Gibbous',  emoji: '🌔' };
  if (normalized < 16.61) return { phase: 'Full Moon',       emoji: '🌕' };
  if (normalized < 22.15) return { phase: 'Waning Gibbous',  emoji: '🌖' };
  if (normalized < 23.99) return { phase: 'Last Quarter',    emoji: '🌗' };
  return                         { phase: 'Waning Crescent', emoji: '🌘' };
}

// ─── Cycle phase ──────────────────────────────────────────────────────────────
export function getCyclePhase(lastPeriodDate: Date, avgCycleLength: number = 28) {
  const today = new Date();
  const last = new Date(lastPeriodDate);
  const daysDiff = Math.floor(
    (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dayOfCycle = (daysDiff % avgCycleLength) + 1;
  const daysUntilPeriod = avgCycleLength - dayOfCycle;

  let phase: string;
  let description: string;
  let emoji: string;

  if (dayOfCycle <= 5) {
    phase = 'menstrual';
    description = 'Rest and restore. Your body is releasing.';
    emoji = '🌑';
  } else if (dayOfCycle <= 13) {
    phase = 'follicular';
    description = 'Energy rising. Good time to start new things.';
    emoji = '🌒';
  } else if (dayOfCycle <= 16) {
    phase = 'ovulatory';
    description = 'Peak energy and confidence. You are magnetic.';
    emoji = '🌕';
  } else {
    phase = 'luteal';
    description = 'Turn inward. Slow down and reflect.';
    emoji = '🌖';
  }

  return { phase, dayOfCycle, daysUntilPeriod, description, emoji };
}

// ─── Full natal chart with houses ─────────────────────────────────────────────
export function getNatalChart(
  birthDate: Date,
  birthTime: string,
  lat: number,
  lng: number
) {
  const jd = birthToJD(birthDate, birthTime, lng);
  const cusps = getHouseCusps(jd, lat, lng);

  const sunLon     = getSunLongitude(jd);
  const moonLon    = getMoonLongitude(jd);
  const venusLon   = getVenusLongitude(jd);
  const marsLon    = getMarsLongitude(jd);
  const mercuryLon = getMercuryLongitude(jd);
  const ascLon     = getAscendant(jd, lat, lng);

  return {
    sun:     getSunSign(birthDate, birthTime, lng),
    moon:    getMoonSign(birthDate, birthTime, lng),
    rising:  getRisingSign(birthDate, birthTime, lat, lng),
    venus:   getVenusSign(birthDate, birthTime, lng),
    mars:    getMarsSign(birthDate, birthTime, lng),
    mercury: getMercurySign(birthDate, birthTime, lng),
    houses: {
      sun:     getHouseNumber(sunLon,     cusps),
      moon:    getHouseNumber(moonLon,    cusps),
      venus:   getHouseNumber(venusLon,   cusps),
      mars:    getHouseNumber(marsLon,    cusps),
      mercury: getHouseNumber(mercuryLon, cusps),
      rising:  1, // Rising is always house 1 by definition
    },
    ascendantDegree: ascLon,
  };
}
