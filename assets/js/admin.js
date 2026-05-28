/* ================================================================
   PINK PEARL COUTURE ZM — ADMIN PANEL LOGIC
   File: assets/js/admin.js

   Depends on: supabase-client.js (loaded before this file)
================================================================ */

const CLOUDINARY_CLOUD_NAME    = 'dowrrjvdv';
const CLOUDINARY_UPLOAD_PRESET = 'pink-pearl-couture'; // unsigned preset

/* ── Session state ──────────────────────────────────────────── */
let SESSION       = null;   // { access_token, user }
let ALL_PRODUCTS  = [];     // full admin product list (cached)
let pendingDeleteId = null; // UUID awaiting confirm dialog
let newPhotoFile  = null;   // File object from photo input
let newPhotoURL   = null;   // Cloudinary URL after upload

/* ── On load: check sessionStorage for persisted session ────── */
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

  /* Colour preview watcher */
  document.getElementById('fColors')
    .addEventListener('input', renderColorPreview);
});

/* ════════════════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════════════════ */

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
  btn.disabled    = true;

  try {
    SESSION = await window.PPC_DB.adminSignIn(email, pass);
    sessionStorage.setItem('ppc_admin_session', JSON.stringify(SESSION));
    showDashboard();
  } catch (e) {
    showLoginError(e.message || 'Login failed. Check your credentials.');
  } finally {
    btn.textContent = 'Sign In';
    btn.disabled    = false;
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
  el.textContent    = msg;
  el.style.display  = 'block';
}

/* Allow Enter key on login form */
['loginEmail','loginPassword'].forEach(id => {
  document.getElementById(id)
    .addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
});

/* ════════════════════════════════════════════════════════════
   LAYOUT SWITCHING
════════════════════════════════════════════════════════════ */

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboard').style.display   = 'none';
}

async function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display   = 'grid';
  document.getElementById('adminEmail').textContent    =
    SESSION?.user?.email || '';

  await loadAdminProducts();
  showView('stock');
}

