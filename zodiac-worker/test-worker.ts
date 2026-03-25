export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    
    // Simple test endpoint
    if (url.pathname === '/test') {
      return new Response(JSON.stringify({ 
        message: 'Worker is working!',
        vapid_private_exists: !!env.VAPID_PRIVATE_KEY,
        time: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Test push endpoint
    if (url.pathname === '/push-test' && request.method === 'POST') {
      try {
        const { userId } = await request.json();
        
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
        
        const subs = await subsRes.json();
        
        // Send a simple notification using fetch (no web-push library)
        const results = [];
        for (const sub of subs) {
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
                icon: '/icons/icon-192x192.png'
              })
            });
            
            results.push({
              endpoint: sub.endpoint.substring(0, 50) + '...',
              status: response.status,
              ok: response.ok
            });
          } catch (err: any) {
            results.push({
              endpoint: sub.endpoint.substring(0, 50) + '...',
              error: err.message
            });
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
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new Response('Not found', { status: 404 });
  }
};