// Stride Coach — cloud config.
// Create a free Supabase project → Project Settings → API, then paste the two values below.
// Leave BOTH blank to run the app fully offline (no accounts / no sync) — everything still works.
window.STRIDE_CONFIG = {
  SUPABASE_URL: '',        // e.g. https://xxxxxxxx.supabase.co
  SUPABASE_ANON_KEY: ''    // the public "anon" key (safe to ship; RLS protects data)
};
