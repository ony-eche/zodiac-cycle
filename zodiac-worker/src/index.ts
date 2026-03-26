

async function sendPushWithOneSignal(env: any, userIds: string[], title: string, body: string, url: string = '/') {
  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${env.ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: env.ONESIGNAL_APP_ID,
        contents: { en: body },
        headings: { en: title },
        include_aliases: {
          external_id: userIds
        },
        target_channel: "web_push",
        web_url: `https://zodiaccycle.app${url}`,
        web_buttons: [
          { id: "open", text: "Open App", url: `https://zodiaccycle.app${url}` }
        ]
      })
    });
    
    const result = await response.json();
    if (response.ok) {
      console.log(`✅ OneSignal push sent to ${userIds.length} users`);
    } else {
      console.error('❌ OneSignal API error:', result);
    }
    return result;
  } catch (error) {
    console.error('❌ OneSignal push failed:', error);
    return null;
  }
}

// Update sendPush to use OneSignal
async function sendPush(env: any, subs: any[], title: string, body: string, url: string = '/') {
  // Get unique user IDs from subscriptions
  const userIds = [...new Set(subs.map(sub => sub.user_id))];
  
  if (userIds.length === 0) {
    console.log('No user IDs found');
    return;
  }
  
  console.log(`📤 Sending OneSignal push to ${userIds.length} users`);
  await sendPushWithOneSignal(env, userIds, title, body, url);
}

// Keep the deleteSubscription function (no changes needed)
async function deleteSubscription(env: any, endpoint: string) {
  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        },
      }
    );
    if (response.ok) {
      console.log(`   🗑️ Deleted expired subscription`);
    }
  } catch (err) {
    console.error('   Failed to delete subscription:', err);
  }
}

// Keep getUserSubs (no changes)
async function getUserSubs(env: any, userId: string): Promise<any[]> {
  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${userId}&select=endpoint,p256dh,auth,user_id`,
      { headers: { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}` } }
    );
    return res.ok ? await res.json() : [];
  } catch { return []; }
}


// ─── Astronomy helpers ────────────────────────────────────────────────────────
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

// ─── Transit helpers ──────────────────────────────────────────────────────────
const ASPECT_ORBS: Record<string, number> = {
  conjunction: 8, opposition: 8, trine: 6, square: 6, sextile: 4,
};

function getSignDegree(sign: string, degree: number): number {
  return SIGNS.indexOf(sign) * 30 + degree;
}

function getAspect(lon1: number, lon2: number): string | null {
  let diff = Math.abs(lon1 - lon2) % 360;
  if (diff > 180) diff = 360 - diff;
  const aspects = [
    { name: 'conjunction', angle: 0 }, { name: 'sextile', angle: 60 },
    { name: 'square', angle: 90 }, { name: 'trine', angle: 120 }, { name: 'opposition', angle: 180 },
  ];
  for (const asp of aspects) {
    if (Math.abs(diff - asp.angle) <= ASPECT_ORBS[asp.name]) return asp.name;
  }
  return null;
}

function getCurrentPlanets(): Record<string, { sign: string; degree: number }> {
  const now = new Date();
  const jd = julianDay(now.getUTCFullYear(), now.getUTCMonth()+1, now.getUTCDate(),
    now.getUTCHours() + now.getUTCMinutes()/60);
  return {
    sun:     { sign: toSign(sunLon(jd)),     degree: Math.floor(normalize(sunLon(jd)) % 30) },
    moon:    { sign: toSign(moonLon(jd)),    degree: Math.floor(normalize(moonLon(jd)) % 30) },
    mercury: { sign: toSign(mercuryLon(jd)), degree: Math.floor(normalize(mercuryLon(jd)) % 30) },
    venus:   { sign: toSign(venusLon(jd)),   degree: Math.floor(normalize(venusLon(jd)) % 30) },
    mars:    { sign: toSign(marsLon(jd)),    degree: Math.floor(normalize(marsLon(jd)) % 30) },
    jupiter: { sign: toSign(jupiterLon(jd)), degree: Math.floor(normalize(jupiterLon(jd)) % 30) },
    saturn:  { sign: toSign(saturnLon(jd)),  degree: Math.floor(normalize(saturnLon(jd)) % 30) },
  };
}

