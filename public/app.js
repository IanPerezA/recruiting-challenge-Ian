// T1 Merchant Dashboard — UI logic.
// Look & feel ported from the Claude Design import (deliverables/claude-design/,
// "T1 Dashboard.dc.html"); all data comes from the real API (no demo pools).

/* ---------------- state ---------------- */

const blankFilters = () => ({
  email: '', status: 'any', type: 'any', min: '', max: '', from: '', to: '',
  sortBy: 'created_at', order: 'desc',
});

const state = {
  merchant: 'm_acme',
  applied: blankFilters(), // filters currently driving results
  draft: blankFilters(),   // filters being edited in the modal
  limit: 50,
  offset: 0,
  total: 0,
};

const $ = (id) => document.getElementById(id);

/* ---------------- helpers ---------------- */

function api(path) {
  return fetch(path, { headers: { 'X-Merchant-Id': state.merchant } });
}

function money(cents) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isoDay(d) {
  return d.toISOString().slice(0, 10);
}

const STATUS_LABELS = { completed: 'Completado', pending: 'Pendiente', failed: 'Fallido', refunded: 'Reembolsado' };
const statusLabel = (s) => STATUS_LABELS[s] ?? s;

/* ---------------- theme ---------------- */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('theme-icon').textContent = theme === 'dark' ? '☀' : '🌙';
  $('theme-label').textContent = theme === 'dark' ? 'Claro' : 'Oscuro';
  localStorage.setItem('t1-theme', theme);
}

$('theme-toggle').addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});
applyTheme(localStorage.getItem('t1-theme') === 'dark' ? 'dark' : 'light');

/* ---------------- merchant ---------------- */

function onMerchantChange(id) {
  state.merchant = id;
  $('merchant-select').value = id;
  $('merchant-select-mobile').value = id;
  const name = $('merchant-select').selectedOptions[0].textContent;
  $('merchant-name').textContent = name;
  $('merchant-avatar').textContent = name.charAt(0);
  state.offset = 0;
  refreshKpis();
  runSearch();
}

$('merchant-select').addEventListener('change', (e) => onMerchantChange(e.target.value));
$('merchant-select-mobile').addEventListener('change', (e) => onMerchantChange(e.target.value));

/* ---------------- KPIs ---------------- */

async function refreshKpis() {
  try {
    const summary = await (await api('/api/metrics/summary')).json();
    $('kpi-orders').textContent = summary.total_orders ?? '—';
    $('kpi-customers').textContent = summary.unique_customers ?? '—';
    $('kpi-aov').textContent = money(summary.avg_order_value_cents ?? 0);

    const now = new Date();
    const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const revenue = await (await api(`/api/revenue?from=${isoDay(thirtyAgo)}&to=${isoDay(now)}`)).json();
    $('kpi-revenue').textContent = money(revenue.revenue_cents ?? 0);
  } catch {
    // KPIs are non-blocking; the search section reports errors on its own.
  }
}

/* ---------------- search ---------------- */

function buildQuery() {
  const f = state.applied;
  const q = new URLSearchParams();
  if (f.email) q.set('customer_email', f.email);
  if (f.status !== 'any') q.set('status', f.status);
  if (f.type !== 'any') q.set('type', f.type);
  if (f.min !== '') q.set('min_amount', String(Number(f.min) * 100)); // dollars → cents
  if (f.max !== '') q.set('max_amount', String(Number(f.max) * 100));
  if (f.from) q.set('from', f.from);
  if (f.to) q.set('to', f.to);
  q.set('sort_by', f.sortBy);
  q.set('order', f.order);
  q.set('limit', String(state.limit));
  q.set('offset', String(state.offset));
  return q.toString();
}

function showState(which) {
  const map = { loading: 'state-loading', error: 'state-error', empty: 'state-empty', data: null };
  for (const id of ['state-loading', 'state-error', 'state-empty', 'state-table', 'state-cards']) {
    $(id).classList.add('hidden');
  }
  $('summary-row').classList.toggle('hidden', which !== 'data');
  $('pager').classList.toggle('hidden', which !== 'data');
  if (which === 'data') {
    $('state-table').classList.remove('hidden');
    $('state-cards').classList.remove('hidden');
  } else if (map[which]) {
    $(map[which]).classList.remove('hidden');
  }
}

function renderSkeleton() {
  const holder = $('skeleton-rows');
  holder.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const row = document.createElement('div');
    row.className = 'skel-row';
    row.style.animationDelay = `${i * 0.09}s`;
    row.innerHTML = `
      <div class="skel-bar" style="flex:2;"></div>
      <div class="skel-bar alt" style="flex:3;"></div>
      <div style="flex:2;"><div class="skel-pill" style="width:70px;"></div></div>
      <div style="flex:2;"><div class="skel-pill" style="width:80px;"></div></div>
      <div class="skel-bar" style="flex:1;"></div>`;
    holder.appendChild(row);
  }
}

function badge(kind, label) {
  const span = document.createElement('span');
  span.className = `badge ${kind}`;
  span.innerHTML = '<span class="bdot"></span>';
  span.appendChild(document.createTextNode(label));
  return span;
}

