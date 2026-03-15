const WORKER_URL = 'https://owmmrkowqkjbrimazftv.supabase.co/functions/v1';

export interface NatalChartResult {
  sun:     string;
  moon:    string;
  rising:  string;
  venus:   string;
  mars:    string;
  mercury: string;
  jupiter: string;
  saturn:  string;
  houses: {
    sun?:     number;
    moon?:    number;
    venus?:   number;
    mars?:    number;
    mercury?: number;
    jupiter?: number;
    saturn?:  number;
  };
}

function formatDateTime(birthDate: Date, birthTime: string): string {
  const year  = birthDate.getUTCFullYear();
  const month = String(birthDate.getUTCMonth() + 1).padStart(2, '0');
  const day   = String(birthDate.getUTCDate()).padStart(2, '0');
  let time = '12:00:00';
  if (birthTime && birthTime !== 'unknown' && birthTime.includes(':')) {
    const [h, m] = birthTime.split(':');
    time = `${h.padStart(2, '0')}:${(m || '00').padStart(2, '0')}:00`;
  }
  return `${year}-${month}-${day}T${time}+00:00`;
}

export async function getNatalChartFromAPI(
  birthDate: Date,
  birthTime: string,
  lat: number,
  lng: number
): Promise<NatalChartResult> {
  const datetime = formatDateTime(birthDate, birthTime);
  const params = new URLSearchParams({
    datetime,
    coordinates: `${lat},${lng}`,
  });

const response = await fetch(`${WORKER_URL}/chart2?${params}`); 

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Chart API error: ${err}`);
  }

  const data = await response.json();
  console.log('Chart API response:', data);

  const d = data.data;
  return {
    sun:     d.sun.sign,
    moon:    d.moon.sign,
    rising:  d.rising.sign,
    venus:   d.venus.sign,
    mars:    d.mars.sign,
    mercury: d.mercury.sign,
    jupiter: d.jupiter.sign,
    saturn:  d.saturn.sign,
    houses: {
      sun:     d.sun.house,
      moon:    d.moon.house,
      venus:   d.venus.house,
      mars:    d.mars.house,
      mercury: d.mercury.house,
      jupiter: d.jupiter.house,
      saturn:  d.saturn.house,
    },
  };
}
