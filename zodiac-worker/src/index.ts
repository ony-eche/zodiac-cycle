// ─── Astronomy helpers (unchanged) ──────────────────────────────────────────
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
    - 0.185116*Math.sin(M) - 0.114332*Math.sin(2*F));
}
function mercuryLon(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L = 252.250906 + 149474.0722491*T;
  const M = (174.7948 + 149472.5153*T) * Math.PI/180;
  const sunM = (357.52911 + 35999.05029*T) * Math.PI/180;
  return normalize(L + 23.4400*Math.sin(M) + 2.9818*Math.sin(2*M) + 0.5255*Math.sin(3*M)
    + 0.1058*Math.sin(4*M) - 0.0425*Math.sin(sunM));
}
function venusLon(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L = 181.979801 + 58517.8156760*T;
  const M = (212.877 + 58517.803*T) * Math.PI/180;
  const sunM = (357.52911 + 35999.05029*T) * Math.PI/180;
  return normalize(L + (0.7758*Math.sin(M) + 0.0033*Math.sin(2*M)) * 180/Math.PI
    + 0.00541*Math.sin(2*sunM - 2*M) * 180/Math.PI);
}
function marsLon(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L = 355.433 + 19140.2993*T;
  const M = (319.529 + 19139.858*T) * Math.PI/180;
  const sunM = (357.52911 + 35999.05029*T) * Math.PI/180;
  return normalize(L + 10.6912*Math.sin(M) + 0.6228*Math.sin(2*M) + 0.0503*Math.sin(3*M)
    - 0.0187*Math.sin(sunM));
}
function jupiterLon(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L = 34.351519 + 3034.9056606*T;
  const M = (20.9 + 3034.906*T) * Math.PI/180;
  const satM = (317.1 + 1221.552*T) * Math.PI/180;
  return normalize(L + 5.5549*Math.sin(M) + 0.1683*Math.sin(2*M) - 0.4721*Math.sin(M - satM));
}
function saturnLon(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L = 50.077444 + 1222.1138488*T;
  const M = (317.1 + 1221.552*T) * Math.PI/180;
  const jupM = (20.9 + 3034.906*T) * Math.PI/180;
  return normalize(L + 6.3585*Math.sin(M) + 0.2204*Math.sin(2*M) - 0.6684*Math.sin(jupM - M));
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

// ─── Email templates ──────────────────────────────────────────────────────────
function emailBase(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    body{margin:0;padding:0;background:#0f0a1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    .wrap{max-width:560px;margin:0 auto;padding:40px 24px}
    .logo{text-align:center;margin-bottom:32px}
    .logo span{font-size:24px;font-weight:bold;background:linear-gradient(135deg,#c084fc,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px}
    h1{color:#fff;font-size:1.5rem;margin:0 0 12px}
    p{color:rgba(255,255,255,0.7);font-size:0.95rem;line-height:1.6;margin:0 0 16px}
    .btn{display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#c084fc,#f472b6);color:#fff;text-decoration:none;border-radius:50px;font-weight:bold;font-size:0.95rem;margin:8px 0}
    .footer{text-align:center;margin-top:32px;color:rgba(255,255,255,0.3);font-size:0.8rem}
    .divider{border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0}
    .phase-chip{display:inline-block;padding:4px 12px;border-radius:50px;font-size:0.8rem;font-weight:600;margin-bottom:16px}
    .highlight{background:rgba(192,132,252,0.1);border-left:3px solid #c084fc;padding:12px 16px;border-radius:0 12px 12px 0;margin:16px 0}
  </style></head><body><div class="wrap">
    <div class="logo"><span>🌙 ZodiacCycle</span></div>
    ${content}
    <div class="footer">
      <p>ZodiacCycle · <a href="https://zodiaccycle.app" style="color:#c084fc">zodiaccycle.app</a></p>
      <p>You're receiving this because you have notifications enabled.<br>
      <a href="https://zodiaccycle.app" style="color:#c084fc">Manage notification preferences</a></p>
    </div>
  </div></body></html>`;
}

function confirmEmail(confirmUrl: string): string {
  return emailBase(`<div class="card">
    <h1>✨ Confirm your email</h1>
    <p>Welcome to ZodiacCycle! Click the button below to confirm your email address and activate your account.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${confirmUrl}" class="btn">Confirm Email Address</a>
    </div>
    <p style="font-size:0.85rem;color:rgba(255,255,255,0.4)">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
  </div>`);
}

function resetEmail(resetUrl: string): string {
  return emailBase(`<div class="card">
    <h1>🔐 Reset your password</h1>
    <p>We received a request to reset your ZodiacCycle password. Click the button below to choose a new password.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <p style="font-size:0.85rem;color:rgba(255,255,255,0.4)">This link expires in 1 hour. If you didn't request a password reset, please ignore this email.</p>
  </div>`);
}

function periodReminderEmail(name: string, daysUntil: number, phase: string, sunSign: string): string {
  return emailBase(`<div class="card">
    <span class="phase-chip" style="background:rgba(244,63,94,0.2);color:#f43f5e">🔴 Period Reminder</span>
    <h1>Your period is coming in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}</h1>
    <p>Hi ${name || 'there'} 🌙</p>
    <p>Based on your cycle history, your next period is predicted to arrive in <strong style="color:#f43f5e">${daysUntil} day${daysUntil !== 1 ? 's' : ''}</strong>.</p>
    <div class="highlight">
      <p style="margin:0;font-size:0.9rem"><strong>Current phase:</strong> ${phase}<br>
      <strong>Your sun sign:</strong> ☀️ ${sunSign}</p>
    </div>
    <p>Now is a good time to prepare — stock up on comfort supplies, clear your schedule if possible, and be gentle with yourself.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="https://zodiaccycle.app" class="btn">Open ZodiacCycle</a>
    </div>
  </div>`);
}

function ovulationEmail(name: string, sunSign: string, moonSign: string): string {
  return emailBase(`<div class="card">
    <span class="phase-chip" style="background:rgba(16,185,129,0.2);color:#10b981">🌿 Fertile Window</span>
    <h1>You're entering your fertile window</h1>
    <p>Hi ${name || 'there'} 🌙</p>
    <p>Your fertile window is beginning. This is your peak energy phase — you may feel more social, confident, and magnetic.</p>
    <div class="highlight">
      <p style="margin:0;font-size:0.9rem">☀️ ${sunSign} Sun · 🌙 ${moonSign} Moon<br>
      <strong>Cosmic tip:</strong> Ovulation energy amplifies your natural ${sunSign} traits. Lean into your strengths today.</p>
    </div>
    <div style="text-align:center;margin:24px 0">
      <a href="https://zodiaccycle.app" class="btn">View Your Insights</a>
    </div>
  </div>`);
}

function weeklyDigestEmail(name: string, phase: string, cycleDay: number, sunSign: string, insight: string): string {
  return emailBase(`<div class="card">
    <span class="phase-chip" style="background:rgba(192,132,252,0.2);color:#c084fc">✨ Weekly Cosmic Digest</span>
    <h1>Your week ahead, ${name || 'Starlighter'}</h1>
    <div class="highlight">
      <p style="margin:0;font-size:0.9rem"><strong>Cycle day ${cycleDay}</strong> · ${phase} Phase · ☀️ ${sunSign}</p>
    </div>
    <p>${insight}</p>
    <hr class="divider">
    <p>Open the app for your full daily transit readings and personalised cycle predictions.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="https://zodiaccycle.app" class="btn">Open ZodiacCycle</a>
    </div>
  </div>`);
}

// ─── Send email via Resend ────────────────────────────────────────────────────
async function sendEmail(env: any, to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ZodiacCycle <noreply@zodiaccycle.app>',
        to: [to],
        subject,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Web Push helper ──────────────────────────────────────────────────────────
async function sendPushNotification(
  env: any,
  subscription: { endpoint: string; p256dh: string; auth: string },
  title: string,
  body: string,
  url: string = '/'
): Promise<boolean> {
  try {
    const payload = JSON.stringify({ title, body, url, icon: '/icons/icon-192x192.png' });
    // Use Supabase to call web-push since CF Workers don't have native web-push
    const res = await fetch(`${env.SUPABASE_URL}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscription, payload, vapidPrivateKey: env.VAPID_PRIVATE_KEY }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Main worker ──────────────────────────────────────────────────────────────
export default {
  // ── Cron scheduler ──────────────────────────────────────────────────────────
  async scheduled(event: any, env: any, ctx: any): Promise<void> {
    // Runs daily at 8am UTC — sends period reminders and ovulation alerts
    try {
      const supabaseUrl = env.SUPABASE_URL;
      const supabaseKey = env.SUPABASE_SERVICE_KEY;

      // Fetch all users with their cycle data and notification preferences
      const res = await fetch(
        `${supabaseUrl}/rest/v1/profiles?select=id,email,name,sun_sign,moon_sign,last_period_start,notif_period_reminder,notif_ovulation,notif_email,notif_push&has_paid=eq.true`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const users = await res.json() as any[];

      for (const user of users) {
        if (!user.last_period_start || !user.email) continue;

        const lastPeriod = new Date(user.last_period_start);
        const today = new Date();
        const daysSince = Math.floor((today.getTime() - lastPeriod.getTime()) / 86400000);
        const cycleLength = 28;
        const cycleDay = (daysSince % cycleLength) + 1;
        const daysUntilNext = cycleLength - (daysSince % cycleLength);

        // Period reminder — 3 days before
        if (user.notif_period_reminder && daysUntilNext === 3) {
          const phase = cycleDay <= 5 ? 'Menstrual' : cycleDay <= 13 ? 'Follicular' : cycleDay <= 16 ? 'Ovulation' : 'Luteal';

          if (user.notif_email && user.email) {
            await sendEmail(env, user.email, '🔴 Your period is coming in 3 days',
              periodReminderEmail(user.name, 3, phase, user.sun_sign || 'Unknown'));
          }

          if (user.notif_push) {
            // Fetch push subscriptions for this user
            const subRes = await fetch(
              `${supabaseUrl}/rest/v1/push_subscriptions?user_id=eq.${user.id}&select=endpoint,p256dh,auth`,
              { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
            );
            const subs = await subRes.json() as any[];
            for (const sub of subs) {
              await sendPushNotification(env, sub, '🔴 Period reminder', 'Your period is expected in 3 days', '/');
            }
          }
        }

        // Ovulation alert — fertile window start (day ~9-10)
        if (user.notif_ovulation && (cycleDay === 9 || cycleDay === 10)) {
          if (user.notif_email && user.email) {
            await sendEmail(env, user.email, '🌿 Your fertile window is starting',
              ovulationEmail(user.name, user.sun_sign || 'Unknown', user.moon_sign || 'Unknown'));
          }

          if (user.notif_push) {
            const subRes = await fetch(
              `${supabaseUrl}/rest/v1/push_subscriptions?user_id=eq.${user.id}&select=endpoint,p256dh,auth`,
              { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
            );
            const subs = await subRes.json() as any[];
            for (const sub of subs) {
              await sendPushNotification(env, sub, '🌿 Fertile window', 'Your fertile window is starting today', '/');
            }
          }
        }
      }
    } catch (err) {
      console.error('Cron error:', err);
    }
  },

  async fetch(request: Request, env: any): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);
    const path = url.pathname;

    // ── Birth chart ────────────────────────────────────────────────────────
    if (path === '/chart') {
      try {
        const datetime = url.searchParams.get('datetime');
        const coordinates = url.searchParams.get('coordinates');
        if (!datetime || !coordinates) {
          return new Response(JSON.stringify({ error: 'Missing params' }), {
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

    // ── Claude AI ──────────────────────────────────────────────────────────
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

    // ── Email: Send confirmation ───────────────────────────────────────────
    if (path === '/email/confirm' && request.method === 'POST') {
      try {
        const { email, confirmUrl } = await request.json() as any;
        if (!email || !confirmUrl) {
          return new Response(JSON.stringify({ error: 'Missing email or confirmUrl' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const ok = await sendEmail(env, email, '✨ Confirm your ZodiacCycle account', confirmEmail(confirmUrl));
        return new Response(JSON.stringify({ ok }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Email: Send password reset ─────────────────────────────────────────
    if (path === '/email/reset' && request.method === 'POST') {
      try {
        const { email, resetUrl } = await request.json() as any;
        if (!email || !resetUrl) {
          return new Response(JSON.stringify({ error: 'Missing params' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const ok = await sendEmail(env, email, '🔐 Reset your ZodiacCycle password', resetEmail(resetUrl));
        return new Response(JSON.stringify({ ok }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Email: Weekly digest ───────────────────────────────────────────────
    if (path === '/email/digest' && request.method === 'POST') {
      try {
        const { email, name, phase, cycleDay, sunSign, insight } = await request.json() as any;
        const ok = await sendEmail(env, email, '✨ Your weekly cosmic digest',
          weeklyDigestEmail(name, phase, cycleDay, sunSign, insight));
        return new Response(JSON.stringify({ ok }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Push: Save subscription ────────────────────────────────────────────
    if (path === '/push/subscribe' && request.method === 'POST') {
      try {
        const { userId, subscription } = await request.json() as any;
        if (!userId || !subscription) {
          return new Response(JSON.stringify({ error: 'Missing params' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/push_subscriptions`, {
          method: 'POST',
          headers: {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            user_id: userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          }),
        });
        return new Response(JSON.stringify({ ok: res.ok }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Push: Unsubscribe ──────────────────────────────────────────────────
    if (path === '/push/unsubscribe' && request.method === 'POST') {
      try {
        const { userId, endpoint } = await request.json() as any;
        await fetch(
          `${env.SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${userId}&endpoint=eq.${encodeURIComponent(endpoint)}`,
          {
            method: 'DELETE',
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            },
          }
        );
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Notification preferences ───────────────────────────────────────────
    if (path === '/notifications/preferences' && request.method === 'POST') {
      try {
        const { userId, preferences } = await request.json() as any;
        const res = await fetch(
          `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              notif_push: preferences.push,
              notif_email: preferences.email,
              notif_period_reminder: preferences.periodReminder,
              notif_ovulation: preferences.ovulationAlert,
              notif_phase_change: preferences.phaseChange,
              notif_daily_insights: preferences.dailyInsights,
              notif_frequency: preferences.frequency,
            }),
          }
        );
        return new Response(JSON.stringify({ ok: res.ok }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Stripe: Create Payment Intent ──────────────────────────────────────
    if (path === '/stripe/create-payment-intent' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const { priceId, email } = body;
        if (!env.STRIPE_SECRET_KEY) {
          return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (!priceId) {
          return new Response(JSON.stringify({ error: 'Missing priceId' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        let customerId: string | undefined;
        if (email) {
          const searchRes = await fetch(
            `https://api.stripe.com/v1/customers/search?query=email:'${encodeURIComponent(email)}'&limit=1`,
            { headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` } }
          );
          const searchData = await searchRes.json() as any;
          if (searchData.data?.length > 0) {
            customerId = searchData.data[0].id;
          } else {
            const createRes = await fetch('https://api.stripe.com/v1/customers', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({ email }).toString(),
            });
            const customer = await createRes.json() as any;
            if (!customer.error) customerId = customer.id;
          }
        }
        const priceRes = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
          headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` },
        });
        const price = await priceRes.json() as any;
        if (price.error) {
          return new Response(JSON.stringify({ error: `Invalid price: ${price.error.message}` }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (price.type === 'recurring') {
          const subParams = new URLSearchParams({
            'items[0][price]': priceId,
            'payment_behavior': 'default_incomplete',
            'payment_settings[save_default_payment_method]': 'on_subscription',
            'expand[0]': 'latest_invoice.payment_intent',
          });
          if (customerId) subParams.set('customer', customerId);
          const subRes = await fetch('https://api.stripe.com/v1/subscriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: subParams.toString(),
          });
          const subscription = await subRes.json() as any;
          if (!subscription.error) {
            const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;
            if (clientSecret) {
              return new Response(JSON.stringify({ clientSecret, subscriptionId: subscription.id, customerId }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          }
        }
        const piParams = new URLSearchParams({
          'amount': String(price.unit_amount || 100),
          'currency': price.currency || 'usd',
          'automatic_payment_methods[enabled]': 'true',
        });
        if (customerId) piParams.set('customer', customerId);
        const piRes = await fetch('https://api.stripe.com/v1/payment_intents', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: piParams.toString(),
        });
        const pi = await piRes.json() as any;
        if (pi.error) {
          return new Response(JSON.stringify({ error: `Payment failed: ${pi.error.message}` }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ clientSecret: pi.client_secret, customerId }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Stripe: Update customer ────────────────────────────────────────────
    if (path === '/stripe/update-customer' && request.method === 'POST') {
      try {
        const { customerId, email } = await request.json() as any;
        if (customerId && email) {
          await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ email }).toString(),
          });
        }
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Stripe: Debug ──────────────────────────────────────────────────────
    if (path === '/stripe/test') {
      const priceId = url.searchParams.get('priceId');
      if (!priceId) return new Response(JSON.stringify({ error: 'Add ?priceId=price_xxx' }), { headers: corsHeaders });
      const priceRes = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
        headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` },
      });
      const price = await priceRes.json();
      return new Response(JSON.stringify({ price }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ── Health ─────────────────────────────────────────────────────────────
    if (path === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        anthropic_key_set: !!env.ANTHROPIC_API_KEY,
        stripe_key_set: !!env.STRIPE_SECRET_KEY,
        resend_key_set: !!env.RESEND_API_KEY,
        vapid_key_set: !!env.VAPID_PRIVATE_KEY,
        supabase_url_set: !!env.SUPABASE_URL,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};