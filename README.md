<div align="center">

# 💗 Pink Pearl Couture ZM
### The Mwiinga Store

**Lusaka's home of feminine fashion.**

[![Live Site](https://img.shields.io/badge/Live%20Site-Visit-c4506a?style=for-the-badge)](https://pink-pearl-couture.netlify.app)
[![Admin](https://img.shields.io/badge/Admin-Dashboard-1a1818?style=for-the-badge)](https://pink-pearl-couture.netlify.app/admin.html)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Order-25d366?style=for-the-badge)](https://wa.me/260979690009)


</div>

---

## What This Is

A live fashion boutique website for Pink Pearl Couture ZM. The public storefront shows currently available in-store stock pulled in real time from a Supabase database. Admins manage all stock — adding items, uploading photos, setting prices, toggling availability — through a password-protected dashboard. Customers order via WhatsApp directly from each product card.

No server. No build step. No monthly hosting cost.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Hosting | [Netlify](https://netlify.com) | Free, instant deploys from GitHub, global CDN, no commercial restrictions |
| Database | [Supabase](https://supabase.com) | Free PostgreSQL with REST API, auth, and Row Level Security built in |
| Images | [Cloudinary](https://cloudinary.com) | Free image hosting with auto-compression and mobile upload |
| Frontend | Vanilla HTML + CSS + JS | No build step — works anywhere, deploys instantly |
| Ordering | WhatsApp `wa.me` links | Direct to store, no payment gateway needed |

---

## Repository Structure

```
pink-pearl-couture/
│
├── index.html                  Homepage — brand, collection, locations, contact
├── on-sale.html                Live stock page — pulls from Supabase in real time
├── admin.html                  Admin dashboard — login-protected CRUD panel
├── supabase-schema.sql         Run once in Supabase SQL Editor to create the DB
├── netlify.toml                Netlify deploy config — already set up, do not edit
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
    └── img/                    Static brand images and hero assets
```

---

## Why Netlify

Netlify is the correct deployment choice for this specific project for four reasons:

**1. Truly free with no commercial restrictions.** The Netlify free tier has no clause prohibiting commercial use. GitHub Pages explicitly states it is not intended for commercial use in its terms of service. Since this is a real business selling products, Netlify is the legally clean choice.

**2. Automatic deploys from GitHub.** Connect the repo once. Every `git push` to `main` triggers a live deploy in under 60 seconds — no manual steps, no FTP, no SSH.

**3. Global CDN with HTTPS.** Netlify serves the site from edge nodes worldwide and provisions a free SSL certificate automatically. Customers in Zambia get fast load times. No configuration needed.

**4. Scales without migration.** When the business grows, Netlify Pro adds form handling, serverless functions, and analytics — all without changing hosting provider or restructuring the codebase.

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

### 5. Deploy to Netlify

**Option A — Deploy via Netlify UI (recommended for first deploy)**

1. Go to [netlify.com](https://netlify.com) → create a free account
2. Click **Add new site → Import an existing project**
3. Select **GitHub** → authorise Netlify → find and select `pink-pearl-couture`
4. Leave all build settings blank (this site needs no build command or publish directory)
5. Click **Deploy site**
6. Netlify assigns a URL like `https://radiant-pearl-abc123.netlify.app`
7. To set a custom subdomain: **Site settings → Domain management → Options → Edit site name** → change to `pink-pearl-couture`
8. Your site is now live at `https://pink-pearl-couture.netlify.app`

**Option B — Deploy via Netlify CLI**

```bash
npm install -g netlify-cli
netlify login
netlify init        # follow the prompts, link to your GitHub repo
netlify deploy --prod
```

---

### 6. Delete the old stock file

Remove `assets/data/stock.js` from the repository — it has been replaced by `supabase-client.js`.

```bash
git rm assets/data/stock.js
git add .
git commit -m "feat: Netlify deploy + Supabase live database"
git push origin main
```

Netlify detects the push and deploys automatically within 60 seconds.

---

### 7. Verify

1. Visit `https://pink-pearl-couture.netlify.app/on-sale.html` — products should load from Supabase
2. Visit `https://pink-pearl-couture.netlify.app/admin.html` — log in with your admin credentials
3. Add a test product in the admin panel — confirm it appears live on the On Sale page immediately
4. Mark it as sold out — confirm it disappears from the public page

---

## Deploying Updates (every time)

```bash
git add .
git commit -m "your message"
git push origin main
```

Netlify auto-deploys. Live in under 60 seconds. No other steps.

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

## Costs

| | Monthly cost |
|---|---|
| Netlify (free tier — 100GB bandwidth, unlimited sites) | $0 |
| Supabase (free tier — 500MB DB, 50K API calls/month) | $0 |
| Cloudinary (free tier — 25GB storage, 25GB bandwidth) | $0 |
| GitHub (public repo) | $0 |
| **Total** | **$0** |

The free tiers are sufficient for a boutique with hundreds of products and thousands of monthly visitors. When the business grows, Netlify Pro is $19/month and Supabase Pro is $25/month.

---

## Troubleshooting

**Products not loading on On Sale page**
Open browser console. Check `SUPABASE_URL` and `SUPABASE_ANON` in `supabase-client.js`. Confirm the `products` table exists in Supabase with `in_stock = true` rows. Confirm the `public_read_in_stock` RLS policy is active.

**Admin login fails**
Confirm the user exists in Supabase → Authentication → Users. Check for typos. Confirm `SUPABASE_URL` has no trailing slash.

**Photo upload fails**
Confirm `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` in `admin.js` are correct. Confirm the preset is set to Unsigned in Cloudinary settings.

**Netlify deploy fails**
Check the Netlify deploy log (Deploys tab in your Netlify dashboard). For this site there is no build command — if Netlify is set to run `npm run build` or similar, clear the build command field in Site settings → Build & deploy → Build settings.

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
