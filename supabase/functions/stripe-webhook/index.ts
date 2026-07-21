// Stripe webhook → unlocks Pro for the right Stride account.
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
// Then in Stripe: Developers → Webhooks → add endpoint
//   https://<project>.functions.supabase.co/stripe-webhook
//   events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
// Secrets (supabase secrets set ...):
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import Stripe from 'https://esm.sh/stripe@16?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const WH = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

async function setTier(userId: string, tier: string, status: string, periodEnd: number | null, store = 'stripe') {
  if (!userId) return;
  await admin.from('subscriptions').upsert({
    user_id: userId, tier, store, status,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  });
}

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, WH);
  } catch (err) {
    return new Response(`bad signature: ${(err as Error).message}`, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.client_reference_id || '';            // the Supabase uid we passed in the Payment Link
      const sub = s.subscription ? await stripe.subscriptions.retrieve(s.subscription as string) : null;
      await setTier(userId, 'pro', sub?.status || 'active', sub?.current_period_end || null);
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const userId = (sub.metadata?.user_id as string) || '';
      const active = sub.status === 'active' || sub.status === 'trialing';
      await setTier(userId, active ? 'pro' : 'free', sub.status, sub.current_period_end);
    }
  } catch (err) {
    return new Response(`handler error: ${(err as Error).message}`, { status: 500 });
  }
  return new Response('ok', { status: 200 });
});
