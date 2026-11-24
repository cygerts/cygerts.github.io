(function () {
  const root = document.getElementById('lcs-demo');
  if (!root) return;

  const $ = (sel) => root.querySelector(sel);
  const state = { data: null, ds: 0, model: null, run: 0, fast: false, running: false, done: false, view: 0 };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CORPUS = { pile: 'the Pile', dolma: 'Dolma' };

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const visible = (s) => s === '' ? '∅' : s.replace(/ /g, '␣').replace(/\n/g, '↵').replace(/\t/g, '⇥');
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const dataset = () => state.data.datasets[state.ds];
  const modelInfo = () => state.data.models.find((m) => m.id === state.model);
  const labelFor = (ds, m) => ds.group === m.family ? 'seen' : 'unseen';
  const outcomeOf = (row) => (row[2] && !row[3] ? 'helped' : row[3] && !row[2] ? 'hurt' : 'same');

  function speedFor(i) {
    if (state.fast || reduceMotion) return 0;
    return i === 0 ? 1 : i === 1 ? 0.5 : i < 5 ? 0.15 : 0;
  }

  function chip(label, sub, cls, active, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `demo-chip ${cls}${active ? ' is-active' : ''}`;
    b.innerHTML = (cls !== 'model' ? `<span class="demo-dot ${cls}"></span>` : '') +
      `${esc(label)}${sub ? ` <small>${esc(sub)}</small>` : ''}`;
    b.addEventListener('click', onClick);
    return b;
  }

  function renderDatasets() {
    const groups = { pile: $('#demo-pile'), dolma: $('#demo-dolma'), unseen: $('#demo-unseen') };
    Object.values(groups).forEach((g) => (g.innerHTML = ''));
    state.data.datasets.forEach((d, i) => {
      groups[d.group].appendChild(chip(d.name, d.group === 'unseen' ? d.source : '', d.group, i === state.ds, () => {
        state.ds = i;
        renderDatasets();
        reset();
      }));
    });
  }

  function renderModels() {
    const box = $('#demo-models');
    box.innerHTML = '';
    state.data.models.forEach((m) => {
      box.appendChild(chip(m.name, `trained on ${CORPUS[m.family]}`, 'model', m.id === state.model, () => {
        state.model = m.id;
        renderModels();
        reset();
      }));
    });
  }

  function tokenSpans(tokens, prefix, offset = 0) {
    return tokens.map((t, i) => `<span class="tk" id="${prefix}${i + offset}">${esc(t)}</span>`).join('');
  }

  function renderDoc(i) {
    const d = dataset().docs[i];
    let offset = 0;
    $('#demo-context').innerHTML = d.context.map((c, k) => {
      const html = `<div class="demo-ctxdoc"><span class="demo-ctxlabel">Similar document ${k + 1} · Jaccard ${c.sim.toFixed(2)} · first ${c.tokens.length} tokens</span>${tokenSpans(c.tokens, 'c_', offset)}</div>`;
      offset += c.tokens.length;
      return html;
    }).join('');
    $('#demo-target').innerHTML = tokenSpans(d.tokens, 't_');
    $('#demo-docpos').textContent = `Audited document ${i + 1} of ${dataset().docs.length}`;
    $('#demo-target-count').textContent = `${d.tokens.length} tokens`;
    $('#demo-context').scrollTop = 0;
    $('#demo-target').scrollTop = 0;
    state.view = i;
  }

  const tok = (id) => document.getElementById(id);

  function markMatches(d) {
    d.match.forEach((len, i) => {
      if (len >= state.data.meta.ngram && i > state.data.meta.skip) tok('t_' + i).classList.add('m1');
    });
  }

  function markPick(d, k, outcome) {
    const el = tok('t_' + d.positions[k]);
    el.classList.add('is-pick');
    el.dataset.k = k;
    el.dataset.n = k + 1;
    if (outcome) el.classList.add(outcome);
    return el;
  }

  function clearSpans() {
    root.querySelectorAll('.is-src').forEach((e) => e.classList.remove('is-src'));
  }

  function showSpan(d, k) {
    clearSpans();
    const j = d.positions[k];
    const len = d.match[j];
    const src = d.source[k];
    if (src >= 0) for (let s = src; s < src + len; s++) tok('c_' + s)?.classList.add('is-src');
    for (let s = j - len + 1; s < j; s++) tok('t_' + s)?.classList.add('is-src');
    return src;
  }

  function scrollInto(container, el, smooth) {
    if (!el) return;
    container.scrollTo({ top: Math.max(0, el.offsetTop - container.clientHeight / 2), behavior: smooth ? 'smooth' : 'auto' });
  }

  function renderStatic(i) {
    const d = dataset().docs[i];
    renderDoc(i);
    markMatches(d);
    const rows = d.preds[state.model];
    d.positions.forEach((_, k) => markPick(d, k, outcomeOf(rows[k])));
    root.querySelectorAll('.demo-cell').forEach((c, ci) => c.classList.toggle('is-current', ci === i));
    infoDefault();
  }

  function infoDefault() {
    $('#demo-info').innerHTML = 'Hover over or click a selected token to see what the model predicted.';
  }

  function showInfo(k) {
    const d = dataset().docs[state.view];
    const row = d.preds[state.model]?.[k];
    if (!row || !tok('t_' + d.positions[k]).classList.contains('is-pick')) return;
    root.querySelectorAll('.is-focus').forEach((e) => e.classList.remove('is-focus'));
    tok('t_' + d.positions[k]).classList.add('is-focus');
    const pred = (t, ok) => `<span class="demo-pred ${ok ? 'ok' : 'bad'}">${esc(visible(t))}</span>`;
    const o = outcomeOf(row);
    const label = { helped: 'context helped', hurt: 'context hurt', same: 'no change' }[o];
    $('#demo-info').innerHTML = `Token ${k + 1} of ${d.positions.length} · correct <b>${esc(visible(d.target[k]))}</b> · without context ${pred(row[1], row[3])} · with context ${pred(row[0], row[2])} <span class="demo-outcome ${o}">${label}</span>`;
    const src = showSpan(d, k);
    if (src >= 0) scrollInto($('#demo-context'), tok('c_' + src), true);
  }

  function renderStrip() {
    const strip = $('#demo-strip');
    strip.innerHTML = dataset().docs.map((_, i) => `<button type="button" class="demo-cell" data-i="${i}" disabled aria-label="Document ${i + 1}">${i + 1}</button>`).join('');
  }

  function fillCell(i, h, u) {
    const cell = root.querySelector(`.demo-cell[data-i="${i}"]`);
    cell.classList.add('is-done');
    cell.style.background = h > u ? 'var(--helped)' : u > h ? 'var(--hurt)' : 'var(--unchanged)';
    cell.title = `Document ${i + 1}: ${h} helped, ${u} hurt`;
  }

  function renderTally(n, h, u) {
    const total = dataset().docs.length;
    const s = h + u ? (u / (h + u)).toFixed(3) : '–';
    $('#demo-tally').innerHTML = `<span>documents <b>${n}</b> / ${total}</span>` +
      `<span class="helped"><b>${h}</b> helped</span><span class="hurt"><b>${u}</b> hurt</span>` +
      `<span class="score">S(D) = hurt / (helped + hurt) = <b>${s}</b></span>`;
  }

  function reset() {
    state.run++;
    state.running = false;
    state.done = false;
    state.fast = false;
    renderStrip();
    renderTally(0, 0, 0);
    renderDoc(0);
    infoDefault();
    $('#demo-run').disabled = false;
    $('#demo-run').innerHTML = '<i class="fas fa-play"></i>Run audit';
    $('#demo-skip').hidden = true;
    $('#demo-status').textContent = `${dataset().docs.length} documents · ${modelInfo().name}`;
    $('#demo-score').innerHTML = '';
    $('#demo-step-score').classList.add('is-locked');
  }

  async function auditDoc(i, run, totals) {
    const d = dataset().docs[i];
    const rows = d.preds[state.model];
    const target = $('#demo-target');
    const ctx = $('#demo-context');
    renderDoc(i);
    root.querySelectorAll('.demo-cell').forEach((c, ci) => c.classList.toggle('is-current', ci === i));

    if (speedFor(i) > 0) {
      $('#demo-status').textContent = 'Finding text shared with the context…';
      const perFrame = Math.max(3, Math.ceil(d.tokens.length / (70 * speedFor(i))));
      for (let t = 0; t < d.tokens.length; t++) {
        if (run !== state.run) return false;
        const el = tok('t_' + t);
        if (d.match[t] >= state.data.meta.ngram && t > state.data.meta.skip) el.classList.add('m1');
        if (t % perFrame === 0 && speedFor(i) > 0) {
          el.classList.add('is-scan');
          scrollInto(target, el, false);
          await frame();
          el.classList.remove('is-scan');
        }
      }
    } else {
      markMatches(d);
    }

    const order = d.positions.map((_, k) => k).sort((a, b) => d.match[d.positions[b]] - d.match[d.positions[a]] || a - b);
    if (speedFor(i) > 0) $('#demo-status').textContent = `Selecting the ${d.positions.length} tokens with the longest match…`;
    for (const k of order) {
      if (run !== state.run) return false;
      const el = markPick(d, k);
      if (speedFor(i) > 0) {
        const src = showSpan(d, k);
        el.classList.add('flash');
        scrollInto(target, el, true);
        if (src >= 0) scrollInto(ctx, tok('c_' + src), true);
        await wait(320 * speedFor(i));
        el.classList.remove('flash');
      }
    }
    clearSpans();

    if (speedFor(i) > 0) {
      $('#demo-status').textContent = `Querying ${modelInfo().name}: ${2 * d.positions.length} queries…`;
      target.scrollTo({ top: 0, behavior: 'smooth' });
    }
    let h = 0, u = 0;
    for (let k = 0; k < d.positions.length; k++) {
      if (run !== state.run) return false;
      const o = outcomeOf(rows[k]);
      h += o === 'helped';
      u += o === 'hurt';
      const el = tok('t_' + d.positions[k]);
      el.classList.add(o);
      if (speedFor(i) > 0) {
        el.classList.add('flash');
        scrollInto(target, el, true);
        renderTally(i, totals.h + h, totals.u + u);
        await wait(260 * speedFor(i));
        el.classList.remove('flash');
      }
    }
    totals.h += h;
    totals.u += u;
    fillCell(i, h, u);
    renderTally(i + 1, totals.h, totals.u);
    await wait(speedFor(i) > 0 ? 900 * speedFor(i) : state.fast || reduceMotion ? 0 : 140);
    return run === state.run;
  }

  async function runAudit() {
    const run = ++state.run;
    state.fast = false;
    state.running = true;
    state.done = false;
    renderStrip();
    $('#demo-step-score').classList.add('is-locked');
    $('#demo-run').disabled = true;
    $('#demo-skip').hidden = false;
    const totals = { h: 0, u: 0 };
    const n = dataset().docs.length;
    for (let i = 0; i < n; i++) {
      if (speedFor(i) === 0) $('#demo-status').textContent = `Auditing document ${i + 1} of ${n}…`;
      if (!(await auditDoc(i, run, totals))) return;
    }
    state.running = false;
    state.done = true;
    $('#demo-skip').hidden = true;
    $('#demo-run').disabled = false;
    $('#demo-run').innerHTML = '<i class="fas fa-redo"></i>Run again';
    $('#demo-status').textContent = 'Done. Click a cell to inspect that document.';
    root.querySelectorAll('.demo-cell').forEach((c) => (c.disabled = false));
    renderStatic(0);
    $('#demo-step-score').classList.remove('is-locked');
    renderScore();
  }

  function auc(pos, neg) {
    let s = 0;
    pos.forEach((p) => neg.forEach((q) => (s += p > q ? 1 : p === q ? 0.5 : 0)));
    return s / (pos.length * neg.length);
  }

  function renderScore() {
    const ds = dataset();
    const m = modelInfo();
    const sc = ds.scores[m.id];
    const corpus = CORPUS[m.family];
    const all = state.data.datasets.map((x) => ({
      name: `${x.name} (${x.group === 'unseen' ? x.source : CORPUS[x.group]})`,
      label: labelFor(x, m), S: x.scores[m.id].S, cur: x === ds,
    }));
    const seen = all.filter((x) => x.label === 'seen').map((x) => x.S);
    const unseen = all.filter((x) => x.label === 'unseen').map((x) => x.S);
    const label = labelFor(ds, m);
    let verdict;
    if (sc.S > Math.max(...unseen)) verdict = `Higher than all ${unseen.length} datasets ${esc(m.name)} was not trained on.`;
    else if (sc.S < Math.min(...seen)) verdict = `Lower than all ${seen.length} datasets ${esc(m.name)} was trained on, so it looks unseen.`;
    else verdict = `Overlaps with the other group: between the lowest seen score (${Math.min(...seen).toFixed(2)}) and the highest unseen score (${Math.max(...unseen).toFixed(2)}).`;

    $('#demo-score').innerHTML = `
      <div class="demo-score">
        <h4>${esc(ds.name)} <small class="demo-trained">${esc(ds.group === 'unseen' ? ds.source : CORPUS[ds.group])}</small> · ${esc(m.name)} <small class="demo-trained">trained on ${corpus}</small></h4>
        <div class="demo-formula">S(D) = hurt / (helped + hurt) = ${sc.hurt} / ${sc.helped + sc.hurt} = <span class="big">0.000</span></div>
        <div class="demo-axis">
          <div class="demo-axis-line"></div>
          ${[0, 0.25, 0.5, 0.75, 1].map((t) => `<span class="demo-axis-tick" style="left:${t * 100}%">${t}</span>`).join('')}
          ${all.map((x) => `<span class="demo-axis-dot ${x.label}${x.cur ? ' is-current' : ''}" style="left:0%" data-left="${x.S * 100}" title="${esc(x.name)}: ${x.S.toFixed(3)}"></span>`).join('')}
        </div>
        <div class="demo-axis-caption"><span>context helps</span><span>context hurts</span></div>
        <div class="demo-verdict">${verdict} Dataset-level AUC for ${esc(m.name)} (${seen.length} seen vs ${unseen.length} unseen datasets): <b>${auc(seen, unseen).toFixed(2)}</b>.</div>
      </div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.querySelectorAll('.demo-axis-dot').forEach((e) => (e.style.left = e.dataset.left + '%'));
    }));
    const el = $('#demo-score .big');
    const t0 = performance.now();
    const tick = (t) => {
      const p = reduceMotion ? 1 : Math.min(1, (t - t0) / 900);
      el.textContent = (sc.S * (1 - Math.pow(1 - p, 3))).toFixed(3);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  async function init() {
    try {
      const res = await fetch('static/data/demo.json');
      state.data = await res.json();
    } catch (e) {
      $('.demo-intro').textContent = 'The demo data could not be loaded.';
      return;
    }
    state.model = state.data.models[0].id;
    renderDatasets();
    renderModels();
    reset();
    $('#demo-run').addEventListener('click', runAudit);
    $('#demo-skip').addEventListener('click', () => (state.fast = true));
    $('#demo-strip').addEventListener('click', (e) => {
      const cell = e.target.closest('.demo-cell');
      if (cell && state.done) renderStatic(+cell.dataset.i);
    });
    const onPick = (e) => {
      const el = e.target.closest('.tk.is-pick');
      if (el && state.done) showInfo(+el.dataset.k);
    };
    $('#demo-target').addEventListener('mouseover', onPick);
    $('#demo-target').addEventListener('click', onPick);
  }

  init();
})();
