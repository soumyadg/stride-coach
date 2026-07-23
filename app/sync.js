/* Strivon — accounts + cloud sync (offline-first).
   No config → this whole module is inert and the app runs exactly as before.
   Emits a 'stride-synced' DOM event after any sync so the UI can re-render. */
window.StrideSync = (function () {
  const cfg = window.STRIDE_CONFIG || {};
  const OUTBOX = 'stride_outbox', LAST = 'stride_lastsync';
  let sb = null, user = null, accessToken = null, syncing = false, pushTimer = null, onState = null;

  const configured = () => !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2));
  const getS = () => { try { return JSON.parse(localStorage.getItem('stride') || 'null'); } catch (e) { return null; } };
  const saveS = s => localStorage.setItem('stride', JSON.stringify(s));
  const stamp = () => localStorage.setItem(LAST, new Date().toISOString());
  const emit = () => document.dispatchEvent(new CustomEvent('stride-synced'));

  const N = {
    enabled: false,
    state: () => ({ enabled: N.enabled, configured: configured(), signedIn: !!user, userId: user ? user.id : null, email: user ? user.email : null, lastSync: localStorage.getItem(LAST) }),

    async init(cb) {
      onState = cb;
      if (!configured()) { N.enabled = false; cb && cb(N.state()); return; }
      N.enabled = true;
      sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
      sb.auth.onAuthStateChange((_e, session) => { user = session ? session.user : null; accessToken = session ? session.access_token : null; cb && cb(N.state()); if (user) firstSync(); });
      try { const { data } = await sb.auth.getSession(); user = data.session ? data.session.user : null; accessToken = data.session ? data.session.access_token : null; } catch (e) {}
      cb && cb(N.state());
      if (user) firstSync();
    },

    async signUp(email, pw) { const { error } = await sb.auth.signUp({ email, password: pw }); if (error) throw error; },
    async signIn(email, pw) { const { error } = await sb.auth.signInWithPassword({ email, password: pw }); if (error) throw error; },
    async signOut() { try { await sb.auth.signOut(); } catch (e) {} user = null; accessToken = null; onState && onState(N.state()); },

    // --- integrations (Strava etc.) ---
    token: () => accessToken,                                   // current Supabase JWT (for edge-function calls)
    fnBase: () => (cfg.SUPABASE_URL || '').replace(/\/$/, '') + '/functions/v1',
    async stravaStatus() {
      if (!user || !sb) return { connected: false };
      const { data } = await sb.from('integrations').select('athlete_id, updated_at').eq('user_id', user.id).eq('provider', 'strava').maybeSingle();
      return { connected: !!data, athleteId: data ? data.athlete_id : null, updated: data ? data.updated_at : null };
    },

    // called on every local save (store.set) — marks data dirty and debounces a push
    markDirty() {
      if (!configured()) return;
      localStorage.setItem(OUTBOX, '1');
      if (!user) return;
      clearTimeout(pushTimer); pushTimer = setTimeout(() => push().catch(() => {}), 1500);
    },

    async syncNow() { if (!user) return; await pull(); await push(); emit(); }
  };

  // ---- two-profile blob sync (Run + Walk) ----
  const MODES = ['run', 'walk'];
  const PK = m => 'stride_p_' + m;
  const readProf = m => { try { return JSON.parse(localStorage.getItem(PK(m)) || 'null'); } catch (e) { return null; } };
  const writeProf = (m, d) => localStorage.setItem(PK(m), JSON.stringify(d));
  const unionById = (a, b) => { const o = {}; (a || []).forEach(x => { if (x && x.id) o[x.id] = x; }); (b || []).forEach(x => { if (x && x.id && !o[x.id]) o[x.id] = x; }); return Object.values(o); };

  // merge a local profile blob with the remote one: LWW on plan/fields, UNION on runs/plans/memories
  function mergeProfile(local, remote) {
    const lm = local._mut || 0, rm = remote._mut || 0;
    const base = Object.assign({}, rm > lm ? remote : local);         // newer wins for scalar fields + active plan
    base.activities = unionById(local.activities, remote.activities).sort((x, y) => (y.at || 0) - (x.at || 0));  // keep every device's runs
    const pm = {}; (local.plans || []).forEach(p => { if (p && p.planId) pm[p.planId] = p; });
    (remote.plans || []).forEach(p => { if (p && p.planId) { const c = pm[p.planId]; if (!c || (p._mut || 0) > (c._mut || 0)) pm[p.planId] = p; } });
    if (Object.keys(pm).length) base.plans = Object.values(pm);
    base.memories = unionById(local.memories, remote.memories);
    base.capsules = unionById(local.capsules, remote.capsules);
    return base;
  }
  function mirrorActive() {
    const am = localStorage.getItem('stride_active') || 'run';
    const act = localStorage.getItem(PK(am));
    if (act) localStorage.setItem('stride', act);
  }

  async function push() {
    if (!user || syncing) return; syncing = true;
    try {
      const rows = [];
      MODES.forEach(m => {
        const blob = readProf(m); if (!blob) return;
        (blob.activities || []).forEach(a => { if (!a.id) a.id = uuid(); });      // stable ids for union merges
        writeProf(m, blob);
        rows.push({ user_id: user.id, mode: m, data: blob, updated_at: new Date(blob._mut || Date.now()).toISOString() });
      });
      if (rows.length) await sb.from('profile_state').upsert(rows);
      mirrorActive();
      localStorage.setItem(OUTBOX, ''); stamp();
    } finally { syncing = false; }
  }

  async function pull() {
    if (!user) return;
    const [{ data: states }, { data: sub }] = await Promise.all([
      sb.from('profile_state').select('*').eq('user_id', user.id),
      sb.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle()
    ]);
    const byMode = {}; (states || []).forEach(r => { byMode[r.mode] = r.data; });
    MODES.forEach(m => {
      const remote = byMode[m], local = readProf(m);
      let merged = null;
      if (remote && local) merged = mergeProfile(local, remote);
      else if (remote) merged = remote;
      else merged = local;
      if (merged) writeProf(m, merged);
    });
    // pick an active mode if none set yet (fresh device restoring from cloud)
    if (!localStorage.getItem('stride_active')) {
      const first = byMode['run'] ? 'run' : (byMode['walk'] ? 'walk' : null);
      if (first) localStorage.setItem('stride_active', first);
    }
    // subscription (server truth) → Pro gating, applied to BOTH profiles + active
    MODES.forEach(m => {
      const p = readProf(m); if (!p) return;
      p.subscription = sub ? { tier: sub.tier, status: sub.status, period_end: sub.current_period_end } : (p.subscription || { tier: 'free' });
      if (p.subscription.tier === 'pro') p.pro = true;
      writeProf(m, p);
    });
    mirrorActive();
    stamp();
  }
  async function firstSync() { try { await pull(); if (localStorage.getItem(OUTBOX)) await push(); } catch (e) { console.warn('[StrideSync]', e && e.message); } finally { emit(); } }

  return N;
})();
