# Delivery/Taxi/Tuktuk Live Tracking SaaS — Technical Specification

## 1. Product Concept

A live-location tracking service for independent drivers (taxi, tuktuk, delivery) and small
delivery companies, positioned as a "should-have, daily-use" tool rather than a marketplace.

- **Solo drivers** get one permanent personal "bio link" (name, phone, logo/photo) with a
  single ON/OFF tracking toggle. No per-job link creation — the driver toggles tracking on
  when working and off when not. The same link can be shared with multiple customers in one
  delivery round (e.g. a shop doing 5 stops in one trip shares one link with all 5).
- **Companies/fleets** get a branded bio link (logo, name, bio, primary/secondary colors) that
  can show a specific employee's live tracking via a URL parameter, plus an internal dashboard
  to see all active employees on one map.
- The core value is *borrowed professionalism*: an independent driver with no brand behind them
  gets an Uber-style live tracking experience for their own customers, without joining a
  platform or giving up commission.

This document is the full technical spec: stack, architecture, database schema, API design,
real-time logic, mobile app structure, public web page, security, and future improvements.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Database | MySQL via XAMPP (local dev), same schema portable to managed MySQL in production |
| Backend | Node.js (Express) |
| Real-time | Socket.io |
| Auth | JWT (access + refresh tokens) + Redis (session/refresh-token store, persistent login) |
| Mobile app | Flutter (iOS, Android, Web) — clean architecture, Provider for state, Hive for local storage |
| Public tracking page | Plain HTML + CSS + vanilla JS (no framework — must load fast on any customer's phone) |
| Maps | MapLibre GL (cost-free, fully custom styling) as default; Google Maps as a swappable
  alternative per-market if customer trust in a recognizable map brand matters more locally |

---

## 3. High-Level Architecture

```
[Flutter Driver App] --(REST: auth, profile, toggle state)--> [Node.js API]
[Flutter Driver App] --(Socket.io: emit GPS coords)--------> [Node.js Socket Server]
                                                                     |
                                                              (Redis pub/sub if scaled
                                                               across multiple Node
                                                               instances, else in-memory
                                                               room state)
                                                                     |
[Public Bio Page: HTML/CSS/JS] --(Socket.io: join room, receive coords)--> [Node.js Socket Server]
[Public Bio Page] --(REST: fetch bio/branding data)--------> [Node.js API]

[Company Dashboard: Flutter Web or same web stack] --(REST + Socket.io: all employees' rooms)--> [Node.js]

[MySQL] <---> [Node.js API]  (all persistent data: users, companies, employees, bio settings)
[Redis] <---> [Node.js API]  (refresh tokens / sessions, and optionally live "who is currently
                               tracking" state for fast lookups without hitting MySQL)
```

Key principle: **Socket.io rooms carry live location; MySQL never stores a location history
by default in v1** (avoid unnecessary writes at high frequency). If trip history/proof-of-location
becomes a requirement later (see Section 10), add a separate `location_pings` table written at a
throttled interval (e.g. every 10–15 seconds, not on every GPS update).

---

## 4. Database Schema (MySQL)

All queries against this schema **must use parameterized/prepared statements** (`?` placeholders
via `mysql2`), never string concatenation — see Section 8 (Security).

```sql
-- Solo drivers and company employees share this table; company_id is NULL for solo drivers.
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NULL,                       -- NULL = solo driver, else FK to companies.id
    slug VARCHAR(64) UNIQUE NOT NULL,           -- random, non-guessable (see Section 8)
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,        -- bcrypt
    photo_url VARCHAR(255) NULL,
    bio TEXT NULL,
    is_tracking_active BOOLEAN DEFAULT FALSE,   -- current ON/OFF toggle state
    account_status ENUM('active','suspended','trial_expired') DEFAULT 'active',
    subscription_tier ENUM('solo') NULL,        -- NULL if this user is a company employee
    billing_cycle ENUM('monthly','yearly') NULL, -- see Section 10 for plans/billing detail
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    bio TEXT NULL,
    logo_url VARCHAR(255) NULL,
    primary_color VARCHAR(7) DEFAULT '#0057FF', -- hex, editable via bio link editor
    secondary_color VARCHAR(7) DEFAULT '#00C2A8',
    subscription_tier ENUM('group_50','group_100') NOT NULL,
    billing_cycle ENUM('monthly','yearly') NOT NULL, -- see Section 10 for plans/billing detail
    seats_purchased INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Refresh tokens are mirrored in Redis for fast validation; this table is the source of
-- truth for revocation audits and "log out of all devices."
CREATE TABLE refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,   -- store a hash, never the raw token
    device_info VARCHAR(255) NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Optional, only if/when trip history or proof-of-location is needed (Section 10).
CREATE TABLE location_pings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_time (user_id, recorded_at)
);
```

Indexes: `slug` columns are already unique-indexed; add an index on `users.company_id` for
dashboard queries listing all employees of a company.

---

## 5. Backend (Node.js / Express)

### 5.1 Auth Flow (persistent login, Instagram-style)

- On login: verify `phone` + `password_hash` (bcrypt compare) with a parameterized query.
- Issue a short-lived **access token** (JWT, ~15 min expiry) and a long-lived **refresh token**
  (e.g. 60 days).
- Store the refresh token's hash in both MySQL (`refresh_tokens` table, for audit/revocation)
  and Redis (key: `refresh:<token_hash>`, value: `user_id`, TTL matching expiry) for fast
  validation without a MySQL round-trip on every refresh.
- The Flutter app stores the refresh token in Hive (encrypted box) and silently exchanges it
  for a new access token whenever the access token expires — the user is never asked to log in
  again unless they explicitly log out or the refresh token itself expires/is revoked.
- "Log out of all devices" = revoke all refresh tokens for that `user_id` in both MySQL and
  Redis.

### 5.2 REST API (indicative endpoints)

```
POST   /auth/register          - solo driver or company owner signup
POST   /auth/login              - returns access + refresh tokens
POST   /auth/refresh            - exchanges refresh token for new access token
POST   /auth/logout             - revokes current refresh token
POST   /auth/logout-all         - revokes all refresh tokens for user

GET    /me                      - current user profile
PATCH  /me                      - update bio, name, photo (solo driver)
PATCH  /me/tracking             - toggle is_tracking_active (true/false)

GET    /companies/:slug         - public: company branding for bio page
PATCH  /companies/:id           - company owner: edit name, bio, logo, colors
GET    /companies/:id/employees - dashboard: list employees + current tracking state
POST   /companies/:id/employees - add employee (generates slug, sends invite)

GET    /u/:slug                 - public: solo driver's bio data (name, phone, photo, bio)
GET    /c/:slug                 - public: company bio data + optional employee sub-resource
```

Every route that returns tracking state must check `is_tracking_active` server-side before
telling a client to expect live coordinates — never trust a `?tracking=1` query param as the
source of truth (see Section 8).

### 5.3 Socket.io Real-Time Layer

- **Room naming**: one room per user, named by their `slug` (e.g. room `driver:john-doe`).
  Company dashboards join a meta-room per company (e.g. `company:acme-42`) that the server
  fans out into individual employee rooms server-side, or simply joins all employee rooms at
  once — pick based on expected fleet size (for `fleet_100_plus`, prefer Redis-backed
  Socket.io adapter to broadcast efficiently across multiple Node instances).
- **Driver app**: on toggle ON, emits `join-room` (their own room) and starts emitting
  `location-update` events at a set interval (e.g. every 3–5 seconds, or on significant
  movement) while the toggle stays on. On toggle OFF, emits `stop-tracking`, leaves the room,
  and the server clears the "last known location" for that room so viewers see an "offline"
  state rather than a stale pin.
- **Public bio page**: joins the relevant room (`driver:<slug>` or resolved employee room) in
  read-only mode. Receives `location-update` events and updates the map marker. Receives a
  `driver-offline` event when tracking stops.
- **Scaling**: if running multiple Node.js instances behind a load balancer, use the
  `@socket.io/redis-adapter` so rooms and broadcasts work correctly across instances — this is
  what Redis is for on the real-time side, distinct from its use for refresh tokens above.

---

## 6. Flutter App (Driver-Facing)

### 6.1 Architecture

- **Clean architecture**, starting fresh: separate `data`, `domain`, `presentation` layers.
- **State management**: Provider.
- **Local storage**: Hive (encrypted boxes for tokens/sensitive data, plain boxes for cached
  profile/settings).
- **Theming**: a single `AppTheme`/`AppColors` source of truth (one Dart file defining all
  color tokens, typography, spacing) that the entire app references — changing the app's
  "mood" means editing this one file, nothing else. `ThemeData` built from these tokens.
- **Localization**: `flutter_localizations` + `.arb` files for English, French, and Arabic
  (Arabic requires RTL layout support — test all screens in RTL, not just translate strings).
- **Loaders**: no default circular `CircularProgressIndicator` usage. Use skeleton/shimmer
  "template loaders" (e.g. via `shimmer` package) shaped like the content that's loading
  (bio card skeleton, map skeleton, list-row skeletons) for a more modern feel.

### 6.2 GPS Consent & Background Operation

- **Consent screen before any tracking use**: a dedicated onboarding step explaining why
  location is needed, shown before the OS permission dialog, with a clear explanation and a
  graceful "you can enable this later in settings" path if denied — required both for good UX
  and for app store review compliance.
- **Background operation** (tracking continues if the user starts a session and locks/closes
  the phone):
  - **Android**: implement a foreground service with a persistent notification (e.g. via
    `flutter_background_service` or `foreground_task`) — Android requires a visible
    notification for reliable background location due to battery-optimization restrictions.
  - **iOS**: request "Always" location authorization, enable the `location` background mode in
    `Info.plist`. Apple's review process scrutinizes background location heavily — the app
    must clearly justify this in its privacy description text, and battery impact should be
    minimized (reduce update frequency when stationary).
  - In both cases: tracking should auto-stop after a reasonable max duration (e.g. 12 hours) as
    a safety net against a driver forgetting to toggle off and draining their battery
    indefinitely.

### 6.3 Core Screens

- Login / persistent session splash (silent refresh-token exchange before showing login screen)
- Onboarding + location permission consent
- Home: single ON/OFF tracking toggle, current bio preview, share-link button
- Bio editor: name, phone, photo, bio text
- (Company employee variant) same screen, but branding fields are locked to what the company
  set centrally
- Settings: language switch (en/fr/ar), logout, logout-all-devices

---

## 7. Company Dashboard

- Web-based (Flutter Web reusing the same codebase, or a separate lightweight web app —
  decide based on how much UI needs to differ from the driver app).
- **Live map view**: all employees currently tracking shown as pins on one map, joined via
  their individual Socket.io rooms (or the company meta-room).
- **Employee list**: name, phone, current status (tracking / offline), last-seen timestamp.
- **Bio Link Editor**: company name, bio text, logo upload, primary color, secondary color —
  these drive both the branding shown on `GET /c/:slug` and CSS variables injected into the
  public bio page (Section 9) so the page visually matches the company's brand without a
  redeploy.
- **Add/manage employees**: generate a new employee slug + invite link, deactivate an employee
  (revokes their refresh tokens and hides them from the public bio page).

---

## 8. Public Bio Link Page (HTML/CSS/vanilla JS)

Served at `/u/:slug` (solo) or `/c/:companySlug?employee=:employeeSlug` (company).

### 8.1 Structure

- Fetches bio/branding data via REST (`GET /u/:slug` or `GET /c/:slug`) on load.
- If tracking is active for that user (server-confirmed, not just because the URL has
  `?tracking=1` — see below), connects via Socket.io, joins the relevant room, and renders a
  live map pin using MapLibre GL (or Google Maps, per the swappable choice in Section 2).
- If tracking is inactive, shows the bio card only (name, phone, logo/photo) with no map —
  "driver is currently offline" state.

### 8.2 URL Parameters — Security Note

`?tracking=1` (solo) and `?employee=<slug>&tracking=1` (company) control **what the page
attempts to render**, not what the server allows. The server must independently check
`is_tracking_active` before emitting any location data into that room, regardless of what the
URL claims — treat query params as a UI hint only, never as an authorization mechanism.

Employee slugs must be random/non-sequential (e.g. a short generated string, not
`employee=1`, `employee=2`...) so that a company's full roster can't be enumerated by
incrementing a number in the URL.

### 8.3 ETA / Distance Feature

When a customer opens the tracking page:

1. **If the customer's browser location is available** (they grant `navigator.geolocation`
   permission): compute the distance and estimated time of arrival from the driver's live
   position to the customer's position (straight-line + average-speed estimate for v1; a
   routing API for a more accurate ETA can be added later — see Section 10).