function countActiveTransits(user: any): number {
  if (!user.sun_sign) return 0;
  const current = getCurrentPlanets();
  const natal: Record<string, string> = {
    sun: user.sun_sign, moon: user.moon_sign,
    mercury: user.mercury_sign, venus: user.venus_sign, mars: user.mars_sign,
  };
  let count = 0;
  for (const tp of ['sun','moon','mercury','venus','mars','jupiter','saturn']) {
    if (!current[tp]) continue;
    const tLon = getSignDegree(current[tp].sign, current[tp].degree);
    for (const np of ['sun','moon','venus','mars','mercury']) {
      if (!natal[np]) continue;
      const nLon = getSignDegree(natal[np], 15);
      if (getAspect(tLon, nLon)) count++;
    }
  }
  return count;
}

function getCyclePhase(cycleDay: number): string {
  if (cycleDay <= 5) return 'Menstrual';
  if (cycleDay <= 13) return 'Follicular';
  if (cycleDay <= 16) return 'Ovulation';
  return 'Luteal';
}

function getPreviousCyclePhase(cycleDay: number): string {
  // What was the phase yesterday?
  return getCyclePhase(Math.max(1, cycleDay - 1));
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
    .highlight{background:rgba(192,132,252,0.1);border-left:3px solid #c084fc;padding:12px 16px;border-radius:0 12px 12px 0;margin:16px 0}
    .insight-card{background:rgba(192,132,252,0.08);border:1px solid rgba(192,132,252,0.2);border-radius:16px;padding:20px;margin:16px 0}
  </style></head><body><div class="wrap">
    <div class="logo"><span>🌙 ZodiacCycle</span></div>
    ${content}
    <div class="footer">
      <p>ZodiacCycle · <a href="https://zodiaccycle.app" style="color:#c084fc">zodiaccycle.app</a></p>
      <p>You're receiving this because you have notifications enabled.<br>
      <a href="https://zodiaccycle.app" style="color:#c084fc">Manage preferences</a></p>
    </div>
  </div></body></html>`;
}

function dailyInsightEmail(name: string, phase: string, cycleDay: number, sunSign: string, preview: string): string {
  return emailBase(`<div class="card">
    <span style="display:inline-block;padding:4px 12px;border-radius:50px;font-size:0.8rem;font-weight:600;background:rgba(192,132,252,0.2);color:#c084fc;margin-bottom:16px">✨ Daily Cosmic Insight</span>
    <h1>Your cosmic message for today</h1>
    <p>Hi ${name || 'Starlighter'} 🌙</p>
    <div class="highlight">
      <p style="margin:0;font-size:0.9rem"><strong>☀️ ${sunSign}</strong> · ${phase} Phase · Day ${cycleDay}</p>
    </div>
    <div class="insight-card">
      <p style="margin:0;font-style:italic;color:rgba(255,255,255,0.85)">"${preview}"</p>
    </div>
    <p>Open ZodiacCycle for your full daily reading.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="https://zodiaccycle.app" class="btn">Read Full Insight ✨</a>
    </div>
  </div>`);
}

function phaseChangeEmail(name: string, newPhase: string, sunSign: string, tip: string): string {
  const phaseEmojis: Record<string, string> = {
    Menstrual: '🔴', Follicular: '🌸', Ovulation: '⭐', Luteal: '🌙',
  };
  const emoji = phaseEmojis[newPhase] || '✨';
  return emailBase(`<div class="card">
    <span style="display:inline-block;padding:4px 12px;border-radius:50px;font-size:0.8rem;font-weight:600;background:rgba(192,132,252,0.2);color:#c084fc;margin-bottom:16px">${emoji} Phase Change</span>
    <h1>You've entered your ${newPhase} Phase</h1>
    <p>Hi ${name || 'Starlighter'} 🌙</p>
    <p>Your cycle has shifted into a new phase today. Here's what to expect:</p>
    <div class="highlight">
      <p style="margin:0;font-size:0.9rem">💡 ${tip}</p>
    </div>
    <p>Open ZodiacCycle to see how this phase interacts with your ☀️ ${sunSign} energy.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="https://zodiaccycle.app" class="btn">View Your Cycle ✨</a>
    </div>
  </div>`);
}

function periodReminderEmail(name: string, daysUntil: number, phase: string, sunSign: string): string {
  return emailBase(`<div class="card">
    <span style="display:inline-block;padding:4px 12px;border-radius:50px;font-size:0.8rem;font-weight:600;background:rgba(244,63,94,0.2);color:#f43f5e;margin-bottom:16px">🔴 Period Reminder</span>
    <h1>Your period is coming in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}</h1>
    <p>Hi ${name || 'Starlighter'} 🌙</p>
    <p>Based on your cycle history, your next period is predicted to arrive in <strong style="color:#f43f5e">${daysUntil} day${daysUntil !== 1 ? 's' : ''}</strong>.</p>
    <div class="highlight">
      <p style="margin:0;font-size:0.9rem"><strong>Current phase:</strong> ${phase} · ☀️ ${sunSign}</p>
    </div>
    <p>Now is a good time to prepare — stock up on comfort supplies and be gentle with yourself.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="https://zodiaccycle.app" class="btn">Open ZodiacCycle</a>
    </div>
  </div>`);
}

function ovulationEmail(name: string, sunSign: string, moonSign: string): string {
  return emailBase(`<div class="card">
    <span style="display:inline-block;padding:4px 12px;border-radius:50px;font-size:0.8rem;font-weight:600;background:rgba(16,185,129,0.2);color:#10b981;margin-bottom:16px">🌿 Fertile Window</span>
    <h1>You're entering your fertile window</h1>
    <p>Hi ${name || 'Starlighter'} 🌙</p>
    <p>Your fertile window is beginning. This is your peak energy phase.</p>
    <div class="highlight">
      <p style="margin:0;font-size:0.9rem">☀️ ${sunSign} Sun · 🌙 ${moonSign} Moon</p>
    </div>
    <div style="text-align:center;margin:24px 0">
      <a href="https://zodiaccycle.app" class="btn">View Your Insights</a>
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
  } catch { return false; }
} 

