<div align="center">

# 💗 Pink Pearl Couture ZM
### The Mwiinga Store

**Lusaka's home of feminine fashion.**

[![Live Site](https://img.shields.io/badge/Live%20Site-Visit-c4506a?style=for-the-badge)](https://pink-pearl-couture.netlify.app)

[![WhatsApp](https://img.shields.io/badge/WhatsApp-Order-25d366?style=for-the-badge)](https://wa.me/260979690009)


</div>

---

## What This Is

A live fashion boutique website for Pink Pearl Couture ZM. The homepage showcases the brand with real product photography — hero grid, gallery strip, curated collection cards, about masonry, and an in-store video reel. The On Sale page pulls currently available in-store stock in real time from a Supabase database. Admins manage all stock — adding items, uploading photos, setting prices, toggling availability — through a password-protected dashboard. Customers order via WhatsApp directly from each product card.

---

## Homepage Image Assets

Product photos and the in-store reel live in `assets/images/gallery/`. They are referenced from `index.html` and `on-sale.html` as `./assets/images/gallery/...`.

**Homepage sections using gallery assets:**

| Section | What it shows |
|---|---|
| Hero grid | 4 featured looks in a 2×2 photo grid |
| Gallery strip | 8 expandable panels with WhatsApp enquire links |
| The Edit | Curated product cards (dresses, bags, shoes) |
| About | 4-photo editorial masonry grid |
| In-store reel | Vertical WhatsApp video (`9:16`) |
| On Sale hero | 4-image cinematic background collage |

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Database | [Supabase](https://supabase.com) | Free PostgreSQL with REST API, auth, and Row Level Security built in |
| Images | [Cloudinary](https://cloudinary.com) | Free image hosting with auto-compression and mobile upload |
| Frontend | Vanilla HTML + CSS + JS | No build step — works anywhere, deploys instantly |
| Homepage images | Local `assets/images/gallery/` | Real product photos synced from the store gallery folder |
| Ordering | WhatsApp `wa.me` links | Direct to store, no payment gateway needed |

---

## Repository Structure

```
pink-pearl-couture-prototype/
│
├── index.html                  Homepage — hero, gallery, collection, about, reel, contact
├── on-sale.html                Live stock page — pulls from Supabase in real time
├── admin.html                  Admin dashboard — login-protected CRUD panel
├── supabase-schema.sql         Run once in Supabase SQL Editor to create the DB
├── README.md                   This file
│
└── assets/
    ├── css/
    │   ├── style.css           Global design system — shared by all pages
    │   ├── on-sale.css         Styles unique to the On Sale page
    │   └── admin.css           Styles unique to the Admin dashboard
    ├── js/
    │   ├── main.js             Shared: navbar scroll, hamburger, reveal animation
    │   ├── on-sale.js          On Sale page: async Supabase fetch and render
    │   └── admin.js            Admin: auth, CRUD, photo upload logic
    ├── data/
    │   └── supabase-client.js  All database + Cloudinary API calls (configure here)
    └── images/
        └── gallery/            Product photos + in-store video (commit before deploy)
```

---

## First-Time Setup

Complete these steps once, in order. Total time: approximately 25 minutes.

---

### 1. Supabase — Create the database

1. Go to [supabase.com](https://supabase.com) → create a free account → **New Project**
2. Name it `pink-pearl-couture`, choose any region, set a database password
3. Wait ~2 minutes for provisioning
4. Go to **Project Settings → API** and copy:
   - **Project URL** — e.g. `https://abcdefgh.supabase.co`
   - **anon / public key** — a long string starting with `eyJ…`
5. Go to **SQL Editor → New Query**
6. Paste the entire contents of `supabase-schema.sql` and click **Run**
7. Go to **Table Editor** — confirm the `products` table exists with sample rows

---

### 2. Supabase — Create your first admin user

1. Go to **Authentication → Users → Add User → Create New User**
2. Enter an email address and strong password
3. Click **Create User**

Repeat for any additional admins. To remove an admin later, delete them from this same screen.

---

### 3. Cloudinary — Set up image hosting

1. Go to [cloudinary.com](https://cloudinary.com) → create a free account
2. Note your **Cloud Name** on the dashboard (e.g. `dxyz123abc`)
3. Go to **Settings → Upload → Add Upload Preset**
4. Set **Signing Mode** to `Unsigned`
5. Set **Folder** to `pink-pearl-couture`
6. Save and copy the **Preset Name** (e.g. `ppc_unsigned`)

---

### 4. Fill in the configuration values

There are **5 values** to set across 3 files. Open each file and replace the placeholders:

**`assets/data/supabase-client.js` — lines 14–15**
```js
const SUPABASE_URL  = 'https://abcdefgh.supabase.co'; // your Project URL
const SUPABASE_ANON = 'eyJ...';                        // your anon public key
```

**`assets/js/admin.js` — lines 14–15**
```js
const CLOUDINARY_CLOUD_NAME    = 'dxyz123abc';   // your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = 'ppc_unsigned'; // your upload preset name
```

**`assets/js/on-sale.js` — line 8**
```js
const CLOUD_NAME = 'dxyz123abc'; // same Cloudinary cloud name as above
```

> **Security note:** The Supabase `anon` key is safe to commit publicly. It is a publishable key — access to data is enforced by Row Level Security in the database, not by hiding this key. Never use or commit the `service_role` key.

---

## Admin Dashboard

Access at `/admin.html`. Not linked from any public page.

| Action | How |
|---|---|
| Add a new item | Sidebar → ➕ Add Item → fill form → Save |
| Mark as sold out | Stock list → 🚫 Mark Sold (instant, no form needed) |
| Restock an item | Stock list → ✅ Mark In Stock |
| Edit price / details | Stock list → ✏️ Edit → change fields → Save |
| Upload / replace photo | Edit form → upload from camera or file picker |
| Delete permanently | Stock list → 🗑️ → confirm dialog |
| Add a new admin | Supabase → Authentication → Users → Add User |
| Remove an admin | Supabase → Authentication → Users → Delete User |

---

## Database Schema — Quick Reference

Table: `products`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Auto-generated primary key |
| `name` | TEXT | Product display name — required |
| `category` | TEXT | `dresses` `tops` `skirts` `suits` `bags` `shoes` `sandals` — required |
| `price_zmw` | INTEGER | Price in ZMW as a whole number e.g. `450` — required |
| `image_url` | TEXT | Cloudinary URL — if empty, emoji is shown instead |
| `emoji` | TEXT | Fallback when no photo uploaded e.g. `👗` |
| `badge` | TEXT | Card chip label e.g. `New In` `Best Seller` `Last 1` |
| `badge_type` | TEXT | `""` dark (default) · `gold` · `sale` (pink) |
| `bg_class` | TEXT | `bg-ink` · `bg-pink` · `bg-blush` · `bg-dusty` |
| `colors` | TEXT[] | Hex array for colour dots e.g. `{#1a1818, #c4506a}` |
| `in_stock` | BOOLEAN | `true` = visible publicly · `false` = hidden |
| `store_location` | TEXT | `both` · `northmead` · `chilenje` |
| `sort_order` | INTEGER | Lower = appears first on public site |
| `created_at` | TIMESTAMPTZ | Auto-set on insert |
| `updated_at` | TIMESTAMPTZ | Auto-updated on every change |

Public visitors can only read rows where `in_stock = true`. Admins can read, write, update, and delete all rows. This is enforced at the database level by Row Level Security — not in JavaScript.

---

## Troubleshooting

**Products not loading on On Sale page**
Open browser console. Check `SUPABASE_URL` and `SUPABASE_ANON` in `supabase-client.js`. Confirm the `products` table exists in Supabase with `in_stock = true` rows. Confirm the `public_read_in_stock` RLS policy is active.

**Admin login fails**
Confirm the user exists in Supabase → Authentication → Users. Check for typos. Confirm `SUPABASE_URL` has no trailing slash.

**Photo upload fails**
Confirm `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` in `admin.js` are correct. Confirm the preset is set to Unsigned in Cloudinary settings.

---

## Contact

| | |
|---|---|
| Store | Pink Pearl Couture ZM — The Mwiinga Store |
| WhatsApp | +260 979 690 009 |
| Email | mwiingahambayi@gmail.com |
| Instagram | [@pinkpearl_couture_zm](https://www.instagram.com/pinkpearl_couture_zm) |
| Facebook | [Pink Pearl Couture ZM](https://www.facebook.com/share/17P2yQg5Ns/) |
| Northmead | Blessings Mall, Shop S12, Lusaka |
| Chilenje | Blessings Mall, Upstairs, Lusaka |

---

<div align="center">
<sub>Built for Pink Pearl Couture ZM · Lusaka, Zambia · 2026</sub>
</div>