2. **If the customer has not granted location** (default state, and the majority case): show
   the driver's live pin on the map plus a manual "Enable Location" button. Until clicked, show
   only the driver's position with no distance/ETA text. On click, trigger the browser's
   geolocation permission prompt and fall back to case 1 if granted, or show a static message
   ("enable location to see distance and estimated time") if denied.

---

## 9. Security Checklist (Node.js Backend)

- **All SQL** via parameterized queries (`?` placeholders, `mysql2` prepared statements) —
  never string-concatenated SQL, no exceptions.
- **Passwords**: bcrypt hashing, never stored or logged in plaintext.
- **JWT**: short-lived access tokens, refresh tokens hashed before storage (MySQL + Redis),
  rotate refresh tokens on use (issue a new one each refresh, invalidate the old).
- **Transport**: HTTPS enforced everywhere, including Socket.io connections (wss://).
- **HTTP headers**: `helmet` middleware for standard security headers.
- **Rate limiting**: on auth endpoints especially (`express-rate-limit` or Redis-backed
  limiter) to prevent brute-force login attempts.
- **Input validation**: schema validation (e.g. `zod` or `joi`) on every request body before it
  touches business logic or the database.
- **CORS**: restrict allowed origins explicitly (driver app domain, dashboard domain, bio page
  domain) rather than wildcard.
- **Slug generation**: cryptographically random, sufficient length, checked for uniqueness —
  never sequential or predictable (applies to both driver and employee slugs).
- **Environment secrets**: `.env` file (never committed), separate secrets per environment
  (local XAMPP dev vs. production).
- **Socket.io auth**: authenticate socket connections (JWT passed on connection) for any
  privileged room joins (e.g. company dashboard joining all employee rooms) — public bio-page
  viewers only need read-only, unauthenticated join rights to a single known room.

---

## 10. Plans & Billing (Paddle)

### 10.1 Plans

| Plan | Who it's for | Seats |
|---|---|---|
| Solo | Independent driver | 1 user |
| Group 50 | Small/medium delivery company | Up to 50 employees |
| Group 100 | Larger delivery company | Up to 100 employees |

Each plan is available on **monthly** or **yearly** billing. This means, at minimum, the
following billable plan variants: Solo Monthly, Solo Yearly, Group 50 Monthly, Group 50 Yearly,
Group 100 Monthly, Group 100 Yearly. Design the schema and Paddle product catalog so additional
group tiers (e.g. a future "Group 250") can be added without a schema change — see 10.3.

### 10.2 Payment Processor: Paddle

Paddle (Merchant of Record) handles checkout, recurring billing, invoicing, and tax/VAT
compliance, so the backend does not need to build its own billing logic — it only needs to:

1. **Trigger checkout**: initiate a Paddle Checkout (hosted or inline/overlay) for the selected
   plan + billing cycle, passing the internal `user_id` or `company_id` as `custom_data` /
   `passthrough` so the webhook can be matched back to the right account.
2. **Listen for webhooks** (Paddle Billing API events) and update local subscription state
   accordingly:
   - `subscription.created` / `subscription.activated` → set `account_status = 'active'`,
     store `paddle_subscription_id` and `paddle_customer_id`.
   - `subscription.updated` → e.g. plan/tier changed, seats changed — update `subscription_tier`
     and `billing_cycle`.
   - `subscription.canceled` / `subscription.past_due` → set `account_status` accordingly
     (e.g. `'suspended'`), which should also stop tracking from being toggle-able until
     resolved.
   - `subscription.trialing` (if trials are offered later) → `account_status = 'trial_expired'`
     is already modeled for the eventual expiry case.
3. **Verify webhook signatures** before trusting any payload (Paddle signs webhook requests —
   reject anything that doesn't verify).
4. **Never trust the client** to report its own subscription status — always resolve plan
   access from the webhook-driven `account_status`/`subscription_tier` fields in MySQL, checked
   server-side on any tracking-related action.

### 10.3 Schema Notes for Billing

The `users` and `companies` tables in Section 4 already include `subscription_tier` and
`billing_cycle` as separate columns (rather than combined values like `solo_monthly`) — this
keeps the plan matrix easy to extend, since adding a new seat tier or billing cadence later
doesn't require restructuring existing enum values. Both tables also need:

```sql
ALTER TABLE users
    ADD COLUMN paddle_customer_id VARCHAR(64) NULL,
    ADD COLUMN paddle_subscription_id VARCHAR(64) NULL;

ALTER TABLE companies
    ADD COLUMN paddle_customer_id VARCHAR(64) NULL,
    ADD COLUMN paddle_subscription_id VARCHAR(64) NULL;
```

## 11. Future Improvements (not required for v1)

- Routing-API-based ETA (e.g. real road-network time/distance) instead of straight-line
  estimate, once volume justifies the API cost.
- Optional `location_pings` history table (Section 4) for delivery companies wanting
  proof-of-location/dispute resolution — throttled writes, not every GPS tick.
- Per-customer accountability for multi-stop rounds (Section on bio link reuse trade-off) —
  e.g. optional per-stop confirmation codes if a company needs it.
- Panic/safety button: driver shares live location with a trusted contact independent of the
  customer-facing bio link.
- Fuzzy-radius display mode (approximate area instead of exact pin) for a pre-confirmation
  privacy step, if ever reintroducing a job-acceptance flow.
- White-label branding depth (custom domain per company, not just colors/logo).
- Push notifications (e.g. "driver is 5 minutes away") once a customer has opted into location
  sharing for ETA.

### 11.1 Additional Ideas (not yet accepted — backlog for post-v1 review)

**Trust & safety**
- Verified badge: manual or ID-based verification step (phone + optional ID photo) shown as a
  checkmark on the bio page.
- Post-session rating: lightweight star rating the customer can leave from the bio page after a
  tracking session ends, no account required on their side — builds a driver's portable
  reputation over time.
- "Connection lost" indicator: if the socket connection drops or the last update is older than
  ~30 seconds, show a stale-data warning rather than silently freezing the pin.

**Driver retention / daily habit-forming**
- Simple usage stats for solo drivers (e.g. "X people tracked you this week," total minutes
  tracked), computed from socket session logs.
- One-tap re-share: share-sheet shortcut (WhatsApp, SMS) pre-filled with a message + bio link.
- Offline grace period: hold "online" state for ~15-20 seconds after a dropped connection
  before switching the page to "offline," so flaky networks don't misrepresent the driver.

**Company-tier differentiators**
- Zone/geofence alerts when an employee enters/exits a defined delivery zone.
- Idle-time detection: flag employees toggled "on" but not moving for X minutes.
- Shift-based auto on/off: company pre-sets employee shift hours so tracking toggles
  automatically instead of relying on the employee remembering.
- Exportable reports (CSV/PDF) of tracked hours and distance, per employee/per week.

**Customer-facing polish**
- Multi-stop context line on the bio page (e.g. "this delivery is part of a multi-stop route")
  since one link may serve several stops in one round.
- Auto-detect browser language on the public bio page instead of requiring a manual switch.

**Growth / expansion**
- Per-country phone number and currency formatting built in early rather than retrofitted.
- Driver referral loop ("invite a driver, get a free month") as a low-cost, word-of-mouth
  acquisition mechanic.
- White-label-lite: company custom subdomain (e.g. track.acmedelivery.com) as a middle tier
  before full custom-domain white-labeling.
