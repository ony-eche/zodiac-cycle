function julianDay(year: number, month: number, day: number, hour: number): number {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hour / 24 + B - 1524.5;
}

function normalize(deg: number): number { return ((deg % 360) + 360) % 360; }

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
function toSign(lon: number): string { return SIGNS[Math.floor(normalize(lon) / 30)]; }

function sunLon(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L0 = 280.46646 + 36000.76983 * T;
  const M = (357.52911 + 35999.05029 * T) * Math.PI / 180;
  const C = (1.914602 - 0.004817*T)*Math.sin(M) + 0.019993*Math.sin(2*M) + 0.000289*Math.sin(3*M);
  return normalize(L0 + C);
}

function moonLon(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L = 218.3164477 + 481267.88123421*T;
  const M = (357.5291092 + 35999.0502909*T) * Math.PI/180;
  const Mp = (134.9633964 + 477198.8675055*T) * Math.PI/180;
  const D = (297.8501921 + 445267.1114034*T) * Math.PI/180;
  const F = (93.2720950 + 483202.0175233*T) * Math.PI/180;
  return normalize(L + 6.288774*Math.sin(Mp) + 1.274027*Math.sin(2*D-Mp)
    + 0.658314*Math.sin(2*D) + 0.213618*Math.sin(2*Mp)
    - 0.185116*Math.sin(M) - 0.114332*Math.sin(2*F)
    + 0.058793*Math.sin(2*D-2*Mp) + 0.057066*Math.sin(2*D-M-Mp)
    + 0.053322*Math.sin(2*D+Mp) + 0.045758*Math.sin(2*D-M)
    - 0.040923*Math.sin(M-Mp) - 0.034720*Math.sin(D) - 0.030383*Math.sin(M+Mp));
}

function mercuryLon(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L = 252.250906 + 149474.0722491*T;
  const M = (174.7948 + 149472.5153*T) * Math.PI/180;
  const sunM = (357.52911 + 35999.05029*T) * Math.PI/180;
  const venM = (212.877 + 58517.803*T) * Math.PI/180;
  return normalize(L + 23.4400*Math.sin(M) + 2.9818*Math.sin(2*M) + 0.5255*Math.sin(3*M)
    + 0.1058*Math.sin(4*M) + 0.0219*Math.sin(5*M) - 0.0425*Math.sin(sunM)
    + 0.0136*Math.sin(2*sunM - M) - 0.0307*Math.sin(venM - M));
}

function venusLon(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L = 181.979801 + 58517.8156760*T;
  const M = (212.877 + 58517.803*T) * Math.PI/180;
  const sunM = (357.52911 + 35999.05029*T) * Math.PI/180;
  const Me = (174.7948 + 149472.5153*T) * Math.PI/180;
  return normalize(L + (0.7758*Math.sin(M) + 0.0033*Math.sin(2*M)) * 180/Math.PI
    + 0.00541*Math.sin(2*sunM - 2*M) * 180/Math.PI
    - 0.00274*Math.sin(2*sunM - Me) * 180/Math.PI
    + 0.00042*Math.sin(3*sunM - 3*M) * 180/Math.PI);
}

function marsLon(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L = 355.433 + 19140.2993*T;
  const M = (319.529 + 19139.858*T) * Math.PI/180;
  const sunM = (357.52911 + 35999.05029*T) * Math.PI/180;
  const jupM = (20.9 + 3034.906*T) * Math.PI/180;
  return normalize(L + 10.6912*Math.sin(M) + 0.6228*Math.sin(2*M) + 0.0503*Math.sin(3*M)
    + 0.0046*Math.sin(4*M) - 0.0187*Math.sin(sunM) + 0.0092*Math.sin(2*sunM - M)
    - 0.0073*Math.sin(jupM - M) + 0.0043*Math.sin(2*jupM - 2*M));
}

function jupiterLon(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L = 34.351519 + 3034.9056606*T;
  const M = (20.9 + 3034.906*T) * Math.PI/180;
  const satM = (317.1 + 1221.552*T) * Math.PI/180;
  return normalize(L + 5.5549*Math.sin(M) + 0.1683*Math.sin(2*M)
    - 0.4721*Math.sin(M - satM) - 0.2990*Math.sin(2*M - satM));
}

function saturnLon(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L = 50.077444 + 1222.1138488*T;
  const M = (317.1 + 1221.552*T) * Math.PI/180;
  const jupM = (20.9 + 3034.906*T) * Math.PI/180;
  return normalize(L + 6.3585*Math.sin(M) + 0.2204*Math.sin(2*M)
    - 0.6684*Math.sin(jupM - M) + 0.3971*Math.sin(2*jupM - 2*M));
}

function ascendant(jd: number, lat: number, lng: number): number {
  const T = (jd - 2451545) / 36525;
  const GMST = normalize(280.46061837 + 360.98564736629*(jd-2451545) + 0.000387933*T*T);
  const LST = normalize(GMST + lng);
  const eps = (23.439291111 - 0.013004167*T) * Math.PI/180;
  const LSTr = LST * Math.PI/180;
  const latR = lat * Math.PI/180;
  const asc = Math.atan2(Math.cos(LSTr), -(Math.sin(LSTr)*Math.cos(eps) + Math.tan(latR)*Math.sin(eps))) * 180/Math.PI;
  return normalize(asc);
}

