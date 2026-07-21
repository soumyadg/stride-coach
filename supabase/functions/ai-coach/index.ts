// Strivon — AI Running Coach (Pro). Calls Claude with the athlete's own context.
// Deploy with JWT verification OFF (verifies the Supabase JWT itself + checks Pro tier).
//   supabase functions deploy ai-coach --no-verify-jwt   (or Dashboard → Verify JWT OFF)
// Secrets:  ANTHROPIC_API_KEY   (optional: AI_COACH_MODEL)
//   (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY auto-provided)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const KEY = Deno.env.get('ANTHROPIC_API_KEY');
const MODEL = Deno.env.get('AI_COACH_MODEL') || 'claude-haiku-4-5-20251001';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

const SYSTEM = `You are Strivon's running coach — warm, motivating and concise.
Ground every answer in evidence-based training science: SafeRamp (raise weekly volume ≤10%), easy/hard polarisation, ACWR injury-risk (sweet spot 0.8–1.3), recovery matters as much as work.
Use the athlete's data (below) to personalise. Be specific and actionable.
Hard rules: replies under ~110 words. Never diagnose or give medical advice — for pain/injury, tell them to see a physio/doctor. Don't invent data you weren't given. Encourage without hype.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (!KEY) return json({ error: 'not_configured', detail: 'ANTHROPIC_API_KEY secret missing' }, 500);
  try {
    const jwt = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const { data: u } = await admin.auth.getUser(jwt);
    if (!u?.user) return json({ error: 'unauthorized' }, 401);

    // server-side Pro gate — can't be faked from the client
    const { data: sub } = await admin.from('subscriptions').select('tier,status').eq('user_id', u.user.id).maybeSingle();
    if (!sub || sub.tier !== 'pro') return json({ error: 'pro_required' }, 402);

    const body = await req.json().catch(() => ({}));
    const question = String(body.question || '').slice(0, 800);
    const context = String(body.context || '').slice(0, 2500);
    const history = Array.isArray(body.history) ? body.history.slice(-6).filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && m.content) : [];
    if (!question) return json({ error: 'empty' }, 400);

    const messages = [...history.map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 1500) })), { role: 'user', content: question }];
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 500, system: SYSTEM + '\n\n=== ATHLETE CONTEXT ===\n' + context, messages }),
    });
    if (!r.ok) return json({ error: 'ai_failed', status: r.status, detail: (await r.text()).slice(0, 300) }, 502);
    const d = await r.json();
    const reply = (d.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n').trim();
    return json({ reply: reply || '…' });
  } catch (e) {
    return json({ error: 'handler_error', detail: (e as Error).message }, 500);
  }
});
