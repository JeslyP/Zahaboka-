// Sends a web push notification to the other person's devices.
// Called by the site after something is added. Access is checked with the shared passcode
// (the site has no user accounts), so JWT verification is turned off for this function.
// Deployed to the "jes-and-nica" Supabase project as the "notify" edge function.
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const clip = (value: unknown, max: number) => String(value ?? '').slice(0, max);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let input: Record<string, unknown>;
  try {
    input = await req.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }

  const hash = await sha256Hex(String(input.p ?? '').trim().toLowerCase());
  const { data: secret } = await db.from('app_secret').select('passcode_hash').eq('id', 1).single();
  if (!secret || secret.passcode_hash !== hash) return json({ error: 'invalid passcode' }, 401);

  const from = input.from === 'Jes' || input.from === 'Nica' ? input.from : null;
  if (!from) return json({ error: 'bad sender' }, 400);

  const { data: config } = await db.from('push_config').select('*').eq('id', 1).single();
  if (!config) return json({ error: 'push not configured' }, 500);
  webpush.setVapidDetails(config.subject, config.vapid_public, config.vapid_private);

  const { data: subs } = await db.from('push_subs').select('endpoint, sub').neq('person', from);
  const payload = JSON.stringify({
    title: clip(input.title, 100) || `💌 ${from}`,
    body: clip(input.body, 300),
    url: clip(input.url, 100) || './',
    tag: clip(input.tag, 50) || 'jn-update',
  });

  let sent = 0;
  const gone: string[] = [];
  await Promise.all((subs ?? []).map(async ({ endpoint, sub }) => {
    try {
      await webpush.sendNotification(sub, payload, { TTL: 60 * 60 * 24 });
      sent++;
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) gone.push(endpoint);
      else console.error('push failed', status, String(err));
    }
  }));
  // Phones that uninstalled the app or turned notifications off
  if (gone.length) await db.from('push_subs').delete().in('endpoint', gone);

  return json({ sent, removed: gone.length });
});
