/* ================================================================
   PINK PEARL COUTURE ZM — SUPABASE CLIENT
   File: assets/data/supabase-client.js
================================================================ */

const SUPABASE_URL  = 'https://xzyeovhdkntagnzbyuhb.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eWVvdmhka250YWduemJ5dWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMTkwNTksImV4cCI6MjA5NTc5NTA1OX0.GvxSVxGdYFZ-ufNp1Goq4yw8uuh5B54QZw_OO8v51uU';

/* ── Internal helper ─────────────────────────────────────────── */
async function _request(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    'apikey':        SUPABASE_ANON,
    'Authorization': `Bearer ${options._token || SUPABASE_ANON}`,
    'Content-Type':  'application/json',
    'Prefer':        options._prefer || 'return=representation',
    ...options.headers,
  };
  delete options._token;
  delete options._prefer;
  delete options.headers;

  const res = await fetch(url, { headers, ...options });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ── PUBLIC API (storefront — no auth needed) ─────────────────── */

/**
 * Fetch all in-stock items, optionally filtered by category.
 * Ordered by sort_order ASC then created_at DESC.
 * @param {string} [category] - e.g. 'dresses'. Omit for all.
 * @returns {Promise<Array>}
 */
async function getStockItems(category = null) {
  let path = 'products?select=*&in_stock=eq.true&order=sort_order.asc,created_at.desc';
  if (category && category !== 'all') {
    path += `&category=eq.${encodeURIComponent(category)}`;
  }
  return _request(path);
}

/**
 * Full-text search across name field.
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function searchStock(query) {
  const q = encodeURIComponent(query.trim());
  return _request(
    `products?select=*&in_stock=eq.true&name=ilike.*${q}*&order=sort_order.asc`
  );
}

/* ── ADMIN API (requires auth token) ────────────────────────── */

/**
 * Sign in an admin with email + password.
 * Returns the session object (contains access_token).
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{access_token:string, user:object}>}
 */
async function adminSignIn(email, password) {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method:  'POST',
      headers: {
        'apikey':       SUPABASE_ANON,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Login failed');
  return data;
}

/**
 * Sign out (invalidates the token server-side).
 * @param {string} token
 */
async function adminSignOut(token) {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method:  'POST',
    headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${token}` },
  });
}

/**
 * Fetch ALL products for the admin panel (including out-of-stock).
 * @param {string} token
 * @returns {Promise<Array>}
 */
async function adminGetAllProducts(token) {
  return _request(
    'products?select=*&order=sort_order.asc,created_at.desc',
    { _token: token }
  );
}

/**
 * Create a new product.
 * @param {object} data  - product fields (see schema)
 * @param {string} token
 * @returns {Promise<object>} created row
 */
async function adminCreateProduct(data, token) {
  return _request('products', {
    method: 'POST',
    body:   JSON.stringify(data),
    _token: token,
    _prefer: 'return=representation',
  }).then(rows => rows[0]);
}

/**
 * Update an existing product by UUID.
 * @param {string} id    - product UUID
 * @param {object} data  - fields to update
 * @param {string} token
 * @returns {Promise<object>} updated row
 */
async function adminUpdateProduct(id, data, token) {
  return _request(`products?id=eq.${id}`, {
    method: 'PATCH',
    body:   JSON.stringify(data),
    _token: token,
    _prefer: 'return=representation',
  }).then(rows => rows[0]);
}

/**
 * Toggle in_stock boolean.
 * @param {string}  id
 * @param {boolean} inStock
 * @param {string}  token
 */
async function adminToggleStock(id, inStock, token) {
  return adminUpdateProduct(id, { in_stock: inStock }, token);
}

/**
 * Delete a product permanently.
 * @param {string} id
 * @param {string} token
 */
async function adminDeleteProduct(id, token) {
  return _request(`products?id=eq.${id}`, {
    method: 'DELETE',
    _token: token,
    _prefer: 'return=minimal',
  });
}

/**
 * Upload an image to Cloudinary.
 * Returns the secure_url of the uploaded image.
 * @param {File}   file
 * @param {string} uploadPreset  - your Cloudinary unsigned upload preset name
 * @param {string} cloudName     - your Cloudinary cloud name
 * @returns {Promise<string>} image URL
 */
async function uploadImage(file, uploadPreset, cloudName) {
  const formData = new FormData();
  formData.append('file',         file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder',       'pink-pearl-couture');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

/* ── Expose to window for non-module scripts ─────────────────── */
window.PPC_DB = {
  getStockItems,
  searchStock,
  adminSignIn,
  adminSignOut,
  adminGetAllProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminToggleStock,
  adminDeleteProduct,
  uploadImage,
};
