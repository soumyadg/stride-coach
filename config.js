// Stride Coach — cloud config.
// Create a free Supabase project → Project Settings → API, then paste the two values below.
// Leave BOTH blank to run the app fully offline (no accounts / no sync) — everything still works.
window.STRIDE_CONFIG = {
  SUPABASE_URL: '',        // e.g. https://xxxxxxxx.supabase.co
  SUPABASE_ANON_KEY: '',   // the public "anon" key (safe to ship; RLS protects data)

  // Pro subscription (Stripe). Web only — the App Store requires Apple IAP instead. See PRO.md.
  // Create a recurring Payment Link in the Stripe dashboard (£6.99/mo) and paste its URL here.
  STRIPE_PAYMENT_LINK: 'https://buy.stripe.com/6oUfZigar2healY2sT6g800'  // Stride Pro £6.99/mo
};