function showView(view) {
  ['stock','add'].forEach(v => {
    document.getElementById(`view${capitalize(v)}`).style.display =
      v === view ? 'block' : 'none';
  });
  ['navStock','navAdd'].forEach(id => {
    document.getElementById(id).classList.toggle(
      'active',
      id === `nav${capitalize(view)}`
    );
  });

  if (view === 'add') {
    /* Ensure we're in "add" mode (not leftover edit state) */
    if (!document.getElementById('editId').value) resetForm();
  }
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ════════════════════════════════════════════════════════════
   LOAD + RENDER PRODUCT LIST
════════════════════════════════════════════════════════════ */

async function loadAdminProducts() {
  renderSkeletons();
  try {
    ALL_PRODUCTS = await window.PPC_DB.adminGetAllProducts(SESSION.access_token);
    renderStats();
    renderStockList(ALL_PRODUCTS);
  } catch (e) {
    document.getElementById('stockList').innerHTML =
      `<div class="stock-list-empty">⚠️ Could not load products: ${e.message}</div>`;
  }
}

function renderSkeletons() {
  const list = document.getElementById('stockList');
  list.innerHTML = Array(5).fill(
    '<div class="skeleton-row"></div>'
  ).join('');
}

function renderStats() {
  const inStock = ALL_PRODUCTS.filter(p => p.in_stock).length;
  const cats    = new Set(ALL_PRODUCTS.map(p => p.category)).size;
  document.getElementById('statTotal').textContent      = ALL_PRODUCTS.length;
  document.getElementById('statInStock').textContent    = inStock;
  document.getElementById('statOutStock').textContent   = ALL_PRODUCTS.length - inStock;
  document.getElementById('statCategories').textContent = cats;
}

function filterAdminList() {
  const q   = (document.getElementById('adminSearch').value || '').toLowerCase();
  const cat = document.getElementById('adminCatFilter').value;
  const filtered = ALL_PRODUCTS.filter(p => {
    const catMatch = cat === 'all' || p.category === cat;
    const txtMatch = !q || p.name.toLowerCase().includes(q);
    return catMatch && txtMatch;
  });
  renderStockList(filtered);
}

function renderStockList(items) {
  const list = document.getElementById('stockList');
  if (!items.length) {
    list.innerHTML = '<div class="stock-list-empty">No items found.</div>';
    return;
  }
  list.innerHTML = items.map(buildRow).join('');
}

function buildRow(item) {
  const thumb = item.image_url
    ? `<img src="${item.image_url.replace('/upload/','/upload/w_80,h_80,c_fill,f_auto/')}" alt="${item.name}" />`
    : `<div class="stock-row__thumb-emoji">${item.emoji || '🛍️'}</div>`;

  const statusClass = item.in_stock ? 'in' : 'out';
  const statusLabel = item.in_stock ? '● In Stock' : '● Sold Out';

  const toggleLabel = item.in_stock ? '🚫 Mark Sold' : '✅ Mark In Stock';
  const toggleClass = item.in_stock ? 'toggle-off' : 'toggle-on';

  const loc = item.store_location === 'both' ? 'Both Stores'
    : item.store_location === 'northmead' ? 'Northmead'
    : 'Chilenje';

  return `
    <div class="stock-row" data-id="${item.id}">
      <div class="stock-row__thumb">${thumb}</div>
      <div class="stock-row__info">
        <div class="stock-row__name">${item.name}</div>
        <div class="stock-row__meta">
          <div class="stock-row__price">K${item.price_zmw}</div>
          <div class="stock-row__cat">${item.category}</div>
          <div class="stock-row__location">📍 ${loc}</div>
          <div class="stock-row__status ${statusClass}">${statusLabel}</div>
        </div>
      </div>
      <div class="stock-row__actions">
        <button class="action-btn edit" onclick="startEdit('${item.id}')">✏️ Edit</button>
        <button class="action-btn ${toggleClass}" onclick="toggleStock('${item.id}', ${!item.in_stock})">${toggleLabel}</button>
        <button class="action-btn del" onclick="confirmDelete('${item.id}', '${item.name.replace(/'/g,"\\'")}')">🗑️</button>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════
   QUICK TOGGLE (in-stock without opening the form)
════════════════════════════════════════════════════════════ */

async function toggleStock(id, newState) {
  try {
    await window.PPC_DB.adminToggleStock(id, newState, SESSION.access_token);
    await loadAdminProducts();
  } catch (e) {
    alert('Could not update stock status: ' + e.message);
  }
}

/* ════════════════════════════════════════════════════════════
   ADD / EDIT FORM
════════════════════════════════════════════════════════════ */

function startEdit(id) {
  const item = ALL_PRODUCTS.find(p => p.id === id);
  if (!item) return;

  document.getElementById('formTitle').textContent    = 'Edit Item';
  document.getElementById('editId').value             = item.id;
  document.getElementById('fName').value              = item.name;
  document.getElementById('fCategory').value          = item.category;
  document.getElementById('fPrice').value             = item.price_zmw;
  document.getElementById('fLocation').value          = item.store_location || 'both';
  document.getElementById('fBadge').value             = item.badge || '';
  document.getElementById('fBadgeType').value         = item.badge_type || '';
  document.getElementById('fBgClass').value           = item.bg_class || '';
  document.getElementById('fSortOrder').value         = item.sort_order ?? 0;
  document.getElementById('fColors').value            = (item.colors || []).join(', ');
  document.getElementById('fEmoji').value             = item.emoji || '';
  document.getElementById('fInStock').checked         = item.in_stock;

  newPhotoFile = null;
  newPhotoURL  = item.image_url || null;

  if (item.image_url) {
    document.getElementById('currentPhoto').style.display    = 'flex';
    document.getElementById('currentPhotoImg').src           = item.image_url;
    document.getElementById('uploadArea').style.display      = 'none';
  } else {
    document.getElementById('currentPhoto').style.display    = 'none';
    document.getElementById('uploadArea').style.display      = 'block';
  }

  renderColorPreview();
  hideFormMessages();
  showView('add');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  document.getElementById('formTitle').textContent = 'Add New Item';
  document.getElementById('editId').value          = '';
  ['fName','fPrice','fBadge','fColors','fEmoji','fSortOrder'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('fCategory').value  = '';
  document.getElementById('fLocation').value  = 'both';
  document.getElementById('fBadgeType').value = '';
  document.getElementById('fBgClass').value   = '';
  document.getElementById('fInStock').checked = true;
  document.getElementById('fPhoto').value     = '';
  newPhotoFile = null;
  newPhotoURL  = null;
  document.getElementById('currentPhoto').style.display = 'none';
  document.getElementById('uploadArea').style.display   = 'block';
  document.getElementById('colorPreview').innerHTML     = '';
  hideFormMessages();
}

function cancelEdit() {
  resetForm();
  showView('stock');
}

function previewPhoto(input) {
  if (!input.files || !input.files[0]) return;
  newPhotoFile = input.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('currentPhotoImg').src        = e.target.result;
    document.getElementById('currentPhoto').style.display = 'flex';
    document.getElementById('uploadArea').style.display   = 'none';
  };
  reader.readAsDataURL(newPhotoFile);
}

function removePhoto() {
  newPhotoFile = null;
  newPhotoURL  = null;
  document.getElementById('fPhoto').value               = '';
  document.getElementById('currentPhoto').style.display = 'none';
  document.getElementById('uploadArea').style.display   = 'block';
}

function renderColorPreview() {
  const raw   = document.getElementById('fColors').value;
  const prev  = document.getElementById('colorPreview');
  const hexes = raw.split(',').map(s => s.trim()).filter(s => /^#[0-9a-fA-F]{3,6}$/.test(s));
  prev.innerHTML = hexes.map(c => {
    const border = (c === '#fff' || c === '#ffffff') ? `border:1.5px solid #ccc;` : '';
    return `<div class="color-preview__dot" style="background:${c};${border}" title="${c}"></div>`;
  }).join('');
}

