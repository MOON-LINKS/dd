# Heating Retail Management System — Complete System Specification (A → Z)

> **Purpose of this document.** It describes, completely and precisely, a working system that was built and tested: what it does, how every part works (algorithms included), how data is stored, how it is secured, everything that was fixed and improved during development, and the next tasks. It is written so that another engineer or AI model can understand the whole system without seeing the conversation that produced it, and can continue the work — in particular the two task briefs in sections 19 and 20 (a MySQL/MariaDB database for phpMyAdmin, and deployment on a domain with role subdomains).
>
> **White-label.** The system is not tied to one company. The company name, contact details, colours, logo files, website texts and demo data are all replaceable (see section 14). This document uses neutral names: "the company", `example.com`.
>
> **Conventions.** Paths are relative to the project root. "Admin", "accountant", "sales person" and "driver" are the four staff roles. Money is in the currency set in Settings (demo: `$`). TVA = value-added tax (demo rate 11%).

---

## Table of contents

1. [Summary](#1-summary)
2. [Users, roles and permissions](#2-users-roles-and-permissions)
3. [Technology and runtime](#3-technology-and-runtime)
4. [Project layout](#4-project-layout)
5. [Start-up, configuration and settings](#5-start-up-configuration-and-settings)
6. [Data model](#6-data-model)
7. [Security](#7-security)
8. [Public website](#8-public-website)
9. [Website builder (content management)](#9-website-builder-content-management)
10. [Dashboard modules](#10-dashboard-modules)
11. [The two self-learning assistants](#11-the-two-self-learning-assistants)
12. [HTTP routes reference](#12-http-routes-reference)
13. [Front-end architecture and theming](#13-front-end-architecture-and-theming)
14. [White-labelling checklist](#14-white-labelling-checklist)
15. [Demo data](#15-demo-data)
16. [Automated tests](#16-automated-tests)
17. [Installation, operation and troubleshooting](#17-installation-operation-and-troubleshooting)
18. [Current deployment model](#18-current-deployment-model)
19. [Task brief A — MySQL / MariaDB database for phpMyAdmin](#19-task-brief-a--mysql--mariadb-database-for-phpmyadmin)
20. [Task brief B — Domain and role subdomains](#20-task-brief-b--domain-and-role-subdomains)
21. [Change log: everything built, fixed and improved](#21-change-log-everything-built-fixed-and-improved)
22. [Known limitations](#22-known-limitations)
23. [Future improvements](#23-future-improvements)
24. [Glossary](#24-glossary)

---

## 1. Summary

A business management system for a company that **sells, delivers, installs and maintains heaters** (gas heaters, oil radiators, electric panels, fan heaters, infrared heaters, wood stoves…), plus the company's **public website**. One Node.js application serves both.

| Area | What it covers |
|---|---|
| **Phase 1 — Admin & accountant** | Sign-in, statistics (monthly/yearly revenue), stock & quantity, clients on a map, staff accounts (create / block / monitor), clients, items with TVA and images, selling with automatic receipts, selling history |
| **Phase 2 — Installments** | Pay in installments (number of payments, every x months, interest rate, down payment), client history from the selling screen, admin view of all installments, payments and reminders |
| **Phase 3 — Sales people & bus drivers** | Sales people with commission and their own dashboard; bus drivers with a mobile GPS dashboard (start/end ride, live location, km count, gas charges); admin live tracking and ride routes drawn along real roads |
| **Website** | Home (offers carousel, categories, services, about, contact), product pages generated from the dashboard items, services page, about page, WhatsApp ordering, chat assistant |
| **Leads CRM** | One inbox for potential customers from WhatsApp, Facebook, Instagram, TikTok, website chat, website form, phone, walk-in, referral; pipeline, follow-ups, duplicate merging, automatic capture (Meta webhooks, inbound API) |
| **Self-learning assistants** | A website chat assistant for visitors and a dashboard assistant for admins. Built in (no external AI service, no API key, no cost); they learn from staff and from use |

**Design choices:** server-rendered pages (fast, simple, works on old phones), one SQLite file as database (zero administration), no front-end build step, very few dependencies, everything testable end-to-end.

---

## 2. Users, roles and permissions

| Role | Purpose | Lands on |
|---|---|---|
| `admin` | Owner/manager: everything, including all accountant features | `/dashboard` |
| `accountant` | Records sales, manages clients, items, categories, installment payments, leads | `/dashboard` |
| `sales` | Sales person: sees own sales and commission, works own assigned leads | `/my-sales` |
| `driver` | Bus driver: GPS rides, gas charges | `/driver` |

Visitors of the public website are anonymous.

**Permission matrix** (✔ = allowed):

| Feature | Admin | Accountant | Sales | Driver |
|---|:-:|:-:|:-:|:-:|
| Dashboard home, change own password | ✔ | ✔ | ✔ | ✔ |
| Statistics, stock, clients map | ✔ | | | |
| Clients (list, add, edit, history) | ✔ | ✔ | | |
| Delete a client | ✔ | | | |
| Items & categories (add / edit / delete) | ✔ | ✔ | | |
| Sell, receipts | ✔ | ✔ | own receipts | |
| Selling history | all | own | | |
| Installments overview page | ✔ | | | |
| Mark an installment paid / undo | ✔ / ✔ | ✔ / — | | |
| Leads: view & work | all | all | assigned to them | |
| Leads: convert to client | ✔ | ✔ | | |
| Leads: delete; lead sources setup | ✔ | | | |
| Staff accounts, activity monitor, sales people page, driver tracking | ✔ | | | |
| Website content, settings, website chats | ✔ | | | |
| Dashboard assistant and assistant training | ✔ | | | |
| My sales (commission dashboard) | | | ✔ | |
| Driver dashboard (GPS, rides, gas) | | | | ✔ |

Blocking an account (`active = 0`) deletes its sessions immediately and refuses future sign-ins.

---

## 3. Technology and runtime

| Item | Choice |
|---|---|
| Runtime | **Node.js — the latest LTS is preferred** (e.g. 24 or 26). Minimum supported: **18.16** |
| Web framework | Express 5 (`express@^5.3`) |
| Views | EJS 7 (server-rendered HTML; includes inherit the parent's data) |
| Database | SQLite, one file (`data/heaters.db`), WAL mode, foreign keys on |
| Database engine | **Chosen at start-up** (`src/sqlite.js`): `better-sqlite3` 11 on Node 18–22 (optional dependency; installs a ready-made binary), or the **built-in `node:sqlite`** on Node 22.13+ (24, 26…). Both read the same file. `DB_DRIVER=node` / `better-sqlite3` forces one |
| Uploads | `multer` 2 (images only, 5 MB) |
| Maps | Leaflet 1.9 + OpenStreetMap tiles; road routing via an OSRM server (default: public OSRM demo server) |
| Charts | Chart.js 4 (served from `node_modules` under `/vendor`) |
| Tests | Node's built-in test runner (`node --test`) |

**Dependencies** (`package.json`): `express`, `ejs`, `multer`, `leaflet`, `chart.js`; optional: `better-sqlite3@^11.10.0`. Nothing else (no ORM, no front-end framework, no AI SDK).

**Why the dual database engine:** `better-sqlite3` 11 is the last version that installs on Node 18, but it cannot be built for Node 24+; `node:sqlite` exists only on Node 22.13+. `src/sqlite.js` wraps `node:sqlite` with the small subset of the `better-sqlite3` interface the code uses (`prepare().get/all/run/iterate`, `exec`, `pragma`, `transaction` with nested savepoints, objects with extra keys for named parameters), so every other file is engine-agnostic. On newer Node, npm tries to build the optional `better-sqlite3`, fails, skips it, and the built-in engine is used.

**npm configuration** (`.npmrc`): `engine-strict=true` — npm refuses to install on Node older than 18.16 with a clear message.

---

## 4. Project layout

```
src/
  server.js          starts the HTTP server; prints URLs and which settings file was read
  boot.js            first file loaded: Node version check + .env loader (see 5.1)
  app.js             Express app: security headers, static files, body parsers, sessions, locals, routers, errors
  config.js          configuration from environment variables
  db.js              opens the database (via sqlite.js), applies schema.sql and migrations
  sqlite.js          database engine adapter (better-sqlite3 or node:sqlite)
  schema.sql         all tables and indexes (SQLite)
  seed.js            demo data (`npm run demo`)
  reset-admin.js     sets the admin password on an existing database (`npm run reset-admin`)
  demo-routes.json   real road routes used only by the demo rides
  lib/
    auth.js          password hashing, sessions, role guards, same-origin check, sign-in rate limit
    settings.js      business settings (cached) and secrets
    format.js        money, dates, receipt numbers, slugs, WhatsApp links, safe JSON embedding
    installments.js  installment schedule builder and validation
    stats.js         revenue and stock helpers
    geo.js           haversine distance, coordinate validation
    roads.js         ride route matching to roads (OSRM)
    maplink.js       server side of the Google Maps link reader (opens short links)
    leads.js         lead sources, statuses, de-duplication, client matching, auto-won
    activity.js      activity log and action labels
    upload.js        image upload rules
    icons.js         inline SVG icon set
    paginate.js, http.js   pagination and input helpers
    bot/
      text.js        language tools for the assistants
      engine.js      learning engine shared by both assistants
      site.js        website assistant
      admin.js       dashboard assistant
  routes/            site, auth, dashboard, clients, items, selling, installments, admin, team,
                     driver, website-admin, assistant, leads, lead-sources
views/
  site/              public website pages + partials (header, footer, product card, chat widget)
  dash/              dashboard pages + partials (layout top/bottom, pagination, tables) + printable receipt
public/
  css/               site.css (website), dashboard.css (dashboard)
  js/                app.js (shared helpers "HS"), sell.js, driver.js, map-picker.js, maplink.js, chat.js, site.js
  img/               logo.png, favicon.png, apple-touch-icon.png, icon-192.png, placeholder and demo illustrations
test/                end-to-end tests
data/                created at run time: heaters.db (+ -wal/-shm), uploads/
```

---

## 5. Start-up, configuration and settings

### 5.1 Start-up sequence

`npm start` → `node src/server.js`:

1. **`boot.js`** (written in old-style JavaScript so that even an unsupported Node can print its message):
   - If Node < 18.16: prints how to update Node and exits.
   - Loads the optional settings file: `.env` in the project root, or `.env.txt` (what Windows Notepad saves) with a warning to rename it. The reader understands UTF-8 (with or without BOM), **UTF-16 LE/BE** (Notepad "Unicode", PowerShell `>`), CRLF line ends, `export KEY=…`, quoted values (`"…"`, `'…'`, `` `…` ``; `\n` in double quotes), and inline comments after ` #`. A `#` without a space before it stays in the value (so passwords like `pa#ss` work). **Values already set in the environment win** over the file.
   - Exposes which file was read and its keys (used by `server.js` and `reset-admin.js` diagnostics).
2. **`config.js`** reads environment variables (table below).
3. **`db.js`** opens the database through `sqlite.js`, sets `journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout=5000`, runs `schema.sql` (`CREATE … IF NOT EXISTS`), then migrations (see 6.3).
4. **`app.js`** builds the Express app; on first start with **no users**, it creates the initial admin from `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
5. `server.js` listens on `PORT` and prints the website URL, the dashboard URL and `Settings: .env (N values)` or `no .env file, using the defaults`.

### 5.2 Environment variables

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `DATA_DIR` | `./data` | Folder for the database and uploads (**back it up**) |
| `NODE_ENV` | — | `production` → secure cookies on, static files cached 7 days |
| `TRUST_PROXY` | — | `1` behind a reverse proxy (uses `X-Forwarded-*`) |
| `COOKIE_SECURE` | on in production | `true`/`false` overrides |
| `SESSION_DAYS` | `7` | Sign-in lifetime |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / `admin123` | Initial admin (empty database), demo admin, `reset-admin` |
| `TZ` | server zone | Local time zone for "today", reports, due dates (e.g. `Asia/Beirut`) |
| `META_VERIFY_TOKEN` / `META_APP_SECRET` | — | Meta webhooks (WhatsApp Cloud API, Messenger, Instagram, Lead Ads) |
| `ROUTING_URL` | `https://router.project-osrm.org` | OSRM server for ride routes; `off` disables |
| `DB_DRIVER` | automatic | `node` or `better-sqlite3` |

### 5.3 Business settings (dashboard → Settings, table `settings`)

`company_name`, `tagline`, `currency`, `tva_rate`, `low_stock`, `phone`, `whatsapp`, `email`, `address`, `opening_hours`, `map_lat`, `map_lng` (shop location), `facebook`, `instagram`, `tiktok`, `youtube`, `founded_year`, `about_short`, `story`, `show_prices` (prices visible on the website), `receipt_footer`, `site_chat` (website chat on/off), `assistant_name`, `assistant_greeting`. Secrets are stored with the key prefix `secret:` (e.g. `secret:leads_api_key`) and are never overwritten by the Settings form. Settings are cached in memory and refreshed on save.

### 5.4 npm scripts

| Script | Does |
|---|---|
| `npm start` | Run the server |
| `npm run dev` | Run with `--watch` (restart on file changes) |
| `npm run demo` | **Wipe** the database and load demo data (admin from `.env` if set) |
| `npm run reset-admin` | Set the admin password from `ADMIN_PASSWORD` on the existing database, keeping all data; unblocks the admin and signs it out elsewhere; creates the admin if missing; refuses a username that belongs to a non-admin; if the password is missing/too short it explains why (no file, `.env.txt`, line commented, too short) and, in a terminal, asks for the password twice with masked input |
| `npm test` | Run all tests |

---

## 6. Data model

### 6.1 Conventions

- **Timestamps** (`created_at`, `paid_at`, `started_at`, …) are stored as **UTC** text `YYYY-MM-DD HH:MM:SS`; reports convert with SQLite `'localtime'` (so `TZ` matters).
- **Local dates** (installment `due_date`, plan `start_date`, lead `follow_up_date`) are plain `YYYY-MM-DD`.
- **Money** is stored with 2 decimals (rounded with `r2`); item prices are **before TVA**.
- **Booleans** are integers 0/1. **JSON** is stored as text.
- **Phone matching** uses `phone_key` = the **last 7 digits** (matches local `03 444 555` and international `+961 3 444 555`).

### 6.2 Tables

| Table | Purpose | Key columns and relations |
|---|---|---|
| `users` | Staff accounts | `name`, `username` (unique, case-insensitive), `password_hash` (`scrypt$salt$hash`), `role` (admin/accountant/sales/driver), `phone`, `commission_rate` (%), `active`, `last_login_at`, `created_by → users` |
| `sessions` | Sign-in sessions | `token_hash` (SHA-256 of the cookie token, PK), `user_id → users` (cascade), `flash` (one-time message), `expires_at` |
| `activity_log` | Audit trail | `user_id`, `action` (e.g. `sale.create`, `installment.pay`, `user.block`, `assistant.teach`), `details`, `ip`, `created_at` |
| `settings` | Business settings + secrets | `key` (PK), `value` |
| `clients` | Customers | `name`, `phone`, `location` (address), `lat`, `lng`, `notes`, `created_by` |
| `categories` | Product categories | `name`, `slug` (unique, used in URLs), `description`, `image`, `sort` |
| `items` | Products / stock | `name`, `category_id`, `price` (before TVA), `tva` (0/1), `quantity`, `description`, `image`, `on_website` |
| `sales` | Receipts | `client_id`, `user_id` (recorded by), `salesperson_id`, `subtotal`, `tva_rate`, `tva_total`, `total`, `payment_type` (cash/installments), `commission_rate`, `commission`, `notes`, `created_at` |
| `sale_items` | Receipt lines | `sale_id` (cascade), `item_id`, copied `name` and `unit_price`, `quantity`, `tva`, `line_subtotal`, `line_tva`, `line_total` |
| `installment_plans` | One plan per installment sale | `sale_id` (unique), `down_payment`, `financed`, `interest_rate`, `total_due`, `times`, `every_months`, `start_date` |
| `installments` | Scheduled payments | `plan_id`, `seq`, `due_date`, `amount`, `paid_at`, `paid_by` |
| `rides` | Driver rides | `driver_id`, `started_at`, `ended_at` (NULL = in progress), `distance_km` (GPS), `last_lat/lng/at`, `start_odometer`, `end_odometer`, `notes`, **cached road route**: `road_path` (JSON `[[lat,lng],…]`), `road_km`, `road_points`, `road_method` (`match`/`route`) |
| `driver_locations` | GPS positions | `driver_id`, `ride_id` (NULL when GPS is on without a ride), `lat`, `lng`, `accuracy` (m), `speed` (km/h), `recorded_at` |
| `fuel_logs` | Gas charges | `driver_id`, `ride_id`, `liters`, `cost`, `odometer`, `notes` (station), `created_at` |
| `site_entries` | Website content | `kind` (offer/service/team/certificate/brand), `title`, `subtitle`, `body`, `image`, `link`, `icon`, `sort`, `active` |
| `ai_conversations` | Assistant chats (both assistants) | `id` (random text), `channel` (website/admin), `user_id` (admin chats), `ip`, `title`, `transcript` (JSON), `turns`, `state` (JSON: pending choices, call-back step, product of interest), `messages` (unused, kept for old databases) |
| `bot_answers` | Answers taught by staff | `channel`, `title` (the question), `answer` (Markdown with placeholders), `active`, `hits`, `helpful`, `unhelpful`, `created_by` |
| `bot_examples` | Wordings for a skill or taught answer | `channel`, `skill` (built-in) **or** `answer_id`, `text`, `source` (taught/learned) |
| `bot_questions` | Questions not answered yet | `channel`, `text`, `norm` (normalised words, unique per channel), `times`, `reason` (unknown/unsure/unhelpful), `status` (open/answered/ignored), `conversation_id`, `first_at`, `last_at` |
| `leads` | Potential customers | `source`, `name`, `phone`, `phone_key`, `email`, `external_id` (WhatsApp number / Messenger or Instagram sender id / `leadgen:<id>`), `message`, `item_id`, `campaign`, `status` (new/contacted/interested/won/lost), `lost_reason`, `assigned_to`, `follow_up_date`, `client_id`, `conversation_id`, `created_by`, `created_at`, `updated_at`, `last_activity_at` |
| `lead_notes` | Lead timeline | `lead_id` (cascade), `user_id`, `kind` (note/call/message/status/system), `body`, `created_at` |

Main relations: `sales → clients`, `sale_items → sales/items`, `installment_plans → sales`, `installments → installment_plans`, `rides/driver_locations/fuel_logs → users (driver)`, `leads → clients/items/users/ai_conversations`, `lead_notes → leads`, `bot_examples → bot_answers`. Deleting a sale cascades to its lines, plan and installments; deleting a user keeps history (`SET NULL`) except their sessions, rides and positions (cascade).

### 6.3 Migrations (run automatically at start)

- An early single-purpose `leads` table is rebuilt into the multi-source table (old statuses mapped, `phone_key` computed).
- `ai_conversations.state` added if missing.
- `rides.road_path / road_km / road_points / road_method` added if missing.
- Placeholder company name/email/assistant name from older demo data are renamed (only if untouched).

---

## 7. Security

| Topic | Implementation |
|---|---|
| Passwords | `scrypt` (Node crypto), 16-byte random salt, 64-byte key, stored as `scrypt$<salt hex>$<hash hex>`; compared in constant time. Minimum 6 characters |
| Sessions | 32 random bytes (base64url) in an **httpOnly, SameSite=Lax** cookie (`Secure` in production); only the SHA-256 is stored; expired sessions are purged; lifetime `SESSION_DAYS` |
| Cross-site requests | Every POST must have an `Origin` (or `Referer`) whose host equals `Host` (or `X-Forwarded-Host` behind a trusted proxy); otherwise 403 |
| Sign-in throttling | 8 failed attempts per IP + username in 15 minutes → blocked for the rest of the window (in memory) |
| Roles | `requireRole(...)` middleware on every route; blocked users are signed out at once |
| Uploads | JPG/PNG/WEBP/GIF only, 5 MB, random file names, one file per request |
| Output | EJS escapes by default; JSON embedded in pages is escaped; the chat Markdown renderer escapes first, then allows only safe links (`/`, `#`, `https:`, `tel:`, `mailto:`) |
| Headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` (needed by OpenStreetMap tiles), `x-powered-by` off |
| Meta webhooks | GET verification token check; every POST verified with HMAC-SHA256 of the **raw body** using the app secret (`X-Hub-Signature-256`), constant-time comparison |
| Inbound leads API | `X-Api-Key` header compared in constant time with a key generated on the Lead sources page (stored as a secret) |
| Website chat | 40 messages per IP per 10 minutes, 1000 characters per message, 80 turns per chat, max 3 call-back leads per chat per hour; conversation ids are random and unguessable |
| Dashboard assistant | Admin only; conversations private to each admin; it **only reads** data (no SQL from users, no writes) |
| Google Maps short links | The server only opens Google hosts (`*.google.*`, `goo.gl`, `maps.app.goo.gl`, `g.co`, `share.google`), max 6 redirects, 10 s timeout — prevents use as a proxy to internal addresses |
| Secrets | Never shown in Settings, never sent to the browser |

---

## 8. Public website

Server-rendered pages with the company's settings and content. Mobile-first, accessible (skip link, focus styles, reduced-motion support).

| Page | Content |
|---|---|
| `/` Home | (1) **Offers carousel** (auto-play, arrows, dots, swipe), (2) **Shop by category** (categories that have website items, with counts), (3) **Services** (cards), (4) **About** (short text, stats: years, clients, products, brands; brand logos strip), (5) **Contact** (phone, WhatsApp, address, hours, social links, embedded map, "get directions") |
| `/products`, `/products/:slug` | All products or one category; chips per category with counts; search box; stock badges ("only N left", "out of stock") |
| `/product/:id` | Image, price **with TVA included** (or "price on request" if prices are hidden), availability, description, perks, **Order on WhatsApp** (message pre-filled with the product name) |
| `/services` | Each service with an anchor (`#service-<id>`), call-to-action band |
| `/about` | Story, stats, team, certificates, brand logos |
| `/contact` | Redirects to the contact section |
| 404 | Friendly page |

Always present: header with navigation and WhatsApp button, footer (categories, company links, contact, "Staff login"), floating WhatsApp button, and the **chat assistant** bubble when enabled.

**Products are not typed twice:** every item created in the dashboard with "Show on website" appears automatically, with live price (TVA applied when the item has TVA) and live stock.

---

## 9. Website builder (content management)

Everything visible on the website is edited in the dashboard; no code change is needed.

| Where | Edits |
|---|---|
| **Website content** (`/admin/website`) | Carousel offers (title, subtitle badge, text, image, link, order, on/off), services (title, subtitle, text, icon), team members (name, role, photo — initials when no photo), certificates, brand logos |
| **Items / Categories** | Products, prices, TVA, stock, images, descriptions, "show on website", category order and slugs |
| **Settings** | Company name, tagline, contact details, address, opening hours, map location (map picker), social links, founded year, about text, story, currency, TVA rate, low-stock level, show/hide prices, receipt footer, chat assistant on/off, its name and greeting |
| **Assistant training** | What the website assistant knows beyond the catalogue (warranty, payment methods, delivery areas, …) |

Brand assets (logo, favicon, colours) are files and CSS variables — see section 14.

---

## 10. Dashboard modules

The dashboard has a sidebar (sections Overview, Accounting, Team, Website, Account; items depend on the role), a top bar with page actions, flash messages, and a mobile menu. Badges show new leads and questions waiting for the assistants.

### 10.1 Sign-in and accounts

- `/login`: username + password; redirects to the role's home; "back to website" link. `/logout` (POST).
- `/account`: change own password (current password required).
- `/admin/users` (filter by role): create accounts (name, username, password, role, phone, commission rate for sales people), edit, reset a password, **block / unblock** (blocking deletes the person's sessions). `/admin/users/:id` shows the person's details, recent activity and figures (sales recorded, commission, rides…).
- Initial admin creation and `npm run reset-admin`: see 5.1 and 5.4.

### 10.2 Dashboard home

- **Admin:** tiles — revenue this month (with % change vs last month), revenue this year (sales count), clients (link to map), low-stock items, overdue installments (count and amount), new leads (follow-ups due), drivers on a ride; revenue chart for the last 12 months; low-stock list; recent sales; installments due in the next 14 days; "Ask the assistant" and "New sale" buttons.
- **Accountant:** my sales today and this month (with receipt counts), clients, low stock, recent own sales and shortcuts (sell, clients, items, leads).

### 10.3 Clients

- List with search (name/phone) and pagination; client page with contact details, map pin, purchases, total spent, outstanding installments, installment plans with each payment (mark paid), linked leads.
- **Location — two ways:**
  1. **Paste a Google Maps link** (or coordinates) in "Google Maps link". Pasting fills the pin instantly; a short link is opened by the server.
  2. Click the map to drop the pin (drag to adjust), or "Use my location".
  The quick "Create new client" form on the Sell page accepts the link too. If the link is submitted without a pin, the server reads it when saving.

**Location-from-link algorithm** (`public/js/maplink.js`, shared by browser and server; server part `src/lib/maplink.js`):

1. Plain text first: `lat, lng` decimal pairs, degrees-minutes-seconds (`33°53'37.7"N 35°30'06.5"E`), `geo:lat,lng`.
2. Parse as a URL. **Directions links** (`/dir/…`, `destination=`, `daddr=`): the **destination** is used — from the `destination`/`daddr` parameter, else the last `/dir/` path segment if it is coordinates, else the last waypoint in the link data (`!1d<lng>!2d<lat>`).
3. **Place / dropped pin:** the last `!3d<lat>!4d<lng>` in the link data (exact pin).
4. **Query coordinates:** `q`, `query`, `ll`, `cbll` (exact); `center`, `sll`, `viewpoint` (approximate).
5. **Coordinates written in the place/search name** (`/place/33.89,35.50` or DMS).
6. **Map view only:** `@lat,lng,zoom` → marked **approximate** (the user is told to adjust the pin).
7. Validation: latitude ±90, longitude ±180, not (0,0); rounded to 6 decimals.
8. **Short links** (`maps.app.goo.gl`, `goo.gl`, `g.co`, `share.google`): the server follows up to 6 redirects with `redirect: manual`, only to Google hosts; cookie-consent redirects are unwrapped (`continue=` parameter); each new URL is parsed with steps 1–7. If the final page has no coordinates in its URL, the page HTML is searched (static-map `center=`/`markers=` parameters, a Maps URL inside the page, or the initial map view as approximate). Clear error messages explain what to share instead.

### 10.4 Items and categories

- Items: name, category, price **before TVA**, TVA on/off, quantity, description, image upload, "show on website". List with search, low-stock highlighting. Deleting an item never changes past receipts (receipt lines keep their own copy of the name and price).
- Categories: name, slug (auto from name, unique), description, image, display order.

### 10.5 Selling and receipts

`/sell` (admin, accountant):

1. Add items (search, quantity); stock is checked live.
2. Choose a client (search by name/phone) or create one (name, phone, address, optional Google Maps link). Choosing a client shows their history (purchases, spend, outstanding balance).
3. Optional sales person (gets commission).
4. Payment: **cash** or **installments** (see 10.6), with a live schedule preview.
5. **Record sale** → one database transaction:
   - re-reads items and **refuses overselling**;
   - for each line: `line_subtotal = unit_price × qty`, `line_tva = line_subtotal × tva_rate/100` if the item has TVA, `line_total = sum`; all rounded to cents;
   - `subtotal`, `tva_total`, `total` = sums; TVA rate copied from Settings at that moment;
   - commission = `subtotal × rate / 100` (before TVA); the rate is copied onto the sale, so later rate changes never rewrite history;
   - stock decremented; installment plan and schedule created;
   - any open leads of that client are marked **Won** with a timeline note;
   - activity logged.
6. Redirect to the **receipt** `/sales/:id/receipt`: number `R-<year>-<id padded to 5>`, company details, client, lines, TVA, total, installment schedule, footer text; print-friendly ("Save as PDF" from the browser).

`/sales`: selling history (accountants see their own; admins all, with filters by person, period, payment type).

### 10.6 Installments

**Inputs:** number of payments `times` (1–120), every `everyMonths` months (1–12), interest rate % (0–200, flat), down payment (0 ≤ dp < total), first due date (default: one month after today).

**Schedule algorithm** (`src/lib/installments.js`):

```
financed  = round2(total − downPayment)
totalDue  = round2(financed × (1 + interestRate/100))     // flat interest, applied once
base      = floor(totalDue / times × 100) / 100            // truncated to cents
payment i = base for i = 1 … times−1
payment n = round2(totalDue − base × (times − 1))           // last payment absorbs rounding
due date i = addMonths(startDate, (i−1) × everyMonths)     // month-end safe: Jan 31 + 1 month = Feb 28/29
```

The schedule always sums exactly to `totalDue`.

**Admin page** `/admin/installments`: payments view (unpaid / overdue / upcoming / paid / all, month filter, search) and plans view (progress per plan). Actions: **mark paid** (admin or accountant, records who and when), **undo** (admin only), WhatsApp reminder link with the amount and due date pre-filled. Overdue = unpaid and `due_date < today` (local).

### 10.7 Statistics, stock and clients map (admin)

- `/admin/stats`: monthly revenue this year vs last year (bar chart), yearly totals, revenue by category (doughnut), top items, sales by accountant, cash vs installments, average sale.
- `/admin/stock`: per item quantity, units sold in the last 30 days, **estimated days left** (`quantity ÷ (sold30 / 30)`), stock value (`price × quantity`), low/out-of-stock flags (`quantity ≤ low_stock` setting).
- `/admin/clients-map`: all pinned clients; pin size by total spend, colour by last purchase (≤30 days, ≤90 days, older, never); period filter; popups with client link.

### 10.8 Sales people

- `/admin/team`: per sales person and period — sales count, revenue, commission; ranking.
- `/my-sales` (sales person): own sales, revenue, commission by month (chart), list of own receipts, and **My leads**.

### 10.9 Bus drivers

**Driver dashboard** `/driver` (mobile-first web page):

- **GPS on/off** toggle (browser geolocation `watchPosition`, high accuracy).
- **Start ride** (optional odometer) / **End ride** (optional odometer).
- Sending positions: every **15 s during a ride**, every **60 s when idle**, or immediately after moving **≥ 30 m**; positions are **queued** and sent in batches (up to 200 per request; server accepts up to 500) so nothing is lost on a weak connection.
- **Screen Wake Lock** during a ride (keeps the page alive).
- Live map of the ride, km today and this month, **gas charges** form (litres, cost, odometer, station).

**Server distance filter** (counted into `rides.distance_km`): a fix is ignored for distance if accuracy > **60 m**, if the step is < **20 m** (jitter), or if the implied speed > **180 km/h**. Distance = haversine between accepted consecutive fixes.

**Admin tracking** `/admin/tracking`: live map refreshed every **15 s** — green = on a ride, blue = GPS on without a ride, grey = last seen more than 10 minutes ago; today's path of each driver; per-driver km today/month and gas; rides table with filters and a **Route** button.

**Ride page** `/admin/rides/:id`: GPS distance, road distance, odometer distance, duration, average speed, gas during the ride, and the map with **the route drawn along the roads**:

- GPS points are drawn as small grey dots; start (green) and finish/now (red) markers.
- The page then calls `GET /api/admin/rides/:id/road` and draws the returned road route as a solid line, with a note explaining how it was built.

**Road-route algorithm** (`src/lib/roads.js`, OSRM HTTP API):

1. Take the ride's GPS points in time order. Fewer than 2 points or < 50 m in total → nothing to draw.
2. **Dense trace** (≥ 3 points and an average spacing ≤ 1 km): **map matching**.
   - Down-sample by distance to one point every ~0.5 km (public server, max 60 points) or ~0.25 km (own server, max 200), always keeping first and last.
   - Split into **overlapping chunks** of `matchSize` points (the last point of a chunk starts the next). `matchSize` starts at 10 for the public OSRM server (its limit) and 100 for a self-hosted one; if the server answers `TooBig`, it is lowered automatically (100 → 50 → 25 → 10 → 5) and remembered.
   - Each chunk → `GET /match/v1/driving/{coords}?overview=full&geometries=geojson&radiuses=35;…&timestamps=…&gaps=ignore&tidy=true` (timestamps forced strictly increasing).
   - A chunk that cannot be matched uses `/route` **between its two ends only** (avoids U-turn detours through noisy points); if that fails too, the raw points are used.
   - Geometries are joined (duplicate joint points removed) and distances summed.
3. **Sparse points** (e.g. only start and finish because the phone slept): `/route` through up to 25 down-sampled points — the road route between them.
4. The path is simplified (Douglas–Peucker, 4 m tolerance) and stored on the ride with the number of GPS points it was built from (`road_points`). It is **reused until new GPS points arrive** (rides in progress are recomputed when viewed). Concurrent requests for the same ride share one computation.
5. Requests to the public server are **throttled to ≥ 1.05 s apart** (its usage policy) with a 15 s timeout. If the routing server cannot be reached, the page joins the GPS points with a dashed line and says why. `ROUTING_URL=off` disables matching.

### 10.10 Leads CRM

`/leads` (admin & accountant: all; sales person: assigned to them):

- **Sources:** WhatsApp, Facebook, Instagram, TikTok, website chat, website form, phone call, walk-in, referral, other — each with its own label, icon and colour. "Where leads come from" cards show leads and wins per source for the last 30 days.
- **Pipeline:** New → Contacted → Interested → Won / Lost (lost requires a reason). Tabs with counts, filters (status, source, owner, follow-up due, search).
- **Lead page:** contact buttons (call, WhatsApp), owner, follow-up date (due/overdue flagged), product of interest, campaign, linked client, website chat link, **timeline** (notes, calls, messages, status changes, system notes). Logging a call or message on a *new* lead moves it to Contacted.
- **Add lead** form (any source); sales people's new leads are assigned to themselves.
- **Convert to client:** creates the client or reuses an existing client with the same phone; links the lead.
- **Auto-won:** recording a sale for the linked client marks the lead Won.

**De-duplication** (`createOrUpdateLead`, one transaction): look for an **open** lead (new/contacted/interested) with the same `source + external_id`, else the same `phone_key`. If found: fill missing phone/email/name and add the message to its timeline. Otherwise insert a new lead; if the phone's last 7 digits match an existing client, link the client and add a system note.

**Automatic capture** (setup page `/admin/lead-sources`, admin):

- **Meta webhooks** `/webhooks/meta`: `GET` answers Meta's verification (`hub.mode=subscribe`, `hub.verify_token` = `META_VERIFY_TOKEN` → `hub.challenge`); `POST` is verified with `X-Hub-Signature-256` (HMAC-SHA256 of the raw body with `META_APP_SECRET`), then:
  - `whatsapp_business_account` → each incoming message (text, button, interactive, media type) becomes/updates a WhatsApp lead (name from the contact profile, phone `+<wa_id>`, ad referral as campaign);
  - `page` / `instagram` `messaging` events → Facebook / Instagram leads (sender id as external id; the page's own messages are skipped);
  - `leadgen` changes (Lead Ads) → a lead noting the form and lead ids (the answers stay in Meta; sending Lead Ads through the inbound API gives name and phone directly).
- **Inbound API** `POST /api/leads/inbound` with `X-Api-Key`: JSON or form fields `name` (or `full_name`, or `first_name` + `last_name`), `phone`, `email`, `message`, `source` (free text normalised: "FB", "insta", "wa", "Lead Ads"…), `campaign` (or `campaign_name`, `ad_name`, `form_name`). For Zapier, Make, TikTok Lead Generation, Google Forms, website forms.
- **Website chat** call-back requests (section 11).

### 10.11 Activity monitor

`/admin/activity`: every staff action with time, person, IP and details; filters by person and action. Actions include sign-in/out, password changes, user create/edit/block, client/item/category changes, sales, installment payments, rides, gas charges, leads, settings, content and assistant training.

### 10.12 Website chats

`/admin/website-chats`: every visitor conversation (last message, what was asked and answered, number of questions, linked lead); full transcript page.

---

## 11. The two self-learning assistants

Two assistants share one engine. **No external AI service**: they run inside the application, answer from the live database and from what staff teach them, and **learn** from use. Code: `src/lib/bot/`.

### 11.1 Language processing (`text.js`)

Every message goes through the same pipeline:

1. **Normalise:** lowercase; remove accents (NFKD); remove Arabic diacritics and tatweel; unify Arabic letters (أ/إ/آ → ا, ى → ي, ة → ه); Arabic-Indic digits → 0-9; remove apostrophes; everything that is not a letter or digit becomes a space.
2. **Phrases → one concept** (Unicode-aware word edges): e.g. "how much", "c'est combien", "كم سعر" → `price`; "call me", "talk to a person" → `callback`; "square meters", "m2", "متر مربع" → `sqm`; "best selling", "sold the most" → `bestseller`; "how many", "number of" → `count`; "pay later", "بالتقسيط" → `installment`.
3. **Split into words**, drop filler words (English, French, Arabic, Arabizi lists) and pure numbers.
4. **Concepts** for each word: a per-assistant override table, then a synonym table (several hundred words in English, Arabic, Arabizi and French — e.g. `sobia, صوبيا, chauffage → heater`; `tawsil, توصيل, livraison → delivery`; `ta2sit, أقساط → installment`; `wein, وين, ma7al → location`), then light **stemming** (plurals, -ing, -ed; Arabic article "ال").
   The same word can mean different things per assistant: on the website "order" means *call me back to order* and "sale" means *a promotion*; on the dashboard "order"/"sale" mean *sales* and "make/earn" mean *revenue*.
5. **Typo fixing:** an unknown word of ≥ 4 letters is replaced by the closest known word at edit distance 1 (or 2 for words of ≥ 8 letters).

**Things read from a message:** phone numbers (≥ 7 digits with spaces/dashes/+), room size in m², budget ("under $300", "max 250", "$200"), and **periods** — today, yesterday, this/last week, this/last month, this/last year, last N days/weeks/months, next 7 days, this winter (Oct–Apr), a month name with optional year ("in March", "march 2025"; English and French), a year ("2025"), "all time". Period words are removed before matching the meaning of a dashboard question.

### 11.2 What an assistant knows (`engine.js`)

- **Skills:** built-in abilities written in code, each with a title and example questions (sections 11.5 and 11.6).
- **Taught answers:** written by staff (`bot_answers`) with extra wordings (`bot_examples`).
- **Learned wordings:** `bot_examples` with `source = learned`, attached to a skill or a taught answer.

All examples are tokenised into concept sets and indexed. Each concept gets a weight `idf = ln(1 + N / df)` (N = number of examples, df = examples containing it). The index is rebuilt when knowledge changes (a version counter per assistant).

### 11.3 Matching and deciding

For a message with concept set **q** (entity words such as product, client or staff names removed first, see below) and each example with concept set **e**:

```
w(t)   = idf(t) if known
       = maxIdf  if t is a meaningful concept the assistant has no example for (e.g. "warranty")
       = 1       if t is an unknown plain word (a town, a name)
inter  = Σ w(t) for t in q ∩ e
score  = (inter / Σ_e w)^0.55 × (inter / Σ_q w)^0.45
```

The score rewards examples that are fully present in the message **and** messages that are fully explained by the example; an unexplained meaningful word strongly lowers confidence, so a question about something new is not given a wrong confident answer. Per target (skill or answer) the best example counts; ties go to the target with higher priority (taught answers > skills > small talk).

- **score ≥ 0.60** → answer.
- **0.32 ≤ score < 0.60** → "Did you mean…?" with up to 3 choices + "None of these".
- otherwise → "I don't know yet" (the question is saved for training).

### 11.4 Learning loops

1. **Unanswered questions** are saved in `bot_questions`, grouped by their sorted concept set (`norm`), with a counter and the reason (`unknown`, `unsure` = choices were offered but ignored, `unhelpful` = 👎). Staff open **Assistant training** (`/admin/assistant/training`, tabs Website / Dashboard) and either **write the answer** (creates a taught answer whose first wording is the question) or **link it to an existing answer or skill** ("means the same as") — or ignore it. The question is marked answered.
2. **Choices:** when someone clicks a choice under "Did you mean…?", the original question is added as a **learned wording** of the chosen target; next time it is answered directly.
3. **Feedback:** each answer shows 👍 / 👎. 👍 adds the question as a learned wording (and counts `helpful` for taught answers); 👎 counts `unhelpful` and sends the question to the training page.
4. A new wording is not stored if an identical concept set already exists for the same target. Staff can delete any wording ("forget").

**Taught answers** are Markdown and may use placeholders filled from Settings: `{company}`, `{phone}`, `{whatsapp}`, `{email}`, `{address}`, `{hours}`. They can be edited, deactivated and deleted; their use and 👍/👎 counts are shown.

### 11.5 Website assistant (`site.js`)

**Skills:** hello, thanks, goodbye, help, what do you sell (catalogue), prices, is it in stock, **help me choose a heater**, installments, delivery, installation, maintenance & repairs, services, where is the shop, opening hours, phone/WhatsApp/email, offers, brands, about us, **ask the team to call me**.

**Catalogue matching** (refreshed every minute): each website item is tokenised into name words and **model codes** (numbers and codes such as `11` fins, `2500` W, `IP24`). Item score = weighted share of its name words present in the message (idf over the catalogue), +0.3 if a model number in the message matches the item's codes, −0.15 if the message has numbers that do not. Candidates need ≥ 0.45 and at least one distinctive word. A category matches when all its name words are present.

**Answer logic for one message:**

1. If a "Did you mean…?" choice was clicked → learn and answer it.
2. If waiting for call-back details → a phone number creates the lead; otherwise ask again (up to 3 times) unless the message is clearly another question.
3. A phone number together with call/order wording → create the call-back lead directly.
4. Products named and the question is about price/stock/catalogue (or no clear intent) → **product answer**: one clear model → name, price (TVA included, or "price on request"), stock, first sentence of the description, similar models, follow-up chips; a category → all its products with prices and stock and a link to the category page; otherwise the best matches.
5. A room size, or a budget with products → **recommendation**.
6. Otherwise skill / taught answer / choices / "I don't know" as in 11.3.

**Recommendation:** needed power = **area × 100 W** (noted as more for cold or poorly insulated homes). Filters: energy (gas / electric / wood) from the words, room type (bathroom → bathroom heaters; outdoor/terrace → outdoor heaters; bedroom/baby → silent oil radiators or panels), budget (price with TVA). Candidates need ≥ 85% of the needed power (power read from the item name, W or kW). Sorted by in-stock first, closest power, then price; top 3 with a short explanation and tips. If nothing fits → the most powerful option and an offer to be called. Without any detail → asks for size and energy with quick replies.

**Answers from content:** services, installments (plus any installment offer), delivery, installation, maintenance — from the website's service entries with links; location (address, Google Maps link built from the shop coordinates, map section); hours; phone/WhatsApp/email links; current offers; brands; about text; price overview per category ("from …"); cheapest products, optionally for one energy type.

**Call-back requests → leads:** the assistant asks for name and phone; it extracts the phone, and the name from the remaining words (removing "my name is", "ana", "اسمي", greetings…). It creates/updates a **website_chat lead** with the visitor's last questions and product of interest, linked to the conversation, and replies with the request number (`L-0001`). Rate limit: 3 per conversation per hour.

**Fallback:** "still learning, passed to the team" + WhatsApp link + call-back chip; the question is saved for training.

### 11.6 Dashboard assistant (`admin.js`)

**Skills** (each computes its answer with SQL from live data and returns Markdown with tables and links): hello, thanks, help, **business overview**, **sales & revenue** (count, revenue, % change vs the previous equal period, average sale, installments share, TVA), TVA collected, **best-selling items**, **sales people ranking & commissions** (falls back to this year when the month is empty), **low stock**, **stock of an item**, **stock value**, **clients** (total, new, buyers in the period), **best clients**, **look up a client** (purchases, total spent, last purchase, installments owed, overdue, next due), **overdue installments** (by client with days late), **installments coming up** (default next 7 days), **installments collected**, **money still owed**, **leads** (by source, optionally one channel, open pipeline, follow-ups due), **bus drivers** (rides, GPS km, gas per driver, who is on a ride), **recent activity**, **what website visitors ask** (latest questions + count waiting for training).

**Entities read from the question:** staff by full or unique first name (a sales person → their sales and commission; a driver → their km and gas), clients by phone (last 7 digits) or full name or a unique first name, items by distinctive name words, and lead channels (WhatsApp, Facebook/FB, Instagram/insta, TikTok, walk-in…). A named person, client or item steers the answer even when the wording is unusual.

**Default periods:** sales, TVA, clients, collected → this month; best sellers, best clients → this year; leads → last 30 days; drivers → this week.

**Built-in how-to answers** (added once, editable): add an item, record a sale, record an installment payment, add a client (with Google Maps link), create or block an account, change password, edit the website, teach the assistant.

### 11.7 Conversations, interface and storage

- `POST /api/assistant/site` and `POST /api/assistant/admin` with `{conversationId?, message, choice?}` → `{conversationId, reply (Markdown), suggestions [{label, choice?}], index, feedback, leadCreated}`. `choice` is `skill:<key>`, `answer:<id>` or `none`.
- Each conversation stores a **transcript** (role, text, time, the target answered, the original question, suggestions, rating) and a **state** (pending choices, call-back step and tries, recent questions, product of interest).
- The chat interface (`public/js/chat.js`, shared by the website widget and the dashboard page) renders safe Markdown (paragraphs, lists, tables, links, bold), quick-reply chips, 👍/👎, a typing indicator, restores the conversation after reload (website: id in `localStorage`), and supports "new chat".
- Admins have a conversation list; admin conversations are private per admin.

---

## 12. HTTP routes reference

Guards: **pub** = public, **any** = any signed-in user, **A** = admin, **Ac** = accountant, **S** = sales, **D** = driver.

| Method & path | Guard | Purpose |
|---|---|---|
| GET `/`, `/products`, `/products/:slug`, `/product/:id`, `/services`, `/about`, `/contact` | pub | Website |
| GET/POST `/login`, POST `/logout` | pub | Sign in / out |
| GET `/account`, POST `/account/password` | any | Own password |
| GET `/dashboard` | any | Home by role |
| GET `/clients`, `/clients/new`, `/clients/:id`, `/clients/:id/edit`; POST `/clients`, `/clients/:id` | A, Ac | Clients |
| POST `/clients/:id/delete` | A | Delete client |
| GET/POST `/api/clients`, GET `/api/clients/:id/summary` | A, Ac | Client search / quick create / summary (Sell page) |
| POST `/api/geo/map-link` | A, Ac | Read a location from a Google Maps link |
| GET/POST `/items…`, `/categories…` (new, edit, delete) | A, Ac | Catalogue |
| GET/POST `/sell`, GET `/sales` | A, Ac | Selling, history |
| GET `/sales/:id/receipt` | A, Ac, S | Receipt |
| GET `/admin/installments` | A | Installments overview |
| POST `/installments/:id/pay` / `unpay` | A, Ac / A | Record / undo a payment |
| GET `/admin/stats`, `/admin/stock`, `/admin/clients-map` | A | Analysis |
| GET/POST `/admin/users…` (create, edit, password, toggle), GET `/admin/activity` | A | Staff and audit |
| GET `/admin/team` | A | Sales people |
| GET `/my-sales` | S | Own sales and commission |
| GET `/driver`; POST `/api/driver/ping`, `/api/driver/ride/start`, `/api/driver/ride/end`, `/driver/fuel` | D | Driver app |
| GET `/admin/tracking`, `/api/admin/tracking`, `/admin/rides/:id`, `/api/admin/rides/:id/road` | A | Tracking, ride route |
| GET/POST `/admin/website…`, `/admin/settings` | A | Website content, settings |
| GET/POST `/leads…` (list, new, detail, update, status, notes) | A, Ac, S | Leads |
| POST `/leads/:id/convert` / `delete` | A, Ac / A | Convert / delete |
| GET/POST `/webhooks/meta` | pub (verified) | Meta webhooks |
| POST `/api/leads/inbound` | API key | Inbound leads |
| GET `/admin/lead-sources`, POST `/admin/lead-sources/key` | A | Lead sources setup |
| POST `/api/assistant/site`, `/api/assistant/site/feedback`, GET `/api/assistant/site/:id` | pub | Website assistant |
| POST `/api/assistant/admin`, `/api/assistant/admin/feedback`, GET `/api/assistant/admin/:id`, GET `/admin/assistant`, POST `/admin/assistant/:id/delete` | A | Dashboard assistant |
| GET `/admin/assistant/training`; POST `…/answers`, `…/answers/:id/delete`, `…/examples/:id/delete`, `…/questions/:id/answer`, `…/questions/:id/ignore` | A | Assistant training |
| GET `/admin/website-chats`, `/admin/website-chats/:id` | A | Website conversations |

---

## 13. Front-end architecture and theming

- **Layout:** `views/dash/partials/top.ejs` / `bottom.ejs` (sidebar navigation built from the role; the most specific matching link is highlighted; badges) and `views/site/partials/header.ejs` / `footer.ejs`.
- **Data to scripts:** pages embed JSON in `<script type="application/json">` (escaped) and read it with `HS.data(id)`.
- **Shared helpers** `public/js/app.js` (`window.HS`): `data`, `money`, `esc`, `post` (JSON fetch with errors), `tiles` (OpenStreetMap layer with an "offline" notice when tiles cannot load), `timeAgo`.
- **Page scripts:** `sell.js` (cart, client picker, quick client, installment preview), `driver.js` (GPS, queue, wake lock, rides, gas), `map-picker.js` + `maplink.js` (client location), `chat.js` (assistants), `site.js` (carousel, mobile menu, header shadow).
- **Maps:** Leaflet with OpenStreetMap tiles; canvas renderer for many GPS dots.
- **Charts:** Chart.js bar/doughnut charts.
- **Theming:** all colours are CSS variables at the top of `public/css/dashboard.css` and `public/css/site.css`. The palette has a **primary action colour** (buttons, links) and a **brand accent colour** with dark/light shades (sidebar, active navigation, success states, charts, website hero and footer, section labels, service icons, chat chips). The website also uses two tiling background patterns made of small brand shapes (`--pattern-light`, `--pattern-dark`, inline SVG). Fonts: Inter (dashboard), Plus Jakarta Sans (website), with system fallbacks.
- **Icons:** inline SVG set in `src/lib/icons.js` (`icon(name, size)` in views).

---

## 14. White-labelling checklist

To deliver the system to another company:

1. **Settings** (dashboard): company name, tagline, contact details, address, hours, map location, social links, about text, story, currency, TVA rate, receipt footer, assistant name and greeting.
2. **Brand files** in `public/img/`: `logo.png` (transparent PNG, used in the sidebar, login, receipt, website header/footer, chat avatar), `favicon.png` (64×64), `apple-touch-icon.png` (180×180, opaque), `icon-192.png`.
3. **Colours:** the CSS variables in both stylesheets (primary, brand accent shades, sidebar) and the two pattern variables; chart colours in `views/dash/home-admin.ejs`, `stats.ejs`, `my-sales.ejs`.
4. **Website content:** offers, services, team, certificates, brand logos (Website content); products and categories (Items).
5. **Assistant knowledge:** taught answers for company policies (warranty, payment methods, delivery areas…).
6. **Demo data:** `src/seed.js` contains sample names, towns and texts; replace or do not run it in production.
7. **Defaults** in `src/lib/settings.js` (`DEFAULTS`) for a brand-new database.

---

## 15. Demo data

`npm run demo` wipes the database and creates realistic data for one season and a half:

- Staff: an admin (credentials from `.env` or `admin/admin123`), two accountants, three sales people (one blocked; the first one is the **top performer** — sales are distributed with weights 3 : 1.6 : 1), two drivers. Logins printed at the end.
- 6 categories, 15 items with demo illustrations, 40 clients around Beirut (most pinned on the map).
- ~250 sales over 15 months following a winter-heavy seasonal curve; ~38% of larger sales on installments with varied plans and realistic payment history (some overdue).
- 21 days of driver rides that follow **real road routes** (pre-computed with OSRM from OpenStreetMap data and stored in `src/demo-routes.json`, so seeding works offline): GPS fixes every 150–300 m with a few metres of noise, a stop at the client, the way back; odometer readings; gas charges; one driver currently on a ride and one with GPS on.
- Website content (offers, services, team, certificates, brand logos), activity log entries.
- 46 leads across all sources and pipeline stages with notes, owners and follow-ups.
- Assistant knowledge: default how-to answers, three taught website answers (warranty, payment methods, delivery areas), a few learned wordings, a few open questions on the training page, and three website chats answered by the real assistant (one creating a call-back lead).

---

## 16. Automated tests

`npm test` runs 34 end-to-end tests against a temporary database with the real server (each file wraps its tests in one `describe` block because Node 18's test runner ignores top-level hooks). Verified on Node 18.16, 22, 24 and 26, with both database engines.

| File | Covers |
|---|---|
| `smoke.test.js` | Installment schedule maths; website and access rules; initial admin; cross-site block; items with image upload; staff accounts; sale on installments (totals, TVA, stock, commission, schedule, receipt); recording a payment; sales person commission; driver ride GPS distance and gas; blocking a user |
| `leads.test.js` | Manual leads, phone duplicates, client matching; pipeline, convert, auto-won, lost; Meta verification and signatures; WhatsApp, Messenger, Instagram and Lead Ads payloads; inbound API key and source normalisation; sales people see only their leads |
| `assistant.test.js` | Catalogue answers and model disambiguation; recommendation; Arabic/Arabizi; call-back lead; unknown → training → answered; learning from choices; 👎 → training; dashboard figures from the database; client look-up; how-to; admin-only access; private conversations |
| `maps.test.js` | Google Maps link formats; short links, consent redirects and page fallback (simulated Google); refusing non-Google hosts; saving a client from a link; ride routes: chunked matching with automatic chunk-size reduction, caching, sparse rides (simulated OSRM) |
| `admin-setup.test.js` | `.env` reading in Windows encodings; demo admin from `.env`; `reset-admin` (new password, unblock, sign-out, refusals, create missing admin) |

---

## 17. Installation, operation and troubleshooting

```bash
npm install
npm run demo
npm start
```

Open `http://localhost:3000` (website) and `/login` (dashboard).

| Problem | Cause and fix |
|---|---|
| `Unsupported engine` / "needs Node.js 18.16 or newer" | Update Node.js (latest LTS recommended) |
| `node: bad option: --env-file-if-exists` | Old version of the project; current scripts do not use Node flags |
| npm prints a `node-gyp` / `distutils` / Visual Studio error | On Node 22.13+: harmless — the optional `better-sqlite3` is skipped and `node:sqlite` is used. On Node 18–22: the ready-made binary could not be downloaded from github.com (network); retry |
| Windows `EPERM` during install | A program holds files in `node_modules`; close it, delete `node_modules`, reinstall |
| "Wrong username or password" after editing `.env` | `.env` only creates the admin on an empty database or in the demo; run `npm run reset-admin`. `npm start` shows which settings file it read |
| `.env` ignored on Windows | Named `.env.txt` (read, with a warning) or saved as UTF-16 (read). It must be in the project root |
| Sign-in works on `localhost` but not from a phone on the network | `NODE_ENV=production` makes cookies HTTPS-only; keep it off locally or use HTTPS |
| Grey maps | No internet access to OpenStreetMap; a notice is shown in the map |
| Driver GPS does not start on a phone | Browsers allow GPS only on HTTPS (or `localhost`) |
| Ride shows a dashed line | The routing server was unreachable or `ROUTING_URL=off` |

---

## 18. Current deployment model

One Node.js process serves the website and the dashboard on **one host name**, e.g. behind nginx or Caddy with HTTPS:

1. Latest Node.js LTS on the server (or the included `Dockerfile`: Node 26 slim image, `npm ci --omit=dev --omit=optional`, data volume `/data`).
2. `NODE_ENV=production`, `TRUST_PROXY=1`, `TZ=<zone>`, strong `ADMIN_PASSWORD`, `DATA_DIR` on persistent storage.
3. Keep the process alive (systemd, pm2 or Docker) and back up `DATA_DIR` daily.

---

## 19. Task brief A — MySQL / MariaDB database for phpMyAdmin

> **Status: to be designed and implemented** (not started). This section states the aim and the requirements for whoever builds it.

**Aim.** Store all the system's data in a **MySQL 8 / MariaDB 10.6+ database managed with phpMyAdmin**, created from a **`.sql` file** that can be imported in phpMyAdmin (Import tab), so that the hosting company's database, backups and tools can be used, and the data is safer and easier to administer than a single file.

**Deliverables.**

1. A `.sql` schema file importable in phpMyAdmin that creates **every table in section 6** with the same table and column names (so data can be copied 1:1), plus:
   - InnoDB, `utf8mb4` / `utf8mb4_unicode_ci` (Arabic, French, emoji);
   - proper types: `INT UNSIGNED AUTO_INCREMENT` keys (`BIGINT` for `activity_log` and `driver_locations`), `DECIMAL(12,2)` money, `DECIMAL(5,2)` rates, `DECIMAL(9,6)` coordinates, `DATETIME` (UTC) timestamps, `DATE` for local dates, `TINYINT(1)` flags, `ENUM` (or `CHECK`) for roles/statuses/sources/kinds, `JSON` for transcripts, state and road paths;
   - all foreign keys with the same delete rules as section 6.2, and indexes for every filter used by the pages (dates, status, phone key, source + external id, owner, due dates, active rides…);
   - default settings rows (section 5.3) with neutral values;
   - optional read-only reporting views (monthly sales, overdue installments, low stock, commission per sales person) useful in phpMyAdmin.
   - Notes: the first admin is not inserted by SQL (passwords are scrypt hashes generated by the application — section 7); `CREATE DATABASE` lines commented out for shared hosting.
2. A **database layer change** in the application so it can run on MySQL: today all SQL goes through `src/db.js` → `src/sqlite.js` with a **synchronous** API. MySQL drivers (`mysql2`) are asynchronous, so routes and libraries must become `async` (Express 5 already supports async handlers). Suggested approach: a small repository/data-access layer, `DB_CLIENT=sqlite|mysql` in configuration, SQLite kept for local development and tests.
3. **SQL dialect conversions** to handle: `datetime('now')` → `UTC_TIMESTAMP()`; `date(x,'localtime')` / `strftime(…, 'localtime')` → `DATE(CONVERT_TZ(x,'+00:00', @tz))` / `DATE_FORMAT`; `date('now','localtime')` → `CURRENT_DATE` in the configured zone; `||` string concatenation → `CONCAT()`; `COLLATE NOCASE` → case-insensitive collation; `INSERT OR IGNORE` → `INSERT IGNORE`; `GROUP_CONCAT` (same name); boolean sums (`SUM(status = 'won')`) work in MySQL; named parameters `@name` → `?` or the driver's named placeholders; `lastInsertRowid` → `insertId`; `PRAGMA` calls removed; transactions with a connection from the pool (nested → savepoints).
4. A **one-time migration script** that copies an existing SQLite database into MySQL (table by table in foreign-key order, converting text timestamps to `DATETIME`, keeping ids, re-enabling foreign keys at the end) and checks row counts.
5. Updated tests running against both databases (e.g. MySQL in Docker in CI).

**Security requirements.** A dedicated database user with privileges only on this database (no `GRANT`, no remote root); credentials only in environment variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`); TLS to the database if it is on another host; phpMyAdmin itself protected (HTTPS, strong password, IP restriction or extra HTTP auth, never on the public website host); automatic daily dumps with retention; sessions and login attempts stored in tables (so several app servers can run behind a load balancer — today sign-in throttling is in memory).

**Acceptance criteria.** Import of the `.sql` file in phpMyAdmin succeeds on an empty database; the application runs every page and all tests on MySQL; the migration script reproduces an SQLite demo database exactly (row counts and totals per table); reports show the same numbers on both databases (time zone handled).

---

## 20. Task brief B — Domain and role subdomains

> **Status: to be designed and implemented** (not started). Today one host serves everything (section 18).

**Aim.** Put the public website on the main domain and each staff area on its own subdomain, for clarity and security:

| Host | Serves | Who may sign in |
|---|---|---|
| `example.com` (and `www.`) | Public website only (no `/login`, no dashboard routes) | — |
| `dashboard.example.com` | Admin dashboard (everything an admin has today) | admin |
| `accountant.example.com` | Accountant area (selling, clients, items, categories, leads, installment payments, own history) | accountant (optionally admin) |
| `sales.example.com` | Sales person area (my sales, commission, my leads, receipts) | sales |
| `driver.example.com` | Driver app (GPS, rides, gas) — must be HTTPS for GPS | driver |

**Requirements.**

1. **Host-based portals:** a middleware maps the request host to a portal (configuration such as `SITE_HOST`, `DASHBOARD_HOST`, `ACCOUNTANT_HOST`, `SALES_HOST`, `DRIVER_HOST`); each portal mounts only its routes; any other route returns 404 on that host. Public API endpoints stay on the right host (website chat API and Meta webhooks/inbound API on the main domain or a dedicated `api.` host).
2. **Role ↔ portal enforcement:** a user can only sign in on the portal of their role (wrong portal → message with a link to the right one); sessions record the portal (`sessions.portal`) and are rejected on any other host.
3. **Cookies:** host-only session cookies (no `Domain` attribute), `Secure`, `HttpOnly`, `SameSite=Lax` (or `Strict` on staff portals), optionally the `__Host-` prefix; a session from one subdomain must never work on another.
4. **Same-origin check** per portal host (already compares `Origin` with the request host; it must accept only the portal's own origin).
5. **DNS and TLS:** A/AAAA (or CNAME) records for each subdomain; one certificate covering all names (wildcard `*.example.com` via DNS validation, or a multi-name certificate); HTTP → HTTPS redirect; HSTS.
6. **Reverse proxy** (nginx/Caddy): one upstream app (or one per portal), `proxy_set_header Host` and `X-Forwarded-*`, `TRUST_PROXY=1`; upload size limit; optional IP allow-list or extra authentication for `dashboard.`.
7. **Hardening per portal:** `X-Robots-Tag: noindex` and no sitemap on staff portals; strict Content-Security-Policy; separate sign-in rate limits; links from the website footer to the staff portals optional.
8. **Assets:** shared CSS/JS/images can be served from each host or a common `static.` host; uploaded images (product photos) must be reachable from the website host.
9. **Configuration-driven:** with no portal hosts configured, the application keeps working on one host as today (local development).

**Acceptance criteria.** Each host serves only its portal; a session cookie from one portal is rejected on the others; a driver cannot sign in on `dashboard.`; GPS works on `driver.` over HTTPS; the website has no staff routes; all tests pass in single-host mode and in a multi-host test.

---

## 21. Change log: everything built, fixed and improved

In the order it happened.

**Initial build (requirements of phases 1–3 and the website)**
- Complete dashboard for admin, accountant, sales people and drivers; installments; receipts; statistics; stock; clients map; activity monitor; driver GPS app and live tracking; public website with content management; demo data; end-to-end tests.

**Bugs fixed during the initial build**
- Express 5 leaves `req.body` undefined on requests without a body (a block/unblock button crashed with 500) → a middleware defaults it to `{}`.
- A text edit inserted raw line-separator characters (U+2028) into a JavaScript file → syntax error → replaced with escapes.
- Demo data: wrong latitude formula for client pins; a variable used before declaration (temporal dead zone) in the ride generator → fixed.
- Test runner: `node --test test/` not accepted on newer Node → test file pattern; later `node --test` (auto-discovery) for every Node version.
- Visual fixes: mobile menu button showing on desktop, table offset in flush cards, capitalisation of "0 left", tiles wrapping, receipt number wrapping, initials colour, mobile grids.
- Maps were grey: the hosting sandbox blocked OpenStreetMap → allowed the tile host, single tile host, and an "offline" notice in the map when tiles cannot load; `Referrer-Policy` set so OpenStreetMap accepts tile requests.

**Leads CRM (added on request)**
- Multi-source inbox, pipeline, timeline, duplicates, client matching, convert to client, auto-won on sale, Meta webhooks with signature checks, inbound API with key, setup page, sales people's own leads.
- Fixes: phone matching on the last 8 digits failed between local and international formats → last **7** digits everywhere; inbox showed status-change notes as "interested in" text → filtered; action buttons wrapping → no-wrap.

**Assistants**
- First version used a third-party cloud AI API (required an API key, cost per message, data sent outside).
- **Replaced** by the built-in self-learning assistants of section 11 (no API key, no cost, data stays on the server), with the training page, learning from choices and 👍/👎, call-back leads, dashboard figures from SQL, how-to answers, Arabic/Arabizi/French understanding, and tests. Tuning during development: model numbers distinguish similar products; product words no longer push questions to the wrong skill; filler-word list no longer swallowed "hi", "thanks" or "about"; payment-method words separated from installments; unknown meaningful words (e.g. "warranty") lower confidence so new topics go to training instead of getting a wrong answer; "make/earn money" understood as revenue on the dashboard; leads filterable by channel; period labels read naturally ("in March 2026", "in the last 30 days").

**Installation and compatibility (Windows PCs with different Node versions)**
- `npm install` failed on Node 18: `better-sqlite3` 13 requires Node 22.14+ and tried to compile; compiling failed because an old global `node-gyp` (9.x) does not work with Python 3.13 (`distutils` removed). Also `node --env-file-if-exists` is not available on Node 18.
- Fixes, in steps:
  1. `.npmrc` `engine-strict=true` → a clear "not compatible" message instead of a compiler crash; `boot.js` prints a friendly Node version message.
  2. `.env` loading moved into the application (`boot.js`), so npm scripts need no Node flags.
  3. Node 18 support: `better-sqlite3` 11 (downloads a ready-made binary for Node 18/20/22 on Windows, macOS, Linux; nothing compiled).
  4. Tests restructured into `describe` blocks (Node 18 ignores top-level `before/after`).
  5. **Latest Node support** (preferred): the database engine adapter (`src/sqlite.js`) uses Node's built-in `node:sqlite` on Node 22.13+; `better-sqlite3` became an **optional** dependency, skipped automatically where it cannot be built. Verified on Node 18.16, 22, 24 and 26 from a clean install, including a simulated broken `node-gyp`.
- Admin password from `.env` was ignored after `npm run demo` (the demo always used the default) → the demo uses `ADMIN_USERNAME`/`ADMIN_PASSWORD`; new `npm run reset-admin`; documentation of when `.env` applies.
- `.env` not read on Windows (file saved as `.env.txt`, or in UTF-16 by PowerShell, or `.env.example` edited instead) → the loader reads `.env.txt` (with a warning) and UTF-16/BOM files; `reset-admin` explains the exact problem and can ask for the password interactively; `npm start` prints which settings file was read.
- `NODE_ENV=production` on a local PC made sign-in fail from other devices (HTTPS-only cookies) → `.env.example` keeps production-only settings commented out, with an explanation.

**Branding and colours (on request)**
- Company name and brand assets replaced through Settings and `public/img`; favicon and app icons generated; the logo shown in the sidebar, login, receipt, website header/footer and chat.
- Brand accent colour added to the dashboard (sidebar, active navigation, success states, charts, login side panel) and to the website (hero and inner-page headers, contact section, footer, section labels, service icons, category arrows, chat header and chips), plus tiling background patterns made of small brand shapes; primary buttons keep the action colour.
- Login page right column background fixed (dark bands beside the form).

**Demo data (on request)**
- Admin and the top sales person renamed; sales weighted so that person is the top performer in every period; matching team entries on the About page.

**Client location from Google Maps links (on request)**
- Section 10.3: place, pin, directions (destination), search and map links, typed coordinates (decimal and DMS), short links opened by the server (Google hosts only), on the client form and the Sell page quick client form, server-side reading when saving.

**Bus driver routes (on request)**
- Problem: routes were drawn as straight lines between points — across the sea and over mountains in the demo (demo rides were generated as straight lines), and from start to finish when a phone recorded only a few points.
- Fixes: demo rides now follow real road routes (pre-computed, stored offline); the ride page matches GPS traces to the roads with OSRM (chunking adapted to the public server's 10-point limit, automatic chunk reduction, throttling, caching, Douglas–Peucker simplification), uses the road route through sparse points, shows GPS points as dots (no misleading straight line), shows road distance, and explains what was drawn.

---

## 22. Known limitations

- **Driver GPS** works while the driver page is open (screen kept awake). Background tracking with the phone locked requires a native app (the `/api/driver/*` endpoints are ready for one).
- **Public map services** (OpenStreetMap tiles, OSRM demo server) are for light use; a busy deployment needs a commercial tile provider and a self-hosted OSRM (`ROUTING_URL`).
- **Google Maps short links** depend on Google's redirect format; a page with no coordinates cannot be read (the user is told to share the place or a dropped pin).
- **Meta Lead Ads** webhooks carry only ids; names and phones need the inbound API (Zapier/Make) or a Graph API token (not implemented). Messenger/Instagram leads arrive without names until edited.
- **The WhatsApp Business phone app** cannot send webhooks; only the WhatsApp Cloud API can.
- **Assistants** use rule-based language understanding: they handle the trained topics, wordings and typos well, but not long multi-part questions; Arabic support is based on vocabulary, not full morphology.
- **Single process:** sign-in throttling and caches are in memory; SQLite suits one server (see task brief A for MySQL).
- One currency per installation; no returns/refunds module; no supplier purchasing.

---

## 23. Future improvements

**Platform**
- Task briefs A (MySQL/phpMyAdmin) and B (domain and role subdomains).
- Native or installable (PWA) driver app with background GPS, offline maps and push notifications.
- Two-factor authentication for admins; password policy; session management page ("sign out other devices").
- Fine-grained permissions editor (custom roles) and per-branch access.
- Automatic encrypted backups with one-click restore; health/metrics endpoint; error tracking; CI pipeline running tests on every supported Node version.
- Multi-company (SaaS) mode: one installation serving several companies with separate data and branding.

**Business features**
- Multi-branch and multi-warehouse stock with transfers; stock movements history; barcode scanning; purchase orders and suppliers; cost price and profit margins.
- Returns, refunds, exchanges and credit notes; discounts and promo codes at the till; quotations that convert to sales.
- Multi-currency (e.g. USD and LBP) with daily exchange rate; split payments (cash + card + transfer).
- PDF invoices/receipts sent by e-mail or WhatsApp automatically; official invoice numbering per fiscal rules.
- Automatic installment reminders (WhatsApp Cloud API / SMS) before and after due dates; late fees; client statements.
- Maintenance and warranty module: registered products per client, warranty end dates, yearly service reminders, technician job tickets with schedules and maps.
- Delivery planning: assign deliveries to drivers, optimised multi-stop routes, proof of delivery (photo/signature), customer "on the way" messages.
- Sales targets and commission tiers; leaderboard.
- Leads: reply to WhatsApp/Messenger/Instagram from the inbox (two-way), Graph API enrichment of names, Lead Ads fields, round-robin assignment, SLA timers, campaign ROI reports.
- Customer portal: order history, installments, invoices, service requests.

**Website**
- Arabic (right-to-left) and French versions; currency switcher.
- Online ordering and payments; stock reservations; delivery fee calculator by area.
- SEO: sitemap, structured data (Product, LocalBusiness), Open Graph images, page speed (image sizes, lazy loading); analytics dashboard.
- Product comparison, room-size heater calculator page, reviews.

**Assistants**
- Better Arabic morphology and dialect coverage; spelling variants learned automatically from usage.
- Multi-intent questions ("price and delivery to Jbeil"); short memory of the last product/period/client for follow-up questions ("and last month?").
- Analytics: most asked topics, answer rates, unanswered trends; export/import of taught answers between installations.
- Optional plug-in for a large language model behind the same interface (kept off by default), with the built-in engine as fallback.
- Dashboard assistant actions with confirmation (e.g. "send reminders to overdue clients").

---

## 24. Glossary

| Term | Meaning |
|---|---|
| TVA | Value-added tax; item prices are stored before TVA |
| Installment plan | Schedule of payments for one sale (times, every x months, flat interest, down payment) |
| Lead | A potential customer from any channel, before or while becoming a client |
| Skill | A built-in assistant ability computed from live data |
| Taught answer | An answer written by staff on the training page |
| Learned wording | A way of asking that the assistant learned from use |
| OSRM | Open Source Routing Machine — routing engine on OpenStreetMap data (`/route`, `/match`) |
| Map matching | Snapping a noisy GPS trace onto the most likely roads |
| Portal | A subdomain dedicated to one staff role (task brief B) |
