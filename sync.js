/* Stride Coach — accounts + cloud sync (offline-first).
   No config → this whole module is inert and the app runs exactly as before.
   Emits a 'stride-synced' DOM event after any sync so the UI can re-render. */
window.StrideSync = (function () {
  const cfg = window.STRIDE_CONFIG || {};
  const OUTBOX = 'stride_outbox', LAST = 'stride_lastsync';
  let sb = null, user = null, syncing = false, pushTimer = null, onState = null;

  const configured = () => !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2));
  const getS = () => { try { return JSON.parse(localStorage.getItem('stride') || 'null'); } catch (e) { return null; } };
  const saveS = s => localStorage.setItem('stride', JSON.stringify(s));
  const stamp = () => localStorage.setItem(LAST, new Date().toISOString());
  const emit = () => document.dispatchEvent(new CustomEvent('stride-synced'));

  const N = {
    enabled: false,
    state: () => ({ enabled: N.enabled, configured: configured(), signedIn: !!user, email: user ? user.email : null, lastSync: localStorage.getItem(LAST) }),

    async init(cb) {
      onState = cb;
      if (!configured()) { N.enabled = false; cb && cb(N.state()); return; }
      N.enabled = true;
      sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
      sb.auth.onAuthStateChange((_e, session) => { user = session ? session.user : null; cb && cb(N.state()); if (user) firstSync(); });
      try { const { data } = await sb.auth.getSession(); user = data.session ? data.session.user : null; } catch (e) {}
      cb && cb(N.state());
      if (user) firstSync();
    },

    async signUp(email, pw) { const { error } = await sb.auth.signUp({ email, password: pw }); if (error) throw error; },
    async signIn(email, pw) { const { error } = await sb.auth.signInWithPassword({ email, password: pw }); if (error) throw error; },
    async signOut() { try { await sb.auth.signOut(); } catch (e) {} user = null; onState && onState(N.state()); },

    // called on every local save (store.set) — marks data dirty and debounces a push
    markDirty() {
      if (!configured()) return;
      localStorage.setItem(OUTBOX, '1');
      if (!user) return;
      clearTimeout(pushTimer); pushTimer = setTimeout(() => push().catch(() => {}), 1500);
    },

    async syncNow() { if (!user) return; await pull(); await push(); emit(); }
  };

  // ---- row mappers (local S <-> DB) ----
  function profileRow(s) { return { id: user.id, email: user.email, goal: s.goal, goal_name: s.goalName, weeks: s.weeks, days_per_week: s.days, experience: s.exp, pref: s.pref, max_hr: s.maxHR || 190, reminders_on: !!(s.reminders && s.reminders.on), current_week: s.curWeek }; }
  function planRow(s) { if (!s.planId) { s.planId = uuid(); saveS(s); } return { id: s.planId, user_id: user.id, goal: s.goal, goal_name: s.goalName, weeks: s.weeks, days: s.days, experience: s.exp, pref: s.pref, start_date: (s.created || '').slice(0, 10) || null, data: s.plan, cur_week: s.curWeek, is_active: true, updated_at: new Date(s._mut || Date.now()).toISOString() }; }
  function actRows(s) { return (s.activities || []).map(a => { if (!a.id) a.id = uuid(); return { id: a.id, user_id: user.id, name: a.name, started_at: new Date(a.startAt || a.at).toISOString(), duration_s: a.secs, distance_km: a.km, avg_pace: a.pace, avg_hr: a.hr || null, rpe: a.rpe, wet_bulb: a.wb || null, source: a.source || 'gps', route: a.pts && a.pts.length ? a.pts : null }; }); }
  function fromActRow(a) { const start = +new Date(a.started_at); return { id: a.id, name: a.name, km: +a.distance_km, secs: a.duration_s, pace: +a.avg_pace, hr: a.avg_hr, rpe: a.rpe, wb: a.wet_bulb, source: a.source, startAt: start, at: start + (a.duration_s * 1000 || 0), pts: a.route || [] }; }
  function rebuildLocal(prof, plan, acts) {
    const s = plan ? { goal: plan.goal, goalName: plan.goal_name, base: 0, days: plan.days, exp: plan.experience, pref: plan.pref, weeks: plan.weeks, plan: plan.data, created: (plan.start_date || '') + 'T00:00:00.000Z', curWeek: plan.cur_week || 1, planId: plan.id, readiness: null, history: [], activities: [] } : { activities: [] };
    if (prof) { s.maxHR = prof.max_hr; s.reminders = { on: !!prof.reminders_on }; if (prof.current_week) s.curWeek = prof.current_week; }
    s.activities = (acts || []).map(fromActRow).sort((a, b) => b.at - a.at);
    return s;
  }
  function applyRemote(local, prof, plan) {
    Object.assign(local, { plan: plan.data, curWeek: plan.cur_week, goal: plan.goal, goalName: plan.goal_name, weeks: plan.weeks, days: plan.days, exp: plan.experience, pref: plan.pref, planId: plan.id });
    if (prof) { local.maxHR = prof.max_hr; local.reminders = { on: !!prof.reminders_on }; }
  }

  // ---- push / pull ----
  async function push() {
    if (!user || syncing) return; const s = getS(); if (!s) return; syncing = true;
    try {
      await sb.from('profiles').upsert(profileRow(s));
      if (s.plan) await sb.from('plans').upsert(planRow(s));
      const rows = actRows(s); saveS(s); // saveS to persist any new activity ids
      if (rows.length) await sb.from('activities').upsert(rows);
      localStorage.setItem(OUTBOX, '');
      stamp();
    } finally { syncing = false; }
  }
  async function pull() {
    if (!user) return; const s = getS();
    const [{ data: prof }, { data: plan }, { data: acts }] = await Promise.all([
      sb.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      sb.from('plans').select('*').eq('user_id', user.id).eq('is_active', true).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
      sb.from('activities').select('*').eq('user_id', user.id)
    ]);
    if (!s && (plan || prof)) { saveS(rebuildLocal(prof, plan, acts)); }       // fresh device → restore
    else if (s) {
      if (plan) { const rt = +new Date(plan.updated_at || 0), lt = s._mut || 0; if (rt > lt) { applyRemote(s, prof, plan); } }  // LWW on plan
      if (acts && acts.length) { const have = new Set((s.activities || []).map(a => a.id)); const add = acts.filter(a => !have.has(a.id)).map(fromActRow); if (add.length) s.activities = (s.activities || []).concat(add).sort((a, b) => b.at - a.at); } // union runs
      saveS(s);
    }
    stamp();
  }
  async function firstSync() { try { await pull(); if (localStorage.getItem(OUTBOX)) await push(); } catch (e) { console.warn('[StrideSync]', e && e.message); } finally { emit(); } }

  return N;
})();