// ─── Generate short AI insight preview ───────────────────────────────────────
async function generateInsightPreview(env: any, user: any, cycleDay: number, phase: string): Promise<string> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Write a single warm, poetic sentence (max 20 words) as a daily cosmic insight for someone with Sun in ${user.sun_sign || 'unknown'}, Moon in ${user.moon_sign || 'unknown'}, currently in their ${phase} phase on cycle day ${cycleDay}. No hashtags, no emojis, just a beautiful sentence.`,
        }],
        system: 'You are ZodiacCycle, a warm cosmic wellness companion. Write brief, personal, poetic insights.',
      }),
    });
    const data = await res.json() as any;
    return data.content?.[0]?.text?.trim() || `Your ${phase} energy is alive today — open ZodiacCycle for your full reading.`;
  } catch {
    return `Your ${phase} energy is alive today — open ZodiacCycle for your full reading.`;
  }
}
async function runMiddayCron(env: any): Promise<void> {
  console.log('=== Midday cron starting ===');
  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/profiles?select=id,email,name,sun_sign,moon_sign,last_period_start,notif_push,notif_email,has_paid`,
      { headers: { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}` } }
    );
    if (!res.ok) {
      console.error('Failed to fetch users:', res.status);
      return;
    }
    const users = await res.json() as any[];
    console.log(`Found ${users.length} users for midday cron`);

    for (const user of users) {
      console.log(`Processing user ${user.id}: notif_push=${user.notif_push}, email=${user.email}`);
      
      if (!user.email) {
        console.log(`  Skipping - no email`);
        continue;
      }
      
      const cycleDay = getCycleDayForUser(user);
      const phase = getCyclePhase(cycleDay);
      const { title, body } = getMidnayNotification(user, cycleDay, phase);
      
      console.log(`  Generated notification: "${title}"`);

      if (user.notif_push) {
        const subs = await getUserSubs(env, user.id);
        console.log(`  Found ${subs.length} push subscriptions`);
        if (subs.length > 0) {
          await sendPush(env, subs, title, body, '/');
          console.log(`  ✅ Push sent to ${user.id}`);
        } else {
          console.log(`  ⚠️ No push subscriptions found`);
        }
      } else {
        console.log(`  ⏭️ Push notifications disabled for user`);
      }
    }
    console.log('Midday cron completed');
  } catch (err) {
    console.error('Midday cron error:', err);
  }
}

async function runEveningCron(env: any): Promise<void> {
  console.log('Evening cron starting');
  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/profiles?select=id,email,name,sun_sign,moon_sign,last_period_start,notif_push,has_paid`,
      { headers: { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}` } }
    );
    if (!res.ok) return;
    const users = await res.json() as any[];

    for (const user of users) {
      if (!user.email) continue;
      const cycleDay = getCycleDayForUser(user);
      const phase = getCyclePhase(cycleDay);
      const { title, body } = getEveningNotification(user, phase);

      if (user.notif_push) {
        const subs = await getUserSubs(env, user.id);
        if (subs.length > 0) await sendPush(env, subs, title, body, '/');
      }
    }
    console.log('Evening cron done');
  } catch (err) { console.error('Evening cron error:', err); }
}

async function runNightCron(env: any): Promise<void> {
  console.log('Night cron starting');
  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/profiles?select=id,email,name,sun_sign,moon_sign,last_period_start,notif_push,has_paid`,
      { headers: { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}` } }
    );
    if (!res.ok) return;
    const users = await res.json() as any[];

    for (const user of users) {
      if (!user.email) continue;
      const cycleDay = getCycleDayForUser(user);
      const phase = getCyclePhase(cycleDay);
      const { title, body } = getNightNotification(user, phase);

      if (user.notif_push) {
        const subs = await getUserSubs(env, user.id);
        if (subs.length > 0) await sendPush(env, subs, title, body, '/');
      }
    }
    console.log('Night cron done');
  } catch (err) { console.error('Night cron error:', err); }
}

async function runWeeklyCron(env: any): Promise<void> {
  console.log('Weekly cron starting');
  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/profiles?select=id,email,name,sun_sign,moon_sign,last_period_start,notif_push,notif_email,has_paid`,
      { headers: { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}` } }
    );
    if (!res.ok) return;
    const users = await res.json() as any[];

    for (const user of users) {
      if (!user.email) continue;
      const cycleDay = getCycleDayForUser(user);
      const phase = getCyclePhase(cycleDay);
      const daysUntil = 28 - cycleDay;
      const { title, body } = getWeeklySummary(user, cycleDay, phase, daysUntil);

      if (user.notif_push) {
        const subs = await getUserSubs(env, user.id);
        if (subs.length > 0) await sendPush(env, subs, title, body, '/');
      }
      if (user.notif_email) {
        const html = emailBase(`<div class="card">
          <h1>${title}</h1>
          <p>${body}</p>
          <div style="text-align:center;margin:24px 0">
            <a href="https://zodiaccycle.app" class="btn">Open ZodiacCycle ✨</a>
          </div>
        </div>`);
        await sendEmail(env, user.email, title, html);
      }
    }
    console.log('Weekly cron done');
  } catch (err) { console.error('Weekly cron error:', err); }
}

// ─── Phase tips ───────────────────────────────────────────────────────────────
const PHASE_TIPS: Record<string, string> = {
  Menstrual: 'Rest is productive. Honour your body with warmth, gentle movement, and iron-rich foods.',
  Follicular: 'Estrogen is rising! Great time to start new projects, socialise, and try new workouts.',
  Ovulation: 'Peak fertility and confidence. Ideal for big presentations and important conversations.',
  Luteal: 'Progesterone peaks then drops. Focus on completing tasks and winding down.',
};
// ─── Smart notification templates ────────────────────────────────────────────

const MOON_MOODS: Record<string, string> = {
  Aries: 'bold and action-oriented', Taurus: 'grounded and sensory', Gemini: 'curious and chatty',
  Cancer: 'nurturing and intuitive', Leo: 'expressive and warm', Virgo: 'analytical and detail-focused',
  Libra: 'balanced and social', Scorpio: 'intense and perceptive', Sagittarius: 'adventurous and optimistic',
  Capricorn: 'focused and ambitious', Aquarius: 'inventive and detached', Pisces: 'dreamy and empathetic',
};

const PHASE_MIDDAY: Record<string, string> = {
  Menstrual: 'Rest over productivity today — your body is doing deep work',
  Follicular: 'Great time to brainstorm or start something new this afternoon',
  Ovulation: 'You\'re magnetic right now — perfect for calls, meetings, connections',
  Luteal: 'Tie up loose ends this afternoon before your energy winds down',
};

const PHASE_NIGHT: Record<string, string> = {
  Menstrual: 'What did your body ask for today? Log it before you rest 🌙',
  Follicular: 'You\'re building momentum — what felt good today?',
  Ovulation: 'Peak days are precious — capture how you felt today',
  Luteal: 'How did your energy hold up? Your patterns matter 🌙',
};

const SUN_EVENING: Record<string, string> = {
  Aries: 'Mars is always moving — check your evening transits',
  Taurus: 'Venus rules your chart — see how tonight\'s sky touches you',
  Gemini: 'Mercury\'s position shifts your communication energy tonight',
  Cancer: 'The Moon moves fast — check how it aspects your chart right now',
  Leo: 'The Sun\'s transits hit differently for you — open your chart',
  Virgo: 'Mercury is active in your chart this evening',
  Libra: 'Venus is aspecting something in your chart right now',
  Scorpio: 'Pluto\'s slow burn is always active — check tonight\'s transits',
  Sagittarius: 'Jupiter is expanding something in your chart tonight',
  Capricorn: 'Saturn is structuring tonight\'s energy for you specifically',
  Aquarius: 'Uranus is stirring something unexpected in your chart',
  Pisces: 'Neptune softens tonight\'s transits in a way only you feel',
};

const WEEKLY_PHASE_SUMMARY: Record<string, string> = {
  Menstrual: 'You\'re in your rest phase this week — honour the slow',
  Follicular: 'Fresh energy is building this week — plant seeds now',
  Ovulation: 'This is your peak week — show up fully',
  Luteal: 'Wind-down week — complete, reflect, release',
};

function getMidnayNotification(user: any, cycleDay: number, phase: string): { title: string; body: string } {
  const name = user.name ? `, ${user.name}` : '';
  const moonMood = MOON_MOODS[user.moon_sign] || 'intuitive';
  const phaseMsg = PHASE_MIDDAY[phase] || 'Check in with your body this afternoon';
  return {
    title: `🌿 Midday check-in${name}`,
    body: `Your ${user.moon_sign || ''} Moon is feeling ${moonMood} today. ${phaseMsg}.`,
  };
}

function getEveningNotification(user: any, phase: string): { title: string; body: string } {
  const sunMsg = SUN_EVENING[user.sun_sign] || 'The planets are active in your chart tonight';
  return {
    title: '⭐ Your evening transits are active',
    body: `${sunMsg}. Day ${user.cycleDay || ''} of your ${phase} phase.`,
  };
}

function getNightNotification(user: any, phase: string): { title: string; body: string } {
  const name = user.name ? `${user.name}, ` : '';
  const phaseMsg = PHASE_NIGHT[phase] || 'Log today before you sleep 🌙';
  return {
    title: `🔮 ${name}log today before you sleep`,
    body: phaseMsg,
  };
}

function getWeeklySummary(user: any, cycleDay: number, phase: string, daysUntilPeriod: number): { title: string; body: string } {
  const name = user.name ? `, ${user.name}` : '';
  const phaseMsg = WEEKLY_PHASE_SUMMARY[phase] || 'A new week with your cycle';
  return {
    title: `🌙 Your week ahead${name}`,
    body: `${phaseMsg}. ${daysUntilPeriod > 0 ? `Period in ${daysUntilPeriod} days.` : 'Period due soon.'} ☀️ ${user.sun_sign || ''}`,
  };
}

function getCycleDayForUser(user: any): number {
  if (!user.last_period_start) return 14;
  const daysSince = Math.floor(
    (new Date().getTime() - new Date(user.last_period_start).getTime()) / 86400000
  );
  return Math.max(1, (daysSince % 28) + 1);
}
// ─── Main cron logic ─────────────────────────────────────────────────────────
async function runDailyCron(env: any): Promise<void> {
  console.log('Cron starting:', new Date().toISOString());
  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/profiles?select=id,email,name,sun_sign,moon_sign,last_period_start,notif_period_reminder,notif_ovulation,notif_phase_change,notif_daily_insights,notif_email,notif_push,has_paid`,
      { headers: { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}` } }
    );
    if (!res.ok) { console.error('Failed to fetch users'); return; }
    const users = await res.json() as any[];
    console.log(`Processing ${users.length} users`);

    for (const user of users) {
      if (!user.email) continue;
      
      console.log(`\n📱 Processing user: ${user.email}`);
      console.log(`   - has_paid: ${user.has_paid}`);
      console.log(`   - notif_push: ${user.notif_push}`);
      console.log(`   - last_period_start: ${user.last_period_start}`);
      
      const isPremium = user.has_paid === true;
      const hasPeriodData = !!user.last_period_start;
      
      let cycleDay = 14;
      let daysUntilNext = 14;
      let currentPhase = 'Luteal';
      let previousPhase = 'Luteal';

      if (hasPeriodData) {
        const lastPeriod = new Date(user.last_period_start);
        const today = new Date();
        const daysSince = Math.floor((today.getTime() - lastPeriod.getTime()) / 86400000);
        const cycleLength = 28;
        cycleDay = Math.max(1, (daysSince % cycleLength) + 1);
        daysUntilNext = cycleLength - (daysSince % cycleLength);
        currentPhase = getCyclePhase(cycleDay);
        previousPhase = getPreviousCyclePhase(cycleDay);
        
        console.log(`   - daysSince: ${daysSince}`);
        console.log(`   - cycleDay: ${cycleDay}`);
        console.log(`   - daysUntilNext: ${daysUntilNext}`);
        console.log(`   - currentPhase: ${currentPhase}`);
        console.log(`   - previousPhase: ${previousPhase}`);
      } else {
        console.log(`   - ⚠️ No period data!`);
      }

      console.log(`\n   📋 Checking notifications:`);
      
      // Period reminder check
      if (user.notif_period_reminder && hasPeriodData && daysUntilNext === 3) {
        console.log(`   ✅ Would send PERIOD REMINDER`);
        
        if (user.notif_email) {
          await sendEmail(env, user.email, '🔴 Your period is coming in 3 days',
            periodReminderEmail(user.name, 3, currentPhase, user.sun_sign || 'Unknown'));
        }
        if (user.notif_push) {
          const subs = await getUserSubs(env, user.id);
          if (subs.length > 0) {
            await sendPush(env, subs, '🔴 Period reminder', 'Your period is expected in 3 days', '/');
          }
        }
      } else if (user.notif_period_reminder && hasPeriodData) {
        console.log(`   ❌ Period reminder: daysUntilNext=${daysUntilNext} (need 3)`);
      }
      
      // Ovulation check
      if (user.notif_ovulation && hasPeriodData && (cycleDay === 9 || cycleDay === 10)) {
        console.log(`   ✅ Would send OVULATION ALERT`);
        
        if (user.notif_email) {
          await sendEmail(env, user.email, '🌿 Your fertile window is starting',
            ovulationEmail(user.name, user.sun_sign || 'Unknown', user.moon_sign || 'Unknown'));
        }
        if (user.notif_push) {
          const subs = await getUserSubs(env, user.id);
          if (subs.length > 0) {
            await sendPush(env, subs, '🌿 Fertile window', 'Your fertile window is starting today', '/');
          }
        }
      } else if (user.notif_ovulation && hasPeriodData) {
        console.log(`   ❌ Ovulation: cycleDay=${cycleDay} (need 9 or 10)`);
      }
      
      // Phase change check
      if (isPremium && user.notif_phase_change && hasPeriodData && currentPhase !== previousPhase) {
        console.log(`   ✅ Would send PHASE CHANGE (${previousPhase} → ${currentPhase})`);
        
        const tip = PHASE_TIPS[currentPhase] || '';
        if (user.notif_email) {
          await sendEmail(env, user.email, `✨ You've entered your ${currentPhase} Phase`,
            phaseChangeEmail(user.name, currentPhase, user.sun_sign || 'Unknown', tip));
        }
        if (user.notif_push) {
          const subs = await getUserSubs(env, user.id);
          if (subs.length > 0) {
            const phaseEmojis: Record<string, string> = { Menstrual: '🔴', Follicular: '🌸', Ovulation: '⭐', Luteal: '🌙' };
            await sendPush(env, subs, `${phaseEmojis[currentPhase] || '✨'} New phase: ${currentPhase}`, tip.slice(0, 80), '/');
          }
        }
      } else if (isPremium && user.notif_phase_change && hasPeriodData) {
        console.log(`   ❌ Phase change: phases are same (${currentPhase})`);
      } else if (!isPremium) {
        console.log(`   ❌ Phase change: requires premium (has_paid=false)`);
      }
      
      // Daily insight (premium only)
      if (isPremium && user.notif_daily_insights) {
        console.log(`   🔮 Generating daily insight for ${user.email}`);
        
        try {
          const preview = await generateInsightPreview(env, user, cycleDay, currentPhase);
          console.log(`   📝 Insight generated: "${preview.substring(0, 50)}..."`);
          
          if (user.notif_email) {
            console.log(`   📧 Attempting to send email to ${user.email}`);
            await sendEmail(env, user.email,
              `✨ Your cosmic insight for today, ${user.name || 'Starlighter'}`,
              dailyInsightEmail(user.name, currentPhase, cycleDay, user.sun_sign || 'Unknown', preview));
            console.log(`   ✅ Email sent`);
          }
          
          if (user.notif_push) {
            console.log(`   📱 Attempting to send push notification`);
            const subs = await getUserSubs(env, user.id);
            console.log(`   📱 Found ${subs.length} push subscriptions`);
            
            if (subs.length > 0) {
              await sendPush(env, subs, '🔮 Your daily cosmic insight', preview.slice(0, 100), '/');
              console.log(`   ✅ Push notification sent!`);
            } else {
              console.log(`   ⚠️ No push subscriptions found for user ${user.id}`);
            }
          }
        } catch (error) {
          console.error(`   ❌ Error sending daily insight:`, error);
        }
      } else if (isPremium) {
        console.log(`   ❌ Daily insight: notif_daily_insights is false`);
      } else {
        console.log(`   ❌ Daily insight: requires premium (has_paid=false)`);
      }
    } // ← This closes the for loop
    
    console.log('Cron completed successfully');
  } catch (err) {
    console.error('Cron error:', err);
  }
} // ← This closes the runDailyCron function

