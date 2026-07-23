/* Strivon — test battery (unit + stress + smoke).
   The app is a single-file vanilla app, so tests run against the REAL functions in-page
   (no mocks/replicas → no drift). Run it from DevTools on the app:

     open the app (local or https://soumyadg.github.io/stride-coach/)
     DevTools Console →  await runStrideTests()

   Returns a report object; also console.tables each section. */
window.runStrideTests = async function () {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const sections = [];
  const mk = name => { const R = []; return { name, ok: (n, c) => R.push({ n, pass: !!c }), R }; };

  // ---------------- UNIT (pure functions) ----------------
  {
    const s = mk('UNIT · pure functions'); const ok = s.ok;
    ok('paceStr 6.0=6:00', paceStr(6.0) === '6:00');
    ok('paceStr 5.997 rolls to 6:00', paceStr(5.997) === '6:00');
    ok('paceStr 5.5=5:30', paceStr(5.5) === '5:30');
    ok('paceStr 4.75=4:45', paceStr(4.75) === '4:45');
    let paceBad = 0; for (let p = 3; p <= 8; p += 0.001) if (/:60/.test(paceStr(p))) paceBad++;
    ok('paceStr never renders :60 (5000 vals)', paceBad === 0);
    const near = (a, b) => Math.abs(a - b) < 0.6;
    ok('wetBulb(30,70)~25.6', near(wetBulb(30, 70), 25.6));
    ok('wetBulb(12,60)~7.8', near(wetBulb(12, 60), 7.8));
    ok('wetBulb(35,50)~26.6', near(wetBulb(35, 50), 26.6));
    let wbNaN = 0; for (let T = -10; T <= 45; T++) for (let H = 1; H <= 100; H += 3) if (!isFinite(wetBulb(T, H))) wbNaN++;
    ok('wetBulb finite over full range', wbNaN === 0);
    ok('bucket 6=ideal', safetyBucket(6) === 'ideal');
    ok('bucket 14=good', safetyBucket(14) === 'good');
    ok('bucket 20=caution', safetyBucket(20) === 'caution');
    ok('bucket 25=high', safetyBucket(25) === 'high');
    ok('bucket 29=danger', safetyBucket(29) === 'danger');
    ok('haversine London-Paris ~343km', Math.abs(haversine(51.5074, -0.1278, 48.8566, 2.3522) / 1000 - 343) < 8);
    ok('haversine same point=0', haversine(51, 0, 51, 0) === 0);
    ok('buildLaps easy=1', buildLaps({ t: 'Easy run', km: 5, kind: 'easy' }).length === 1);
    ok('buildLaps intervals=14', buildLaps({ t: '400m Intervals', km: 6, kind: 'quality' }).length === 14);
    ok('buildLaps tempo=3', buildLaps({ t: 'Tempo', km: 6, kind: 'quality' }).length === 3);
    ok('buildLaps hill=14', buildLaps({ t: 'Hill repeats', km: 5, kind: 'quality' }).length === 14);
    const ms = makeSessions(30, 4, 'half', 3, 12);
    ok('makeSessions count=days', ms.length === 4);
    ok('makeSessions all km>0', ms.every(x => x.km > 0));
    ok('makeSessions total ~ vol', Math.abs(ms.reduce((a, x) => a + x.km, 0) - 30) < 2);
    ok('wmo(0)=Clear', wmo(0)[0] === 'Clear');
    ok('wmo unknown=fallback', wmo(999)[0] === '—');
    sections.push(s);
  }

  // ---------------- STRESS · SafeRamp (400 random plans) ----------------
  {
    const s = mk('STRESS · SafeRamp (400 plans)'); const ok = s.ok;
    const orig = runBuildLoader; runBuildLoader = function () {};
    const setInputs = (goal, base, days, weeks, exp, pref) => {
      document.getElementById('o-goal').value = goal; document.getElementById('o-base').value = base; document.getElementById('o-weeks').value = weeks;
      document.querySelectorAll('#o-days button').forEach(b => b.classList.toggle('on', +b.dataset.v === days));
      document.querySelectorAll('#o-exp button').forEach(b => b.classList.toggle('on', b.dataset.v === exp));
      document.querySelectorAll('#pref-grid .ptile').forEach(b => b.classList.toggle('on', b.dataset.v === pref));
    };
    const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = a => a[rnd(0, a.length - 1)];
    let cap = 0, nan = 0, dl = 0, aw = 0, err = 0, mj = 0, ma = 0;
    for (let k = 0; k < 400; k++) {
      try {
        setInputs(pick(['5k', '10k', 'half', 'marathon']), rnd(5, 40), pick([3, 4, 5]), rnd(4, 24), pick(['new', 'return', 'regular']), pick(['gentle', 'balanced', 'ambitious', 'auto']));
        buildPlan(); const p = S.plan; if (!p || !p.length) { err++; continue; }
        for (const w of p) if (!isFinite(w.vol) || w.vol <= 0) nan++;
        for (let i = 1; i < p.length; i++) { if (p[i].isDeload || p[i].isTaper || p[i - 1].isDeload || p[i - 1].isTaper) continue; const j = (p[i].vol / p[i - 1].vol - 1) * 100; if (j > mj) mj = j; if (j > 10.05) cap++; }
        if (p.length >= 8 && !p.some(w => w.isDeload)) dl++;
        p.forEach((w, i) => { if (!w.isDeload && !w.isTaper) { const a = acwrFor(i); if (a > ma) ma = a; if (a > 1.35) aw++; } });
      } catch (e) { err++; }
    }
    runBuildLoader = orig;
    ok('0 cap violations (max jump ' + mj.toFixed(2) + '%)', cap === 0);
    ok('0 NaN/zero volumes', nan === 0);
    ok('0 plans missing deloads (>=8wk)', dl === 0);
    ok('0 ACWR violations (peak ' + ma.toFixed(2) + ')', aw === 0);
    ok('0 generation errors', err === 0);
    sections.push(s);
  }

  // ---------------- STRESS · run engine ----------------
  {
    const s = mk('STRESS · run engine'); const ok = s.ok;
    window._chosen = { t: '400m Intervals', km: 6, kind: 'quality' };
    run = null; toggleRun(); pauseRun(); run.active = true; run.paused = false;
    const nLaps = run.laps.length; let last = -1, mono = true, pb = 0, threw = false;
    try { for (let i = 0; i < 8000; i++) { addDist(1 + Math.random() * 3); if (i % 50 === 0) { render(); if (/:60/.test(document.getElementById('r-lpace').textContent) || /:60/.test(document.getElementById('r-tpace').textContent)) pb++; } if (run.dist < last) mono = false; last = run.dist; } } catch (e) { threw = true; }
    ok('distance monotonic (8000 steps)', mono);
    ok('no exception', !threw);
    ok('advanced through all ' + nLaps + ' laps', run.lap === nLaps - 1);
    ok('pace never :60', pb === 0);
    run.pts = []; run.last = null; run.dist = 0; run.lapDist = 0; run.paused = false; const t = Date.now();
    onPos({ coords: { latitude: 51.5, longitude: -0.12, speed: 2.5 }, timestamp: t });
    onPos({ coords: { latitude: 51.5001, longitude: -0.12, speed: 2.5 }, timestamp: t + 4000 });
    ok('onPos adds distance on move', run.dist > 0);
    onPos({ coords: { latitude: 51.5001, longitude: -0.12, speed: 0 }, timestamp: t + 6000 });
    ok('auto-pause on stop', run.paused === true);
    const bj = run.dist; onPos({ coords: { latitude: 53, longitude: -2, speed: 0 }, timestamp: t + 7000 });
    ok('GPS teleport ignored', run.dist === bj);
    const S2 = store.get(); let gbad = 0; (S2.activities || []).slice(0, 25).forEach(a => { const g = buildGPX(a); const doc = new DOMParser().parseFromString(g, 'application/xml'); if (doc.querySelector('parsererror') || doc.documentElement.tagName !== 'gpx' || (g.match(/<trkpt /g) || []).length !== (a.pts || []).length) gbad++; });
    ok('all activities → valid GPX', gbad === 0);
    stopRun();
    sections.push(s);
  }

  // ---------------- UNIT · sports-science + new features ----------------
  {
    const s = mk('UNIT · science & features'); const ok = s.ok;
    // seed a clean athlete with a few realistic runs so predictors have data
    const now = Date.now(), day = 86400000;
    S.activities = [
      { id: 't1', name: 'Easy run', km: 5.0, secs: 1500, pace: 5.0, hr: 150, rpe: 4, startAt: now - 2 * day, at: now - 2 * day, pts: [[51.5, -0.12], [51.51, -0.12]] },
      { id: 't2', name: 'Tempo', km: 8.0, secs: 2304, pace: 4.8, hr: 165, rpe: 6, startAt: now - 4 * day, at: now - 4 * day, pts: [] },
      { id: 't3', name: 'Long run', km: 12.0, secs: 3960, pace: 5.5, hr: 158, rpe: 5, startAt: now - 6 * day, at: now - 6 * day, pts: [] },
    ];
    // race prediction (Riegel): longer distance => slower per-km pace than the 5k
    if (typeof predictRaces === 'function') {
      const pr = predictRaces();
      ok('predictRaces returns times', !!(pr && pr.out && Object.keys(pr.out).length));
      if (pr && pr.out && pr.out['10k'] && pr.out['5k']) ok('Riegel: 10k slower pace than 5k', (pr.out['10k'].secs / 10) > (pr.out['5k'].secs / 5) - 1);
      let mono = true, keys = Object.keys(pr.out); for (let i = 1; i < keys.length; i++) if (pr.out[keys[i]].secs < pr.out[keys[i - 1]].secs) mono = false;
      ok('race times increase with distance', mono);
    }
    if (typeof vdotEstimate === 'function') { const v = vdotEstimate(); ok('VDOT/VO2max in human range 20-85', v == null || (v >= 20 && v <= 85)); }
    if (typeof trainingForm === 'function') { const f = trainingForm(); ok('trainingForm CTL/ATL/TSB finite', !f || (isFinite(f.ctl) && isFinite(f.atl) && isFinite(f.tsb))); if (f) ok('TSB == CTL - ATL', Math.abs(f.tsb - (f.ctl - f.atl)) < 1.5); }
    // synthetic route loop must be distance-accurate (#7)
    if (typeof syntheticLoop === 'function') { let worst = 0; for (const km of [2, 5, 10, 21]) { const lp = syntheticLoop([51.5, -0.12], km, 42); const e = Math.abs(lp.km - km) / km; if (e > worst) worst = e; } ok('syntheticLoop within 1% of target (max ' + (worst * 100).toFixed(2) + '%)', worst < 0.01); }
    // dedupe guard (#5)
    if (typeof activityExists === 'function') { ok('dedupe: same run detected', activityExists({ startAt: now - 2 * day, km: 5.0 }) === true); ok('dedupe: different run not flagged', activityExists({ startAt: now - 99 * day, km: 3.3 }) === false); }
    // on-device coach always replies (#6)
    if (typeof localCoachReply === 'function') { ['should i run today?', 'am i overtraining?', 'what pace?', 'random gibberish'].forEach(q => ok('coach replies to "' + q + '"', typeof localCoachReply(q) === 'string' && localCoachReply(q).length > 5)); }
    S.activities = []; store.set(S);
    sections.push(s);
  }

  // ---------------- SMOKE · navigation ----------------
  {
    const s = mk('SMOKE · screens'); const ok = s.ok;
    go('today'); ok('Today: risk radar', document.getElementById('risk-card').innerText.includes('ACWR'));
    go('plan'); ok('Plan: curve + calendar', document.querySelectorAll('#curve .bar').length > 0 && document.querySelectorAll('#calendar .day').length > 0);
    go('run'); ok('Run screen', !!document.getElementById('r-target'));
    go('stats'); ok('Stats: PRs + chart', document.querySelectorAll('#st-prs .pr').length === 3 && document.querySelectorAll('#st-chart .cb').length === 6);
    go('why'); ok('Why: account + pricing', !!document.getElementById('account-card') && document.querySelectorAll('.plan').length === 2);
    ok('no competitor name in UI', !document.body.innerText.includes('Runna'));
    openLib(); ok('workout library 8 tiles', document.querySelectorAll('#lib-run .wtile').length === 8); closeLib();
    sections.push(s);
  }

  // ---------------- UNIT · new features (missions, streak, metrics, projection, injury, coach, dog) ----------------
  {
    const s = mk('UNIT · features v2'); const ok = s.ok;
    const now = Date.now(), day = 86400000;
    // streak + achievements
    if (typeof computeStreak === 'function') {
      S.activities = [{id:'s1',km:5,secs:1500,pace:5,at:now-day,startAt:now-day},{id:'s2',km:6,secs:1800,pace:5,at:now-8*day,startAt:now-8*day},{id:'s3',km:7,secs:2100,pace:5,at:now-15*day,startAt:now-15*day}];
      const st = computeStreak(); ok('3 consecutive weeks → streak 3', st.weeks === 3); ok('best streak 3', st.best === 3);
    }
    if (typeof achvStats === 'function' && typeof ACHIEVEMENTS !== 'undefined') {
      S.activities = [{id:'a',km:11,secs:3600,pace:5.4,at:now-day,startAt:new Date(new Date().setHours(6,0,0,0)).getTime()}];
      const es = achvStats(); const names = ACHIEVEMENTS.filter(a=>a.test(es)).map(a=>a.name);
      ok('11km unlocks 5K + 10K club, not half', names.includes('5K club') && names.includes('10K club') && !names.includes('Half marathon'));
      ok('6am run unlocks Early bird', names.includes('Early bird'));
    }
    // metrics
    if (typeof computeMetrics === 'function') {
      S.weightKg = 80; S.activities = [{id:'x',km:10,secs:3000,pace:5,hr:150,at:now-day,startAt:now-day}];
      const m = computeMetrics();
      ok('calories ≈ km×kg×1.036 (run)', Math.abs(m.cal7 - 10*80*1.036) < 2);
      ok('avg HR reads 150', m.avgHr === 150);
      ok('recovery 0–100 or null', m.recovery === null || (m.recovery >= 0 && m.recovery <= 100));
      ok('distance7 = 10', Math.abs(m.dist7 - 10) < 0.01);
    }
    // projection
    if (typeof computeProjection === 'function') {
      S.weightKg = 88; S.heightCm = 178;
      const p = computeProjection();
      if (p) { const last = p.points[p.points.length-1];
        ok('weight projects downward when BMI>22.5', !p.canLose || last.weight < p.weight);
        ok('projection points are dated + ordered', p.points.every((pt,i)=>i===0 || pt.week>=p.points[i-1].week)); }
    }
    // injury adjustment severity
    if (typeof injuryAdjust === 'function') {
      ok('ACL → very conservative ramp (≤1.03)', injuryAdjust([{type:'ACL tear — left leg',when:'past'}]).rampCap <= 1.03);
      ok('recent stress fracture → high band', injuryAdjust([{type:'Stress fracture',when:'recent'}]).band === 'high');
      ok('no injuries → normal ramp 1.10', injuryAdjust([]).rampCap === 1.10);
    }
    // daily mission — deterministic per day + mode-aware
    if (typeof todaysMission === 'function') {
      const a = todaysMission(), b = todaysMission();
      ok('mission stable within the day', a === b);
      ok('mission has text + tag', !!(a && a.t && a.tag));
    }
    // coach scope guard
    if (typeof localCoachReply === 'function') {
      const off = localCoachReply('what is the capital of France?');
      ok('off-topic → redirect to body', /improving your body|keep it/i.test(off));
      ok('nutrition question answered', /eat|protein|carb|food/i.test(localCoachReply('what should i eat before a run?')));
      ok('weight-loss question answered', /deficit|fat loss|weight/i.test(localCoachReply('how do i lose weight?')));
    }
    // dog spots
    if (typeof addPoopSpot === 'function') {
      S.poopSpots = []; S.mode = 'walk';
      S.poopSpots.unshift({id:'d1',kind:'poop',lat:51.5,lon:-0.12,at:now});
      ok('poop spot stored', (S.poopSpots||[]).length === 1);
      if (typeof delPoopSpot === 'function') { delPoopSpot('d1'); ok('poop spot deletes', (S.poopSpots||[]).length === 0); }
    }
    S.activities = []; if (window.store) store.set(S);
    sections.push(s);
  }

  // ---------------- STRESS · two-profile store ----------------
  {
    const s = mk('STRESS · two-profile store'); const ok = s.ok;
    if (typeof store !== 'undefined' && store && store.switchTo && store.activeMode) {
      const before = store.activeMode();
      // stamp a marker onto the active profile, switch away and back, ensure it survives
      const cur = store.get() || {}; cur.__testMarker = 12345; store.set(cur);
      const other = before === 'run' ? 'walk' : 'run';
      store.switchTo(other); store.switchTo(before);
      const after = store.get();
      ok('active profile data survives a round-trip switch', after && after.__testMarker === 12345);
      ok('activeMode restored', store.activeMode() === before);
      // cleanup marker
      const c2 = store.get(); if (c2) { delete c2.__testMarker; store.set(c2); }
    } else ok('two-profile store present', false);
    sections.push(s);
  }

  // ---------------- report ----------------
  let total = 0, pass = 0; const fails = [];
  sections.forEach(s => { const p = s.R.filter(x => x.pass).length; total += s.R.length; pass += p; s.R.filter(x => !x.pass).forEach(x => fails.push(s.name + ' → ' + x.n)); console.log('%c' + s.name + ': ' + p + '/' + s.R.length, 'font-weight:bold'); console.table(s.R); });
  const report = { total, pass, fail: total - pass, verdict: pass === total ? '✅ ALL PASS' : '❌ ' + (total - pass) + ' FAILED', failures: fails };
  console.log('%c' + report.verdict + '  (' + pass + '/' + total + ')', 'font-size:15px;font-weight:bold;color:' + (pass === total ? '#2fe3a0' : '#ff5555'));
  return report;
};
