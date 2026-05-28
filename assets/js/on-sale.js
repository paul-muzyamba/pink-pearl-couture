/* ================================================================
   PINK PEARL COUTURE ZM — ON SALE PAGE LOGIC (Supabase version)
   File: assets/js/on-sale.js
   
/* ── Cloudinary config ──────────────────────────────────────── */
const CLOUD_NAME    = 'YOUR_CLOUDINARY_CLOUD_NAME'; // e.g. 'dxyz123abc'

/* ── State ──────────────────────────────────────────────────── */
let activeCategory = 'all';
let searchTimer    = null;
let allItems       = [];   // cached full list from Supabase

/* ── Bootstrap ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadAll();

  document.getElementById('searchInput')
    .addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(applyFilters, 280);
    });
});

/* ── Fetch all in-stock items once, cache locally ───────────── */
async function loadAll() {
  showLoading();
  try {
    allItems = await window.PPC_DB.getStockItems();
    applyFilters();
  } catch (err) {
    showError(err.message);
  }
}

/* ── Filter cached items by category + search term ─────────── */
function applyFilters() {
  const query = (document.getElementById('searchInput').value || '')
    .toLowerCase().trim();

  const filtered = allItems.filter(item => {
    const catMatch = activeCategory === 'all' || item.category === activeCategory;
    const txtMatch = !query || item.name.toLowerCase().includes(query);
    return catMatch && txtMatch;
  });

  renderGrid(filtered);
}

/* ── Category button handler ────────────────────────────────── */
function setCategory(btn, cat) {
  document.querySelectorAll('.catalogue__filters .filter-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = cat;
  applyFilters();
}
window.setCategory = setCategory; // expose for inline onclick

/* ── Render helpers ─────────────────────────────────────────── */
function renderGrid(items) {
  const grid  = document.getElementById('stockGrid');
  const empty = document.getElementById('stockEmpty');
  const count = document.getElementById('stockCount');

  if (!items.length) {
    grid.innerHTML       = '';
    empty.style.display  = 'block';
    count.textContent    = '';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML      = items.map(buildCard).join('');
  count.textContent   =
    `${items.length} piece${items.length !== 1 ? 's' : ''} available`;

  /* Scroll-reveal for freshly injected cards */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  grid.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function buildCard(item) {
  const badgeHTML = item.badge
    ? `<div class="product-card__badge ${item.badge_type || ''}">${item.badge}</div>`
    : '';

  /* Image: use Cloudinary URL with auto width optimisation, or emoji fallback */
  const imgHTML = item.image_url
    ? `<img
         src="${cloudinaryThumb(item.image_url, 480)}"
         alt="${item.name}"
         loading="lazy"
         class="product-card__photo"
       />`
    : `<div class="product-card__emoji">${item.emoji || '🛍️'}</div>`;

  const colorDots = (item.colors || []).map(c => {
    const border = (c === '#fff' || c === '#ffffff') ? 'border:1.5px solid #ccc;' : '';
    return `<div class="product-card__color" style="background:${c};${border}"></div>`;
  }).join('');

  const colorsHTML = colorDots
    ? `<div class="product-card__colors">${colorDots}</div>`
    : '';

  const bgClass = item.bg_class || '';
  const bgStyle = bgClass ? '' : 'background:#f7f2f4;';

  const storeBadge = item.store_location && item.store_location !== 'both'
    ? `<div class="product-card__store">${
        item.store_location === 'northmead' ? '📍 Northmead' : '📍 Chilenje'
      }</div>`
    : '';

  const waMsg = encodeURIComponent(
    `Hi, I'm interested in the ${item.name} (K${item.price_zmw}). Is it still available?`
  );

  return `
    <div class="product-card reveal" data-id="${item.id}" data-cat="${item.category}">
      <div class="product-card__img ${bgClass}" style="${bgStyle}">
        ${imgHTML}
        ${badgeHTML}
        ${storeBadge}
        <a href="https://wa.me/260979690009?text=${waMsg}"
           target="_blank"
           class="product-card__wa"
           title="Order on WhatsApp">💬</a>
      </div>
      <div class="product-card__name">${item.name}</div>
      <div class="product-card__meta">
        <div class="product-card__price"><span>ZMW</span> K${item.price_zmw}</div>
        ${colorsHTML}
      </div>
    </div>`;
}

/* Returns a Cloudinary URL resized to w px, auto format+quality */
function cloudinaryThumb(url, w) {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/w_${w},f_auto,q_auto/`);
}

function showLoading() {
  document.getElementById('stockGrid').innerHTML = `
    <div class="stock-loading">
      <div class="stock-loading__spinner"></div>
      <p>Loading latest stock…</p>
    </div>`;
  document.getElementById('stockEmpty').style.display = 'none';
  document.getElementById('stockCount').textContent   = '';
}

function showError(msg) {
  document.getElementById('stockGrid').innerHTML = `
    <div class="stock-error">
      <p>⚠️ Could not load stock right now. Please refresh or
         <a href="https://wa.me/260979690009">WhatsApp us</a> directly.</p>
      <small>${msg}</small>
    </div>`;
}