// ─── Main worker ──────────────────────────────────────────────────────────────
export default {
  async scheduled(event: any, env: any, _ctx: any): Promise<void> {
    const cron = event.cron;
    console.log('Cron triggered:', cron);

    if (cron === '0 8 * * *') await runDailyCron(env);
    if (cron === '0 12 * * *') await runMiddayCron(env);
    if (cron === '0 18 * * *') await runEveningCron(env);
    if (cron === '0 21 * * *') await runNightCron(env);
    if (cron === '0 8 * * 1') await runWeeklyCron(env);
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
        const [lat, lng] = coordinates.split(',').map(Number);
        const chart = calcChart(
          dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate(),
          dt.getUTCHours() + dt.getUTCMinutes() / 60, lat, lng
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

    // ── Email: Confirmation ────────────────────────────────────────────────
    if (path === '/email/confirm' && request.method === 'POST') {
      try {
        const { email, confirmUrl } = await request.json() as any;
        const html = emailBase(`<div class="card">
          <h1>✨ Confirm your email</h1>
          <p>Welcome to ZodiacCycle! Click below to confirm your email and activate your account.</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${confirmUrl}" class="btn">Confirm Email Address</a>
          </div>
          <p style="font-size:0.85rem;color:rgba(255,255,255,0.4)">Link expires in 24 hours.</p>
        </div>`);
        const ok = await sendEmail(env, email, '✨ Confirm your ZodiacCycle account', html);
        return new Response(JSON.stringify({ ok }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Email: Password reset ──────────────────────────────────────────────
    if (path === '/email/reset' && request.method === 'POST') {
      try {
        const { email, resetUrl } = await request.json() as any;
        const html = emailBase(`<div class="card">
          <h1>🔐 Reset your password</h1>
          <p>Click below to choose a new ZodiacCycle password.</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </div>
          <p style="font-size:0.85rem;color:rgba(255,255,255,0.4)">Link expires in 1 hour.</p>
        </div>`);
        const ok = await sendEmail(env, email, '🔐 Reset your ZodiacCycle password', html);
        return new Response(JSON.stringify({ ok }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

if (path === '/push/subscribe' && request.method === 'POST') {
  try {
    const { userId, subscription } = await request.json() as any;
    
    // First save to Supabase (your existing code)
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
    
    // Also register with OneSignal using their SDK
    // This is done on the frontend, but we can also do it here
    // For now, we'll rely on frontend OneSignal registration
    
    return new Response(JSON.stringify({ ok: res.ok }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
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
            headers: { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}` },
          }
        );
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
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
        });
        return new Response(JSON.stringify({ ok: res.ok }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (path === '/cron/midday' && request.method === 'POST') {
      try {
        await runMiddayCron(env);
        return new Response(JSON.stringify({ ok: true, message: 'Midday cron ran' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (path === '/cron/evening' && request.method === 'POST') {
      try {
        await runEveningCron(env);
        return new Response(JSON.stringify({ ok: true, message: 'Evening cron ran' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (path === '/cron/night' && request.method === 'POST') {
      try {
        await runNightCron(env);
        return new Response(JSON.stringify({ ok: true, message: 'Night cron ran' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (path === '/cron/weekly' && request.method === 'POST') {
      try {
        await runWeeklyCron(env);
        return new Response(JSON.stringify({ ok: true, message: 'Weekly cron ran' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Test cron manually ─────────────────────────────────────────────────
    if (path === '/cron/test' && request.method === 'POST') {
      try {
        await runDailyCron(env);
        return new Response(JSON.stringify({ ok: true, message: 'Cron ran successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Stripe: Create payment intent ──────────────────────────────────────
    if (path === '/stripe/create-payment-intent' && request.method === 'POST') {
      try {
        const { priceId, email } = await request.json() as any;
        if (!priceId) return new Response(JSON.stringify({ error: 'Missing priceId' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

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
        if (price.error) return new Response(JSON.stringify({ error: `Invalid price: ${price.error.message}` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

        const piParams = new URLSearchParams({
          'amount': String(price.unit_amount || 100),
          'currency': price.currency || 'eur',
          'automatic_payment_methods[enabled]': 'true',
        });
        if (customerId) piParams.set('customer', customerId);

        const piRes = await fetch('https://api.stripe.com/v1/payment_intents', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: piParams.toString(),
        });
        const pi = await piRes.json() as any;
        if (pi.error) return new Response(JSON.stringify({ error: pi.error.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

        return new Response(JSON.stringify({ clientSecret: pi.client_secret, customerId }), {
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
if (path === '/test-push' && request.method === 'POST') {
  try {
    // First, get the raw text to debug
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);
    
    // If empty body, return error
    if (!rawBody) {
      return new Response(JSON.stringify({ error: 'Empty request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Try to parse JSON
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON', 
        received: rawBody,
        suggestion: 'Use format: {"userId":"...", "title":"...", "body":"..."}'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const { userId, title, body: messageBody } = body;
    console.log(`Test push requested for user: ${userId}`);
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const subs = await getUserSubs(env, userId);
    console.log(`Found ${subs.length} push subscriptions`);
    
    if (subs.length === 0) {
      return new Response(JSON.stringify({ error: 'No push subscriptions found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    await sendPush(env, subs, title || 'Test Notification', messageBody || 'This is a test push!', '/');
    
    return new Response(JSON.stringify({ ok: true, message: `Push sent to ${subs.length} devices` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Test push error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

}
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};