function renderRows(orders) {
  const tbody = $('results-tbody');
  const cards = $('state-cards');
  tbody.innerHTML = '';
  cards.innerHTML = '';

  for (const o of orders) {
    const isRefund = o.type === 'refund';
    const amountLabel = (isRefund ? '−' : '') + money(o.total_amount);
    const typeLabel = isRefund ? 'Reembolso' : 'Venta';

    const tr = document.createElement('tr');
    const tdDate = document.createElement('td'); tdDate.className = 'date'; tdDate.textContent = fmtDate(o.created_at);
    const tdEmail = document.createElement('td'); tdEmail.className = 'email'; tdEmail.textContent = o.customer_email;
    const tdType = document.createElement('td'); tdType.appendChild(badge(o.type, typeLabel));
    const tdStatus = document.createElement('td'); tdStatus.appendChild(badge(o.status, statusLabel(o.status)));
    const tdAmount = document.createElement('td'); tdAmount.className = `num amount${isRefund ? ' neg' : ''}`; tdAmount.textContent = amountLabel;
    tr.append(tdDate, tdEmail, tdType, tdStatus, tdAmount);
    tbody.appendChild(tr);

    const card = document.createElement('div');
    card.className = 'result-card';
    const top = document.createElement('div'); top.className = 'top';
    const cDate = document.createElement('span'); cDate.className = 'date'; cDate.textContent = fmtDate(o.created_at);
    const cAmount = document.createElement('span'); cAmount.className = `amount${isRefund ? ' neg' : ''}`; cAmount.textContent = amountLabel;
    top.append(cDate, cAmount);
    const cEmail = document.createElement('div'); cEmail.className = 'email'; cEmail.textContent = o.customer_email;
    const badges = document.createElement('div'); badges.className = 'badges';
    badges.append(badge(o.type, typeLabel), badge(o.status, statusLabel(o.status)));
    card.append(top, cEmail, badges);
    cards.appendChild(card);
  }
}

function renderChips() {
  const f = state.applied;
  const chips = [];
  if (f.email) chips.push({ key: 'email', label: `Cliente: ${f.email}` });
  if (f.status !== 'any') chips.push({ key: 'status', label: `Estado: ${statusLabel(f.status)}` });
  if (f.type !== 'any') chips.push({ key: 'type', label: `Tipo: ${f.type === 'sale' ? 'Venta' : 'Reembolso'}` });
  if (f.min !== '' || f.max !== '') {
    const label = f.min !== '' && f.max !== '' ? `$${f.min}–$${f.max}` : f.min !== '' ? `≥ $${f.min}` : `≤ $${f.max}`;
    chips.push({ key: 'amount', label: `Monto: ${label}` });
  }
  if (f.from || f.to) {
    const label = f.from && f.to ? `${f.from} → ${f.to}` : f.from ? `desde ${f.from}` : `hasta ${f.to}`;
    chips.push({ key: 'date', label: `Fecha: ${label}` });
  }

  const list = $('chips-list');
  list.innerHTML = '';
  for (const chip of chips) {
    const el = document.createElement('span');
    el.className = 'chip';
    el.textContent = chip.label;
    const x = document.createElement('button');
    x.setAttribute('aria-label', 'Quitar filtro');
    x.textContent = '×';
    x.addEventListener('click', () => removeChip(chip.key));
    el.appendChild(x);
    list.appendChild(el);
  }

  $('chips-row').classList.toggle('hidden', chips.length === 0);
  $('chip-count').classList.toggle('hidden', chips.length === 0);
  $('chip-count').textContent = String(chips.length);
}

function removeChip(key) {
  const b = blankFilters();
  if (key === 'amount') { state.applied.min = ''; state.applied.max = ''; }
  else if (key === 'date') { state.applied.from = ''; state.applied.to = ''; }
  else state.applied[key === 'email' ? 'email' : key] = b[key === 'email' ? 'email' : key];
  state.offset = 0;
  runSearch();
}

function clearAllFilters() {
  state.applied = blankFilters();
  state.offset = 0;
  runSearch();
}

let searchSeq = 0;

async function runSearch() {
  renderChips();
  renderSkeleton();
  showState('loading');
  const seq = ++searchSeq;
  try {
    const res = await api(`/api/orders/search?${buildQuery()}`);
    if (seq !== searchSeq) return; // a newer search superseded this one
    if (!res.ok) {
      let detail = `La solicitud a /api/orders/search falló (${res.status}).`;
      try {
        const body = await res.json();
        if (body.detail || body.error) detail += ` ${body.detail ?? body.error}`;
      } catch { /* non-JSON error body */ }
      $('error-detail').textContent = `${detail} Revisa los filtros e inténtalo de nuevo.`;
      showState('error');
      return;
    }
    const body = await res.json();
    state.total = body.pagination.total;
    if (state.total === 0) {
      showState('empty');
      return;
    }
    renderRows(body.data);
    const start = state.offset + 1;
    const end = Math.min(state.offset + state.limit, state.total);
    $('summary-text').textContent = `Mostrando ${start}–${end} de ${state.total}`;
    const page = Math.floor(state.offset / state.limit) + 1;
    const pages = Math.max(1, Math.ceil(state.total / state.limit));
    $('page-label').textContent = `Página ${page} de ${pages}`;
    $('prev-btn').disabled = state.offset === 0;
    $('next-btn').disabled = end >= state.total;
    showState('data');
  } catch {
    if (seq !== searchSeq) return;
    $('error-detail').textContent = 'No se pudo contactar al servidor. Revisa tu conexión e inténtalo de nuevo.';
    showState('error');
  }
}

