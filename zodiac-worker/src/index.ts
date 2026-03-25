// Simple test worker - copy this entire content to src/index.ts

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    
    // Simple test endpoint to check if worker is running
    if (url.pathname === '/test') {
      return new Response(JSON.stringify({ 
        message: 'Worker is working!',
        vapid_private_exists: !!env.VAPID_PRIVATE_KEY,
        supabase_url_exists: !!env.SUPABASE_URL,
        supabase_service_key_exists: !!env.SUPABASE_SERVICE_KEY,
        time: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Test push endpoint
    if (url.pathname === '/push-test' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const userId = body.userId;
        
        console.log(`Testing push for user: ${userId}`);
        
        // Get subscriptions from Supabase
        const subsRes = await fetch(
          `${env.SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${userId}&select=endpoint,p256dh,auth`,
          {
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
            }
          }
        );
        
        if (!subsRes.ok) {
          console.log(`Failed to fetch subscriptions: ${subsRes.status}`);
          return new Response(JSON.stringify({ 
            error: 'Failed to fetch subscriptions',
            status: subsRes.status 
          }), { status: 500 });
        }
        
        const subs = await subsRes.json() as any[];
        console.log(`Found ${subs.length} subscriptions`);
        
        // Send notifications
        const results = [];
        for (let i = 0; i < subs.length; i++) {
          const sub = subs[i];
          const endpointPreview = sub.endpoint.substring(0, 60) + '...';
          console.log(`Sending to ${endpointPreview}`);
          
          // Determine device type
          let deviceType = 'Other';
          if (sub.endpoint.includes('apple.com')) deviceType = '🍎 Apple';
          else if (sub.endpoint.includes('windows.com')) deviceType = '🪟 Windows';
          else if (sub.endpoint.includes('google.com') || sub.endpoint.includes('fcm')) deviceType = '🤖 Android';
          
          try {
            const response = await fetch(sub.endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'TTL': '86400'
              },
              body: JSON.stringify({
                title: 'Test Notification',
                body: 'This is a test from your worker!',
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png'
              })
            });
            
            const result = {
              endpoint: endpointPreview,
              status: response.status,
              ok: response.ok,
              deviceType: deviceType
            };
            
            results.push(result);
            console.log(`  ✅ Result: ${response.status} (${deviceType})`);
            
          } catch (err: any) {
            results.push({
              endpoint: endpointPreview,
              error: err.message,
              deviceType: deviceType
            });
            console.log(`  ❌ Error: ${err.message}`);
          }
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          subscriptions_found: subs.length,
          results 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new Response('Not found - try /test or /push-test', { status: 404 });
  }
};