async function saveItem() {
  hideFormMessages();

  const id       = document.getElementById('editId').value;
  const name     = document.getElementById('fName').value.trim();
  const category = document.getElementById('fCategory').value;
  const priceRaw = document.getElementById('fPrice').value;

  /* ── Validation ── */
  if (!name)     { showFormError('Product name is required.'); return; }
  if (!category) { showFormError('Please select a category.'); return; }
  if (!priceRaw || isNaN(Number(priceRaw)) || Number(priceRaw) < 0) {
    showFormError('Please enter a valid price.');
    return;
  }

  const btn = document.getElementById('saveBtn');
  const lbl = document.getElementById('saveBtnText');
  btn.disabled  = true;
  lbl.textContent = '⏳ Saving…';

  try {

    /* ── Upload photo if a new one was selected ── */
    if (newPhotoFile) {
      lbl.textContent = '📸 Uploading photo…';
      newPhotoURL = await window.PPC_DB.uploadImage(
        newPhotoFile,
        CLOUDINARY_UPLOAD_PRESET,
        CLOUDINARY_CLOUD_NAME
      );
    }

    /* ── Build payload ── */
    const colorsRaw = document.getElementById('fColors').value;
    const colors = colorsRaw
      .split(',')
      .map(s => s.trim())
      .filter(s => /^#[0-9a-fA-F]{3,6}$/.test(s));

    const payload = {
      name,
      category,
      price_zmw:      Number(priceRaw),
      store_location: document.getElementById('fLocation').value,
      badge:          document.getElementById('fBadge').value.trim(),
      badge_type:     document.getElementById('fBadgeType').value,
      bg_class:       document.getElementById('fBgClass').value,
      sort_order:     Number(document.getElementById('fSortOrder').value || 0),
      colors,
      emoji:          document.getElementById('fEmoji').value.trim(),
      in_stock:       document.getElementById('fInStock').checked,
      image_url:      newPhotoURL || null,
    };

    lbl.textContent = '💾 Saving…';

    if (id) {
      await window.PPC_DB.adminUpdateProduct(id, payload, SESSION.access_token);
      showFormSuccess('✅ Item updated successfully!');
    } else {
      await window.PPC_DB.adminCreateProduct(payload, SESSION.access_token);
      showFormSuccess('✅ New item added to the live site!');
      resetForm();
    }

    /* Refresh the cached list */
    ALL_PRODUCTS = await window.PPC_DB.adminGetAllProducts(SESSION.access_token);
    renderStats();

  } catch (e) {
    showFormError('Save failed: ' + e.message);
  } finally {
    btn.disabled    = false;
    lbl.textContent = '💾 Save Item';
  }
}

/* ════════════════════════════════════════════════════════════
   DELETE
════════════════════════════════════════════════════════════ */

function confirmDelete(id, name) {
  pendingDeleteId = id;
  document.getElementById('confirmMsg').textContent =
    `"${name}" will be permanently deleted. This cannot be undone.`;
  document.getElementById('confirmOverlay').style.display = 'flex';
  document.getElementById('confirmYes').onclick = executeDelete;
}

function closeConfirm() {
  pendingDeleteId = null;
  document.getElementById('confirmOverlay').style.display = 'none';
}

async function executeDelete() {
  closeConfirm();
  if (!pendingDeleteId) return;
  try {
    await window.PPC_DB.adminDeleteProduct(pendingDeleteId, SESSION.access_token);
    await loadAdminProducts();
  } catch (e) {
    alert('Delete failed: ' + e.message);
  }
}

/* Close confirm on overlay click */
document.getElementById('confirmOverlay')
  .addEventListener('click', e => {
    if (e.target === document.getElementById('confirmOverlay')) closeConfirm();
  });

/* ── Form message helpers ────────────────────────────────── */
function showFormError(msg) {
  const el = document.getElementById('formError');
  el.textContent   = msg;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showFormSuccess(msg) {
  const el = document.getElementById('formSuccess');
  el.textContent   = msg;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

function hideFormMessages() {
  document.getElementById('formError').style.display   = 'none';
  document.getElementById('formSuccess').style.display = 'none';
}

/* Expose to window for inline onclick handlers */
window.showView      = showView;
window.doLogin       = doLogin;
window.doSignOut     = doSignOut;
window.startEdit     = startEdit;
window.cancelEdit    = cancelEdit;
window.saveItem      = saveItem;
window.toggleStock   = toggleStock;
window.confirmDelete = confirmDelete;
window.closeConfirm  = closeConfirm;
window.removePhoto   = removePhoto;
window.previewPhoto  = previewPhoto;
window.filterAdminList = filterAdminList;