function calcChart(year: number, month: number, day: number, hour: number, lat: number, lng: number) {
  const utcHour = hour - lng/15;
  const jd = julianDay(year, month, day, utcHour);
  const asc = ascendant(jd, lat, lng);
  const cusps = Array.from({length: 12}, (_, i) => normalize(asc + i*30));
  function house(lon: number): number {
    const norm = normalize(lon);
    for (let i = 0; i < 12; i++) {
      const start = cusps[i], end = cusps[(i+1)%12];
      if (start < end ? (norm >= start && norm < end) : (norm >= start || norm < end)) return i+1;
    }
    return 1;
  }
  const sLon = sunLon(jd), mLon = moonLon(jd), meLon = mercuryLon(jd);
  const vLon = venusLon(jd), maLon = marsLon(jd), jLon = jupiterLon(jd), saLon = saturnLon(jd);
  return {
    sun:     { sign: toSign(sLon),  house: house(sLon),  degree: Math.floor(normalize(sLon) % 30) },
    moon:    { sign: toSign(mLon),  house: house(mLon),  degree: Math.floor(normalize(mLon) % 30) },
    mercury: { sign: toSign(meLon), house: house(meLon), degree: Math.floor(normalize(meLon) % 30) },
    venus:   { sign: toSign(vLon),  house: house(vLon),  degree: Math.floor(normalize(vLon) % 30) },
    mars:    { sign: toSign(maLon), house: house(maLon), degree: Math.floor(normalize(maLon) % 30) },
    jupiter: { sign: toSign(jLon),  house: house(jLon),  degree: Math.floor(normalize(jLon) % 30) },
    saturn:  { sign: toSign(saLon), house: house(saLon), degree: Math.floor(normalize(saLon) % 30) },
    rising:  { sign: toSign(asc),   house: 1,            degree: Math.floor(normalize(asc) % 30) },
  };
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);
    const path = url.pathname;

    // ── Birth chart ──────────────────────────────────────────────────────────
    if (path === '/chart') {
      try {
        const datetime = url.searchParams.get('datetime');
        const coordinates = url.searchParams.get('coordinates');
        if (!datetime || !coordinates) {
          return new Response(JSON.stringify({ error: 'Missing datetime or coordinates' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const dt = new Date(datetime);
        const chart = calcChart(
          dt.getUTCFullYear(), dt.getUTCMonth()+1, dt.getUTCDate(),
          dt.getUTCHours() + dt.getUTCMinutes()/60,
          ...coordinates.split(',').map(Number) as [number, number]
        );
        return new Response(JSON.stringify({ status: 'ok', data: chart }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Claude AI ────────────────────────────────────────────────────────────
    if (path === '/ai/predict' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1000,
            messages: body.messages,
            system: body.system,
          }),
        });
        const text = await response.text();
        return new Response(text, {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

   // ── Stripe: Create Subscription ──────────────────────────────────────────
    if (path === '/stripe/create-payment-intent' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const { priceId, email } = body;

        if (!env.STRIPE_SECRET_KEY) {
          return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // ── Step 1: Find or create Stripe customer ────────────────────────────
        let customerId: string | undefined;

        if (email) {
          // Search for existing customer
          const searchRes = await fetch(
            `https://api.stripe.com/v1/customers/search?query=email:'${encodeURIComponent(email)}'&limit=1`,
            { headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` } }
          );
          const searchData = await searchRes.json() as any;

          if (searchData.data?.length > 0) {
            customerId = searchData.data[0].id;
          } else {
            // Create new customer
            const createRes = await fetch('https://api.stripe.com/v1/customers', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({ email }).toString(),
            });
            const customer = await createRes.json() as any;
            if (customer.error) {
              return new Response(JSON.stringify({ error: customer.error.message }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
            customerId = customer.id;
          }
        }

        // ── Step 2: Create subscription ───────────────────────────────────────
        const subParams = new URLSearchParams({
          'items[0][price]': priceId,
          'payment_behavior': 'default_incomplete',
          'payment_settings[save_default_payment_method]': 'on_subscription',
          'expand[0]': 'latest_invoice.payment_intent',
        });

        if (customerId) subParams.set('customer', customerId);

        const subRes = await fetch('https://api.stripe.com/v1/subscriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: subParams.toString(),
        });

        const subscription = await subRes.json() as any;

        if (subscription.error) {
          // Fallback: if subscription fails, use simple PaymentIntent
          const priceRes = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
            headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` },
          });
          const price = await priceRes.json() as any;

          const piRes = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              'amount': String(price.unit_amount),
              'currency': price.currency,
              'automatic_payment_methods[enabled]': 'true',
              ...(customerId ? { 'customer': customerId } : {}),
            }).toString(),
          });
          const pi = await piRes.json() as any;
          if (pi.error) {
            return new Response(JSON.stringify({ error: pi.error.message }), {
              status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          return new Response(JSON.stringify({ clientSecret: pi.client_secret, customerId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;
        const subscriptionId = subscription.id;

        if (!clientSecret) {
          return new Response(JSON.stringify({ error: 'No client secret returned from Stripe' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ clientSecret, subscriptionId, customerId }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    // ── Stripe: Update customer email ────────────────────────────────────────────
if (path === '/stripe/update-customer' && request.method === 'POST') {
  try {
    const { customerId, email } = await request.json() as any;
    if (!customerId || !email) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ email }).toString(),
    });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
    // ── Health check ─────────────────────────────────────────────────────────
    if (path === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        anthropic_key_set: !!env.ANTHROPIC_API_KEY,
        stripe_key_set: !!env.STRIPE_SECRET_KEY,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
