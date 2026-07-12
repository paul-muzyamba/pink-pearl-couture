/* ================================================================
   PINK PEARL COUTURE ZM — BARCODE LABELS
   File: assets/js/barcode.js

   Depends on: supabase-client.js, JsBarcode (loaded before this file)
   Reuses the same admin session as admin.js (sessionStorage key
   'ppc_admin_session') so signing into either page signs into both.
================================================================ */

let SESSION      = null;
let ALL_PRODUCTS = [];
let SELECTED     = new Set(); // product ids chosen for printing

/* ── Auth (mirrors admin.js) ─────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('ppc_admin_session');
  if (saved) {
    try {
      SESSION = JSON.parse(saved);
      showDashboard();
    } catch (_) { showLogin(); }
  } else {
    showLogin();
  }
});

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  const btn   = document.getElementById('loginBtn');
  const err   = document.getElementById('loginError');
  err.style.display = 'none';

  if (!email || !pass) {
    showLoginError('Please enter your email and password.');
    return;
  }

  btn.textContent = 'Signing in…';
  btn.disabled = true;
  try {
    SESSION = await window.PPC_DB.adminSignIn(email, pass);
    sessionStorage.setItem('ppc_admin_session', JSON.stringify(SESSION));
    showDashboard();
  } catch (e) {
    showLoginError(e.message || 'Login failed. Check your credentials.');
  } finally {
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
}

async function doSignOut() {
  if (SESSION?.access_token) {
    await window.PPC_DB.adminSignOut(SESSION.access_token).catch(() => {});
  }
  SESSION = null;
  sessionStorage.removeItem('ppc_admin_session');
  location.reload();
}

function showLoginError(msg) {
  const el = document.getElementById('loginError');
  el.textContent = msg;
  el.style.display = 'block';
}

['loginEmail', 'loginPassword'].forEach(id => {
  document.getElementById(id)
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
});

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboard').style.display   = 'none';
}

async function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display   = 'grid';
  document.getElementById('adminEmail').textContent =
    SESSION?.user?.email || '';
  await loadProducts();
}

/* ── Sidebar toggle (mobile, mirrors admin.js) ───────────────── */
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
  document.getElementById('navToggle').classList.toggle('open');
}
function closeSidebar() {
  document.querySelector('.sidebar').classList.remove('open');
  document.getElementById('navToggle').classList.remove('open');
}

/* ── Load products ────────────────────────────────────────────── */
async function loadProducts() {
  const list = document.getElementById('skuList');
  list.innerHTML = Array(5).fill('<div class="skeleton-row"></div>').join('');
  try {
    ALL_PRODUCTS = await window.PPC_DB.adminGetAllProducts(SESSION.access_token);
    renderList();
  } catch (e) {
    list.innerHTML = `<div class="stock-list-empty">⚠️ Could not load products: ${escapeHtml(e.message)}</div>`;
  }
}

function filterList() {
  renderList();
}

