import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { subscription, payload, vapidPrivateKey } = await req.json();
    
    console.log('Sending push to endpoint:', subscription?.endpoint?.slice(0, 50));
    
    const webpush = await import('npm:web-push');
    webpush.default.setVapidDetails(
      'mailto:noreply@zodiaccycle.app',
      Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
      vapidPrivateKey
    );

    await webpush.default.sendNotification(subscription, payload);
    
    console.log('Push sent successfully');
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Push send error:', String(err));
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});