/* ---------------- pagination ---------------- */

$('page-size').addEventListener('change', (e) => {
  state.limit = Number(e.target.value);
  state.offset = 0;
  runSearch();
});
$('prev-btn').addEventListener('click', () => {
  state.offset = Math.max(0, state.offset - state.limit);
  runSearch();
});
$('next-btn').addEventListener('click', () => {
  state.offset = state.offset + state.limit;
  runSearch();
});
$('retry-btn').addEventListener('click', runSearch);
$('empty-clear').addEventListener('click', clearAllFilters);
$('chips-clear').addEventListener('click', clearAllFilters);

/* ---------------- modal ---------------- */

const overlay = $('modal-overlay');
const modal = $('modal');
let lastFocused = null;

function segmentValue(groupId) {
  return $(groupId).querySelector('[aria-pressed="true"]').dataset.value;
}

function setSegment(groupId, value) {
  for (const btn of $(groupId).querySelectorAll('button')) {
    btn.setAttribute('aria-pressed', btn.dataset.value === value ? 'true' : 'false');
  }
}

for (const groupId of ['f-type', 'f-dir']) {
  $(groupId).addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) setSegment(groupId, btn.dataset.value);
  });
}

function fillModal(f) {
  $('f-email').value = f.email;
  $('f-status').value = f.status;
  setSegment('f-type', f.type);
  $('f-min').value = f.min;
  $('f-max').value = f.max;
  $('f-from').value = f.from;
  $('f-to').value = f.to;
  $('f-sort').value = f.sortBy;
  setSegment('f-dir', f.order);
  clearModalErrors();
}

function readModal() {
  return {
    email: $('f-email').value.trim(),
    status: $('f-status').value,
    type: segmentValue('f-type'),
    min: $('f-min').value.trim(),
    max: $('f-max').value.trim(),
    from: $('f-from').value,
    to: $('f-to').value,
    sortBy: $('f-sort').value,
    order: segmentValue('f-dir'),
  };
}

function clearModalErrors() {
  for (const id of ['f-email-err', 'f-min-err', 'f-max-err', 'f-date-err']) $(id).classList.add('hidden');
  for (const id of ['f-email', 'f-min-wrap', 'f-max-wrap', 'f-from', 'f-to']) $(id).classList.remove('invalid');
}

function fieldError(errId, targetId, message) {
  $(errId).textContent = `⚠ ${message}`;
  $(errId).classList.remove('hidden');
  $(targetId).classList.add('invalid');
}

/** Mirrors the server contract so most 400s are caught before the request. */
function validateModal(f) {
  clearModalErrors();
  let ok = true;
  const isInt = (v) => /^\d+$/.test(v);
  if (f.min !== '' && !isInt(f.min)) { fieldError('f-min-err', 'f-min-wrap', 'Ingresa un monto válido (entero ≥ 0)'); ok = false; }
  if (f.max !== '' && !isInt(f.max)) { fieldError('f-max-err', 'f-max-wrap', 'Ingresa un monto válido (entero ≥ 0)'); ok = false; }
  if (ok && f.min !== '' && f.max !== '' && Number(f.min) > Number(f.max)) {
    fieldError('f-max-err', 'f-max-wrap', 'El máximo debe ser ≥ al mínimo'); ok = false;
  }
  if (f.from && f.to && f.from > f.to) {
    fieldError('f-date-err', 'f-to', "La fecha 'hasta' debe ser posterior a 'desde'"); ok = false;
  }
  return ok;
}

function openModal() {
  state.draft = { ...state.applied };
  fillModal(state.draft);
  lastFocused = document.activeElement;
  overlay.classList.remove('hidden');
  setTimeout(() => { $('f-email').focus(); }, 40);
}

function closeModal() {
  overlay.classList.add('hidden');
  if (lastFocused) lastFocused.focus();
}

$('open-filters').addEventListener('click', openModal);
$('modal-close').addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

$('modal-apply').addEventListener('click', () => {
  const f = readModal();
  if (!validateModal(f)) return;
  state.applied = f;
  state.offset = 0;
  closeModal();
  runSearch();
});

$('modal-clear').addEventListener('click', () => {
  fillModal(blankFilters());
});

document.addEventListener('keydown', (e) => {
  if (overlay.classList.contains('hidden')) return;
  if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
  if (e.key !== 'Tab') return;
  // focus trap
  const items = [...modal.querySelectorAll('input, select, button')].filter((x) => !x.disabled && x.offsetParent !== null);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ---------------- boot ---------------- */

refreshKpis();
runSearch();