function getFiltered() {
  const q   = document.getElementById('skuSearch').value.trim().toLowerCase();
  const cat = document.getElementById('skuCatFilter').value;
  const need = document.getElementById('skuOnlyMissing').checked;

  return ALL_PRODUCTS.filter(p => {
    if (cat !== 'all' && p.category !== cat) return false;
    if (need && p.sku) return false;
    if (q && !p.name.toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderList() {
  const items = getFiltered();
  const list  = document.getElementById('skuList');

  if (items.length === 0) {
    list.innerHTML = '<div class="stock-list-empty">No items match. Try clearing filters.</div>';
    updatePrintBar();
    return;
  }

  list.innerHTML = items.map(p => {
    const thumb = p.image_url
      ? `<img src="${p.image_url}" alt="">`
      : `<span>${p.emoji || '🛍️'}</span>`;
    const hasSku = !!p.sku;
    const checked = SELECTED.has(p.id) ? 'checked' : '';
    return `
      <div class="sku-row ${SELECTED.has(p.id) ? 'selected' : ''}" data-id="${p.id}">
        <input type="checkbox" class="sku-row__check" ${checked}
               onchange="toggleSelect('${p.id}', this.checked)">
        <div class="sku-row__thumb">${thumb}</div>
        <div class="sku-row__info">
          <div class="sku-row__name">${escapeHtml(p.name)}</div>
          <div class="sku-row__price">K${p.price_zmw}</div>
        </div>
        <div class="sku-row__field">
          <input type="text" placeholder="Assign SKU…" value="${escapeHtml(p.sku || '')}"
                 class="${hasSku ? 'assigned' : ''}"
                 id="sku-input-${p.id}"
                 onkeydown="if(event.key==='Enter') saveSku('${p.id}')">
          <button class="sku-save" onclick="saveSku('${p.id}')">${hasSku ? 'Update' : 'Save'}</button>
        </div>
        <div class="sku-row__qty">
          <input type="number" min="1" value="1" id="qty-${p.id}" title="Copies to print">
        </div>
      </div>
    `;
  }).join('');

  updatePrintBar();
}

function toggleSelect(id, checked) {
  if (checked) SELECTED.add(id); else SELECTED.delete(id);
  document.querySelector(`.sku-row[data-id="${id}"]`)?.classList.toggle('selected', checked);
  updatePrintBar();
}

function selectAllVisible() {
  getFiltered().forEach(p => { if (p.sku) SELECTED.add(p.id); });
  renderList();
}

function clearSelection() {
  SELECTED.clear();
  renderList();
}

function updatePrintBar() {
  document.getElementById('printCount').textContent = SELECTED.size;
}

/* ── Save a SKU back to Supabase ─────────────────────────────── */
async function saveSku(id) {
  const input = document.getElementById(`sku-input-${id}`);
  const value = input.value.trim();
  if (!value) { alert('Enter a SKU / barcode number first.'); return; }

  const dup = ALL_PRODUCTS.find(p => p.id !== id && p.sku === value);
  if (dup) {
    alert(`That SKU is already assigned to "${dup.name}". Each item needs its own unique number.`);
    return;
  }

  try {
    const updated = await window.PPC_DB.adminUpdateProduct(id, { sku: value }, SESSION.access_token);
    const idx = ALL_PRODUCTS.findIndex(p => p.id === id);
    if (idx > -1) ALL_PRODUCTS[idx] = updated;
    input.classList.add('assigned');
    input.closest('.sku-row').querySelector('.sku-save').textContent = 'Update';
  } catch (e) {
    alert('Could not save: ' + e.message);
  }
}

/* ── Print selected labels ───────────────────────────────────── */
function printSelected() {
  if (SELECTED.size === 0) {
    alert('Tick at least one item to print labels for.');
    return;
  }

  const missing = [...SELECTED]
    .map(id => ALL_PRODUCTS.find(p => p.id === id))
    .filter(p => p && !p.sku);
  if (missing.length > 0) {
    alert(`These selected items still need a SKU assigned first:\n\n${missing.map(p => '• ' + p.name).join('\n')}`);
    return;
  }

  const w = document.getElementById('labelW').value || 40;
  const h = document.getElementById('labelH').value || 30;
  document.documentElement.style.setProperty('--label-w', w + 'mm');
  document.documentElement.style.setProperty('--label-h', h + 'mm');

  const printArea = document.getElementById('printArea');
  printArea.innerHTML = '';

  [...SELECTED].forEach(id => {
    const p   = ALL_PRODUCTS.find(pp => pp.id === id);
    const qty = parseInt(document.getElementById(`qty-${id}`)?.value) || 1;

    for (let i = 0; i < qty; i++) {
      const div = document.createElement('div');
      div.className = 'print-label';

      const nameEl = document.createElement('div');
      nameEl.className = 'print-label__name';
      nameEl.innerText = p.name;
      div.appendChild(nameEl);

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      div.appendChild(svg);

      const priceEl = document.createElement('div');
      priceEl.className = 'print-label__price';
      priceEl.innerText = `K${p.price_zmw}`;
      div.appendChild(priceEl);

      printArea.appendChild(div);

      try {
        JsBarcode(svg, p.sku, {
          format: 'CODE128',
          displayValue: true,
          fontSize: 12,
          height: 40,
          margin: 2,
        });
      } catch (e) {
        svg.outerHTML = `<div style="color:red;font-size:9px;">Invalid SKU</div>`;
      }
    }
  });

  setTimeout(() => window.print(), 150);
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.innerText = str ?? '';
  return d.innerHTML;
}
