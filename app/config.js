// Strivon — cloud config.
// Create a free Supabase project → Project Settings → API, then paste the two values below.
// Leave BOTH blank to run the app fully offline (no accounts / no sync) — everything still works.
window.STRIDE_CONFIG = {
  SUPABASE_URL: 'https://fvgtetbtppcxspvjbfie.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2Z3RldGJ0cHBjeHNwdmpiZmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MTA1NzksImV4cCI6MjEwMDE4NjU3OX0.7FK1Pds3EGxbyPNnQT7poGweU9lNd0TZ5z8OzlYOrB0',

  // Pro subscription (Stripe). Web only — the App Store requires Apple IAP instead. See PRO.md.
  // Create a recurring Payment Link in the Stripe dashboard (£6.99/mo) and paste its URL here.
  STRIPE_PAYMENT_LINK: 'https://buy.stripe.com/6oUfZigar2healY2sT6g800',  // Strivon Tempo £6.99/mo
  // Max Pro £10.99/mo — everything in Pro + a real human coach. Create a second recurring
  // Payment Link in Stripe and paste it here; leave blank to show a "coming soon" note.
  STRIPE_MAX_LINK: '',  // Strivon Summit £10.99/mo
  // Where "Talk to a live coach" requests are sent until the booking flow is built.
  COACH_EMAIL: 'coach@strivon.run',

  // Strava auto-import (Pro). Public Client ID from your Strava API app. See STRAVA.md.
  // Leave blank to hide the Strava feature. The Client SECRET goes in Supabase secrets, never here.
  STRAVA_CLIENT_ID: ''
};
