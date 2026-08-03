# Workforce & Billing Management SaaS — Project Spec (Checkpoint)

**Status:** Planning / pre-development
**Purpose of this document:** Full context so any AI model or developer can pick this up and understand the product, architecture, and decisions made so far without needing the original conversation.

---
## 1. What This Is

A cross-industry SaaS that lets any company with moving/field-based workers manage: workers, jobs/tasks, hours worked, billing/invoices, expenses, and a public-facing "Bio" mini page — all from one dashboard.

This is a **separate product from Moon Links** (the developer's existing restaurant/retail digital menu SaaS), though it shares the same general stack and developer.

### Core insight driving the whole design
The product must be a **must-have, not a nice-to-have**. Lesson learned from two prior products (a bio-link generator with 0 users since 2024, and Moon Links with only 2 users in a year): businesses will say they like an idea but won't pay unless it's tied to money they're actively losing or a process they're already forced to do manually. This SaaS is designed around that lesson — it replaces real manual work (tracking hours, chasing invoices, tracking expenses) rather than adding polish.

### Target verticals (must all be servable by ONE system)
- Construction
- After-school teaching / tutoring centers
- Gyms with coaches
- Contractors
- Sales agencies
- Cleaning service agencies
- (Designed to be extensible to any future vertical with the same "workers doing jobs" shape)

---

## 2. Core Architectural Principle: ONE ENGINE, NOT ONE APP PER INDUSTRY

Do not fork the codebase per industry. Every vertical reduces to the same core entity shape:

```
Organization → Worker → Job/Task (broken into Days) → Hours logged → Bill/Invoice
                                                       → Expense (optional link to Worker/Job)
```

What differs between industries is **only labeling/text** (a "worker" is called a "coach" in a gym, a "student" in a tutoring center) — handled entirely through localization keys (see Section 6), not separate code.

Industry-specific behavior (e.g. injury/incident logging for construction, which doesn't apply to a sales agency) is built as an **optional module**, never a fork. A module can be toggled on/off per organization/plan.

### Onboarding flow
On registration — **before payment** — the user is asked what type of work/organization they run. This selection:
- Sets the `organizationType` used to drive all localized text throughout the app
- Does NOT restrict features by itself (feature access is controlled by plan, not by vertical)

All verticals must be fully built and text-ready **before the system goes live** — same underlying logic for every vertical, only text content changes.

---

## 3. Main Feature List (v1 — this is the app's sidebar/nav structure)

- **Dashboard** — overview stats (active jobs, workers, revenue this month), quick status (pending invoices, jobs in progress)
- **Workers**
  - Profile: name, profile photo (manager adds it), optional ID/passport/driver's license upload
  - Pay type per worker: `monthly` (fixed amount) OR `hourly` (rate) — see Section 4 for how this interacts with hour tracking
- **Jobs / Tasks**
  - Each job/task is broken down into **Days**
  - Built-in job templates (fixed, not user-created, in v1)
  - Status tracking: pending / in progress / done
  - **Due date**: every job has a due date set on creation
  - **Postponable**: the manager can push the due date back (e.g. delays, client request). The original due date is preserved for reference — this is not an overwrite, it's a tracked change:
    - `original_due_date` — set once at job creation, never changes
    - `due_date` — the current, possibly-postponed date; this is what the UI and any due-date sorting/filtering uses
    - `postponed_at` / `postponed_by` — audit trail, same pattern already used for retroactive hour edits on `day_assignments` (Section 4)
    - A job can be postponed multiple times; only the latest `due_date` is stored (v1 does not need a full history of every postponement, just the original vs. current)
- **Expenses** (new — added after initial nav draft)
  - Manager logs external costs not tied to worker billing: hospital bills, government taxes, electricity, rent, fuel/transportation, etc.
  - Each expense: `category`, `amount`, `date`, `recurring` (yes/no)
  - **Optionally linked** to a specific worker and/or a specific job (nullable foreign keys) — supports future job-cost/margin analysis without forcing every expense into a job
- **Upcoming Bills** (new — distinct from Expenses and from Billing & Invoices)
  - Represents money the **organization owes out** with a due date — NOT an already-paid expense, and NOT an invoice the org sends to a client
  - Manager adds a bill with an attached image/proof, a due date, and it auto-sends a reminder a set number of days before due (e.g. bill due Aug 10 → reminder sent Aug 1)
  - Marked paid/unpaid; once paid, can optionally convert into or link to an Expense record
  - Optionally linkable to a worker and/or job, same pattern as Expenses
- **Billing & Invoices** — the biggest section in the app; three phases/tabs:
  1. **History** — sending history of every invoice email dispatched to the manager (and, separately, of upcoming-bill reminders). Resend capability. This is the "did this actually go out" record, distinct from the invoices themselves.
  2. **Design** — the manager customizes the PDF invoice template: primary color, secondary color (org branding, RGB/hex picker from Settings → Org profile or here directly), logo placement. One configurable template in v1, not multiple selectable templates — that's a future add-on.
  3. **Invoices (analytics)** — the main tab. Not just a flat list — a full analytics/charts view. The manager picks a date range or month, and sees: revenue over the period, hours logged vs. hours billed, amount paid vs. amount owed, breakdown by client and by job, trends over time. Individual invoices (with PDF + `sent_at`) are still browsable here, but the primary experience is the analytics layer on top of them, not a bare table.
  - Invoices are auto-generated monthly per client/job
  - Full documented breakdown: hours worked, rate, amount paid, amount owed, revenue, and anything else added/paid/received
  - Sent to the **manager only** in v1 (not to workers)
  - Uses a PDF builder (see Section 9)
- **Clients**
  - Client profile linked to jobs
  - Post-job feedback/rating (simple star or short form) — confirmed as a good addition
- **Bio Page Builder**
  - Logo, short info/title, buttons (call button, social links)
  - Curated/gathered color pattern presets user can pick from
  - **Saved as a static snapshot** (rendered once on edit, cached, served on every visit) — NOT live-rendered per visit. This keeps per-visit cost near-zero at scale.
  - Strategic value beyond the feature itself: every org's public Bio page is free marketing surface/distribution for the platform
  - Future integrations (not v1): CV submission button (feeds into Worker applicant record), appointment booking button (feeds into Job/Shift record)
- **Referrals**
  - Auto-generated coupon per new user: first name + unique number, guaranteed no duplicates
  - One-time use, gives 10% discount to the new user
  - Reward/gift mechanism for the referring user — **decided later** (e.g. gift card or payback)
- **Settings**
  - Org profile, vertical/organizationType selection
  - Plan/subscription management
  - Payment method management (Stripe/Tap for web/Android, Apple IAP for iOS)

### Explicitly deferred to later phases (NOT in v1)
- Worker self-service login/portal (blocked deliberately — many target workers, e.g. construction laborers, may not use smartphones/software; revisit later)
- Weekly manager digest email (v1 has manager-only monthly invoice email; weekly digest is next step)
- GPS-based clock-in/out
- Certification/document expiry tracking & reminders
- Payroll export (CSV / accounting integration)
- Job cost/margin breakdown reporting
- AI model to study charts/statistics and predict revenue/payments (needs real historical data first — don't build until there's data to learn from)
- Bidding/marketplace feature — explicitly rejected for now due to integrity risk (fake emails/accounts could fake high bids); revisit only with strong identity verification
- Custom (non-built-in) job templates
- Add-on purchases on top of a plan (e.g. +10 extra workers) — explicitly deferred, considered "hard to pull" for now; base plan limits only at launch

---

## 4. Hours, Pay Type, and the Day-Based Job Structure

This is the core operational logic of the app.

- Every job/task is composed of **Days**. On each day, the manager assigns which worker(s) worked and how many hours each worked.
- **Copy/paste for speed**: the manager can copy an entire day's worker assignments (or a single worker's assignment) to another day, including the hour count, to avoid re-typing daily. Copied hours remain editable after pasting. Implementation should use a state provider (Riverpod) to hold the "clipboard" of copied assignment(s).
- **Hours are ALWAYS logged, regardless of pay type.** This is deliberate:
  - `pay_type = monthly` → worker has a fixed `monthly_amount`; hours are tracked purely for analytics/job-costing, not for calculating what's owed
  - `pay_type = hourly` → worker has an `hourly_rate`; amount owed is calculated from hours × rate
  - Keep `hours_logged` (always tracked) and `amount_owed` (calculated differently per pay_type) as clearly separate concerns in the data model — do not conflate them.
- **Retroactive edits**: the manager can go back to any previous day and add/edit a worker's hours (e.g. if a worker was forgotten). Required safeguard: once an invoice has been generated covering a period that includes that day, editing should be blocked or clearly flagged ("this day is part of an already-sent invoice — edit anyway?"). Store `edited_at` / `edited_by` on day-entries for an audit trail.

---

## 5. Expenses (Detail)

- Every expense: `category` (hospital, tax, electricity, rent, fuel/transportation, other), `amount`, `date`, `recurring` (bool)
- `linked_worker_id` — nullable, optional
- `linked_job_id` — nullable, optional
- An expense can be linked to a worker, a job, both, or neither (pure organization-level overhead like rent/taxes/electricity)

---

## 6. Localization (Text Content Per Vertical)

- **Languages required at launch: English (en), Arabic (ar), French (fr)** — all UI text must go through app localization, no hardcoded strings.
- **Vertical-aware wording pattern**: text keys are namespaced by organization type, e.g.:
  - `construction_employee_title` → "Worker"
  - `gym_employee_title` → "Coach"
  - (pattern: `{organizationType}_{fieldKey}`)
- **organizationType** is determined at registration (before payment) and stored via a Riverpod provider backed by Hive local storage (`registeredType` / `organizationType`), read on app load to select which localized strings to use.
- **Fallback requirement**: if a new vertical is added later and a specific `{newVertical}_{fieldKey}` translation doesn't exist yet in the JSON language files, the app should fall back to a `default_{fieldKey}` (e.g. "Worker") rather than breaking or showing a missing-key error. This lets new verticals launch immediately with generic wording, with custom wording patched in later without blocking release.
- All verticals' text must be fully written across all 3 languages before the system goes live (confirmed: system will be industry-ready for every planned vertical before public launch — same logic underneath, only text differs).

---

## 7. State Management & Local Storage (Flutter)

- **Riverpod** for state management (consistent with existing Moon Links stack)
- **Hive** for local persistence of:
  - Theme selection (dark/light)
  - Language selection
  - `organizationType` / `registeredType`
  - Cached plan/feature JSON (see Section 10)
- **Theme**: two themes only — dark and light. Selection persisted via a Riverpod provider backed by Hive; changes primary/secondary/etc. color tokens app-wide on selection.

---

## 8. Layout / UX

- **Desktop/laptop/tablet**: Stripe Dashboard-style layout — a side navigation bar containing the main sections listed in Section 3, with each subpage internally using cards, charts, and clickable elements in a similar clean style to Stripe's dashboard. Rationale: this SaaS is smaller in scope than Stripe's own dashboard, so the same pattern should work even better here.
- **Mobile**: responsive — sidebar collapses/hides by default, user can open/close it on demand. Same collapsible behavior should also be available on larger screens (user can close/open the sidebar whenever they want, not just on mobile).
- **Content area**: must wrap and reflow properly across breakpoints so a manager can use the app comfortably on any device.
- **Form input conventions**:
  - Since most fields in this app are required and only a minority are optional, mark the **optional fields explicitly** with an "(optional)" label rather than marking required fields with asterisks (cleaner given the field-count ratio). Revisit this convention on a per-form basis if a specific form ends up mostly-optional.
  - Use **tooltips extensively** throughout the UI to explain non-obvious fields (e.g. difference between hourly vs monthly pay type), since the target user (a busy, possibly non-technical manager) needs guidance without reading documentation.

---

## 9. Backend / Data / Documents

### Assets (logos, worker images, icons, SVGs)
- Store only the **relative filename/path** in the database (e.g. `logo.svg`, `worker_123_id.png`) — never the full URL.
- Serve via CDN: `cdn.mydomain.com/imgs/...` — the CDN base URL is prefixed at render time **in code**, not stored in the database. This means changing CDN/domain later requires updating one config value, not migrating data.

### Plans & Feature Gating
- `plans` table: `plan_id` + a feature/limits definition (e.g. `{"max_workers": 30, "modules": ["expenses", "bio_page"]}`) — either as a JSON column or a separate `plan_features` join table.
- Each organization references a `plan_id`.
- **Critical rule: the frontend reading plan features is for UX only (hiding/showing UI).** Every backend endpoint that touches a plan-limited action (e.g. adding worker #31 on a 30-worker plan, using a locked module) **must independently verify the org's plan server-side.** Never rely on frontend gating alone for enforcement.
- No add-on purchases on top of a base plan for now (explicitly deferred as "hard to pull" — revisit later; if added later, plan for an `organization_overrides` layer on top of base plan limits).

### Auth
- Login / Register
- OTP sent and verified during registration
- Account deletion requires the user to **re-enter password and email** as confirmation before deletion proceeds

### Email Templates
- Built in Node.js backend code
- **Each task/event type has its own template** (e.g. invoice email, OTP email, welcome email, etc.) — not one generic template

### PDF Builder
- Used for invoices (and later, analytics reports) — generates the full documented invoice referenced in Section 3 (hours, rate, paid, owed, revenue, etc.)

---

## 10. Payments — Dual Path (Stripe/Tap + Apple IAP)

- **Web & Android**: Stripe and/or Tap (choice depends on where the developer opens the agency/business entity)
- **iOS**: Apple In-App Purchase (IAP) — required to avoid App Store rejection for digital subscriptions purchased in-app (same pattern already used in Moon Links, where the iOS purchase UI is hidden and gated by `Platform.isIOS` checked after `kIsWeb`)
- **Recharge path matches original payment path**: a user who initially paid via web/Android recharges via Stripe/Tap (web/Android); a user who paid via Apple recharges via Apple IAP. The two payment paths do not cross.
- **Architecture requirement**: the app's own database must hold the **source of truth for subscription status** — an entitlement-style table per organization (`plan_id`, `status`, `active_until`), updated by:
  - Stripe/Tap webhook events (web/Android payments)
  - Apple server-to-server notifications (iOS payments)
  The app's feature-gating logic should only ever query this internal entitlement table — never ask Stripe/Tap/Apple directly at request time — so it doesn't matter which processor was used.

---

## 11. Pricing Model (Direction, Not Final Numbers)

- Worker/seat count is **not the sole pricing dimension** (explicitly rejected as too narrow) — still under active study.
- Directions discussed:
  - Flat tier by organization size band (covers core + a generous included usage allowance)
  - Optional module add-ons priced separately from base plan
  - Metered usage overage on high-volume features (e.g. Bio page appointment bookings, CVs received, email/SMS volume) once beyond an included allowance
  - Branch/location count as a possible multiplier for multi-site organizations
- Billing cadence: monthly or yearly subscription.
- **No add-ons at launch** (see Section 3/9) — pricing model for v1 should be plan-tier based only, without an add-on layer, until proven necessary.

---

## 12. Distribution / Go-to-Market Notes (Business Context)

- Target buyer must be able to name a concrete dollar amount lost without this tool (the "must-have" test) — this shaped every feature decision above.
- The Bio Page (Section 3) is intended to double as a distribution channel: every organization's public page is effectively free marketing exposure for the platform.
- Referral coupon system (Section 3) is the other planned organic growth lever.
- Platform/API dependency risk was deliberately avoided in this product: unlike an earlier concept involving Instagram/Facebook/TikTok/X/LinkedIn DM integration (which hit real walls — Meta App Review + business verification, TikTok having no public DM API, LinkedIn DM access being partner-gated, X DM API being expensive at scale, and the developer's own Lebanon-based Meta business verification being rejected), this workforce/billing SaaS has **no external platform gatekeeper** — it's entirely the developer's own data and Stripe/Tap/Apple billing, which have much broader country support than Stripe Connect-style payouts would.

---

## 13. Open Questions / Next Steps

- [ ] Finalize pricing tiers with concrete feature/limit numbers per tier
- [ ] Design the Bio Page snapshot generation/caching mechanism in detail
- [ ] Define exact invoice PDF layout/fields
- [ ] Define email template list and content per template
- [ ] Referral reward mechanism for the referring user (not yet decided — gift card vs payback vs other)
- [ ] Revisit worker self-service portal, GPS clock-in, certification tracking, payroll export, job cost/margin reporting, AI prediction, and marketplace/bidding once core v1 is live and proven

---

## 14. Database Schema

> **Source of truth:** `schema.sql`. This section is a human-readable reference that mirrors it exactly. If the two ever conflict, the `.sql` file wins.

### Conventions (apply to every table)
- All primary keys are UUIDs (`gen_random_uuid()`)
- Every table has `created_at` and `updated_at` (`TIMESTAMPTZ NOT NULL DEFAULT NOW()`), auto-maintained by the `set_updated_at()` trigger
- Soft deletes via `deleted_at` (nullable) on `users`, `organizations`, `workers`, `clients`, `jobs`
- All foreign keys declare explicit `ON DELETE` behaviour
- PostgreSQL extensions required: `pgcrypto` (UUIDs), `citext` (case-insensitive email)

---

### Table overview (creation order — dependency safe)

| # | Table | Purpose |
|---|-------|---------|
| 1 | `plans` | Subscription plan definitions and payment provider IDs |
| 2 | `users` | Auth accounts; soft-deleted with email+password re-confirmation |
| 3 | `organizations` | The core tenant unit; one owner user, one active plan |
| 4 | `subscribed_services` | Entitlement source of truth — the ONLY table feature gating reads |
| 5 | `assets` | Relative filenames for all uploaded files (CDN URL prefixed in code) |
| 6 | `workers` | Employees/coaches/contractors belonging to an org |
| 7 | `clients` | Client profiles linked to jobs |
| 8 | `client_feedback` | Post-job star rating + comment per client per job |
| 9 | `job_templates` | Built-in templates (not user-created in v1) |
| 10 | `jobs` | A job/task belonging to an org and optionally a client |
| 11 | `job_days` | One row per calendar day within a job |
| 12 | `day_assignments` | Worker hours logged per job day; audit trail on retroactive edits |
| 13 | `expenses` | External costs; optionally linked to a worker and/or job |
| 14 | `upcoming_bills` | Money the org owes with a due date; reminder fires N days before |
| 15 | `invoices` | Auto-generated monthly invoice per client/period |
| 16 | `invoice_line_items` | Per-worker/per-job breakdown rows inside an invoice |
| 17 | `invoice_branding` | PDF template color/logo customization per org (Design tab) |
| 18 | `bio_pages` | Public-facing org mini-page; stores static rendered HTML snapshot |
| 19 | `bio_page_buttons` | Call/link/social buttons on a bio page, ordered by sort_order |
| 20 | `referral_codes` | One auto-generated code per org (firstname + unique number) |
| 21 | `referral_uses` | Records when a code is used; tracks reward issuance |

---

### `plans`
| Column | Type | Notes |
|--------|------|-------|
| `plan_id` | UUID PK | |
| `name` | VARCHAR(100) | e.g. "Starter", "Pro", "Business" |
| `max_workers` | INT | `-1` = unlimited |
| `modules` | JSONB | Array of module keys available, e.g. `["expenses","bio_page"]` |
| `history_months` | INT | How far back the org can query historical data (default 12) |
| `stripe_price_id_monthly` | VARCHAR(100) | nullable |
| `stripe_price_id_yearly` | VARCHAR(100) | nullable |
| `tap_plan_id` | VARCHAR(100) | nullable |
| `apple_product_id_monthly` | VARCHAR(100) | nullable |
| `apple_product_id_yearly` | VARCHAR(100) | nullable |
| `is_active` | BOOLEAN | FALSE hides the plan from new signups (for retiring old plans) |

---

### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `email` | CITEXT UNIQUE | Case-insensitive |
| `password_hash` | TEXT | |
| `otp_verified` | BOOLEAN | FALSE until OTP flow completed at registration |
| `otp_code` | VARCHAR(10) | Cleared after verification |
| `otp_expires_at` | TIMESTAMPTZ | nullable |
| `full_name` | VARCHAR(200) | nullable |
| `deleted_at` | TIMESTAMPTZ | Soft delete — set only after user re-confirms email + password |

---

### `organizations`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `owner_user_id` | UUID FK → users | ON DELETE RESTRICT |
| `plan_id` | UUID FK → plans | ON DELETE RESTRICT |
| `name` | VARCHAR(200) | |
| `organization_type` | VARCHAR(50) | `construction` \| `gym` \| `tutoring` \| `contractor` \| `sales` \| `cleaning` \| … Drives all localized UI label keys |
| `logo_filename` | VARCHAR(255) | Relative filename only — CDN base URL prefixed in code |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

---

### `subscribed_services`

> **Critical:** `is_active` is the **only** field the rest of the app reads for feature gating. Never call Stripe/Tap/Apple at request time — this table is updated by webhook handlers and Apple server-to-server notifications.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `organization_id` | UUID FK → organizations | ON DELETE CASCADE |
| `plan_id` | UUID FK → plans | ON DELETE RESTRICT |
| `payment_provider` | VARCHAR(20) | `stripe` \| `tap` \| `apple` |
| `external_subscription_id` | VARCHAR(255) | Stripe sub ID / Apple original transaction ID / Tap sub ID — used by webhooks to find this row |
| `billing_cadence` | VARCHAR(10) | `monthly` \| `yearly` |
| `since` | DATE | Subscription start date |
| `active_until` | DATE | End of current paid period |
| `price` | DECIMAL(10,2) | Amount charged per cycle |
| `is_cancelled` | BOOLEAN | TRUE = do not renew, but `is_active` stays TRUE until `active_until` passes |
| `is_active` | BOOLEAN | **THE only field the app checks.** Set by webhook handlers. |

---

### `assets`

> Stores relative filenames only. CDN base URL (`cdn.mydomain.com/imgs/`) is prefixed in application code, never stored in the DB — so changing CDN requires updating one config value, not migrating data.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `owner_type` | VARCHAR(50) | Polymorphic: `organization` \| `worker` \| `bio_page` \| `upcoming_bill` |
| `owner_id` | UUID | References the owning record (no FK — polymorphic) |
| `filename` | VARCHAR(255) | Relative path only, e.g. `worker_abc123_id.png` |
| `mime_type` | VARCHAR(100) | nullable |
| `uploaded_at` | TIMESTAMPTZ | |

---

### `workers`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `organization_id` | UUID FK → organizations | ON DELETE CASCADE |
| `name` | VARCHAR(200) | |
| `profile_image_id` | UUID FK → assets | nullable, ON DELETE SET NULL |
| `id_document_id` | UUID FK → assets | nullable — optional ID/passport/license upload |
| `pay_type` | VARCHAR(10) | `monthly` \| `hourly` |
| `monthly_amount` | DECIMAL(10,2) | Required when `pay_type = monthly`. Hours still tracked for analytics. |
| `hourly_rate` | DECIMAL(10,2) | Required when `pay_type = hourly`. `amount_owed = hours × rate`. |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

DB constraint enforces that `monthly_amount` is set for monthly workers and `hourly_rate` for hourly workers.

---

### `clients`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `organization_id` | UUID FK → organizations | ON DELETE CASCADE |
| `name` | VARCHAR(200) | |
| `email` | CITEXT | nullable |
| `phone` | VARCHAR(50) | nullable |
| `notes` | TEXT | nullable |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

---

### `client_feedback`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `client_id` | UUID FK → clients | ON DELETE CASCADE |
| `job_id` | UUID FK → jobs | ON DELETE CASCADE |
| `rating` | SMALLINT | 1–5; nullable |
| `comment` | TEXT | nullable |
| `submitted_at` | TIMESTAMPTZ | |

---

### `job_templates`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `name` | VARCHAR(200) | |
| `description` | TEXT | nullable |
| `industry` | VARCHAR(50) | nullable — NULL = available to all verticals |
| `is_active` | BOOLEAN | FALSE hides from template picker |

---

### `jobs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `organization_id` | UUID FK → organizations | ON DELETE CASCADE |
| `client_id` | UUID FK → clients | nullable, ON DELETE SET NULL |
| `template_id` | UUID FK → job_templates | nullable, ON DELETE SET NULL |
| `title` | VARCHAR(200) | |
| `status` | VARCHAR(20) | `pending` \| `in_progress` \| `done` |
| `original_due_date` | DATE | Set once at creation, never changes |
| `due_date` | DATE | Current due date — updates on postponement. UI and sorting/filtering use this field. |
| `postponed_at` | TIMESTAMPTZ | nullable — set when `due_date` is pushed back |
| `postponed_by` | UUID FK → users | nullable, ON DELETE SET NULL |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

v1 stores only the original vs. current due date (no full postponement history log).

---

### `job_days`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `job_id` | UUID FK → jobs | ON DELETE CASCADE |
| `date` | DATE | |
| `invoiced` | BOOLEAN | TRUE once an invoice covers this date — blocks or flags further edits |

Unique constraint: `(job_id, date)` — one row per job per calendar day.

---

### `day_assignments`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `job_day_id` | UUID FK → job_days | ON DELETE CASCADE |
| `worker_id` | UUID FK → workers | ON DELETE RESTRICT |
| `hours` | DECIMAL(5,2) | Always logged regardless of `pay_type`. Used for both analytics and invoice calc. |
| `edited_at` | TIMESTAMPTZ | nullable — set on any retroactive edit after initial creation |
| `edited_by` | UUID FK → users | nullable, ON DELETE SET NULL |

Unique constraint: `(job_day_id, worker_id)` — one assignment per worker per day per job.

Copy/paste: Riverpod holds a "clipboard" of copied assignment(s) (full day or single worker). Pasted hours are editable. Implementation is app-side state only — no schema change needed.

---

### `expenses`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `organization_id` | UUID FK → organizations | ON DELETE CASCADE |
| `category` | VARCHAR(50) | `hospital` \| `tax` \| `electricity` \| `rent` \| `fuel` \| `transportation` \| `other` |
| `amount` | DECIMAL(10,2) | |
| `date` | DATE | |
| `recurring` | BOOLEAN | |
| `notes` | TEXT | nullable |
| `linked_worker_id` | UUID FK → workers | nullable — ON DELETE SET NULL |
| `linked_job_id` | UUID FK → jobs | nullable — ON DELETE SET NULL |

Both `linked_worker_id` and `linked_job_id` are nullable. An expense can be linked to a worker, a job, both, or neither (pure org-level overhead).

---

### `upcoming_bills`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `organization_id` | UUID FK → organizations | ON DELETE CASCADE |
| `title` | VARCHAR(200) | |
| `amount` | DECIMAL(10,2) | |
| `due_date` | DATE | |
| `reminder_days_before` | INT | Reminder fires this many days before `due_date` (default 7) |
| `is_paid` | BOOLEAN | |
| `proof_asset_id` | UUID FK → assets | nullable — attached image/receipt |
| `linked_worker_id` | UUID FK → workers | nullable |
| `linked_job_id` | UUID FK → jobs | nullable |
| `converted_expense_id` | UUID FK → expenses | nullable — populated once a paid bill is converted to an expense |

Partial index on `(due_date) WHERE is_paid = FALSE` for efficient reminder scheduler queries.

---

### `invoices`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `organization_id` | UUID FK → organizations | ON DELETE CASCADE |
| `client_id` | UUID FK → clients | nullable, ON DELETE SET NULL |
| `period_start` | DATE | |
| `period_end` | DATE | |
| `total_hours` | DECIMAL(8,2) | |
| `total_amount` | DECIMAL(10,2) | Gross amount owed for the period |
| `amount_paid` | DECIMAL(10,2) | |
| `amount_owed` | DECIMAL(10,2) | **Computed column:** `total_amount - amount_paid` |
| `pdf_asset_id` | UUID FK → assets | nullable — NULL until PDF is built |
| `sent_at` | TIMESTAMPTZ | nullable — NULL until invoice email dispatched to manager |

Feeds the Billing & Invoices **analytics tab**: queries group/aggregate `invoices` + `invoice_line_items` by date range, client, or job to drive the charts (revenue over time, hours billed vs. logged, paid vs. owed).

---

### `invoice_branding`

> Backs the Billing & Invoices **design tab** — one row per organization, holding the PDF template's color customization.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `organization_id` | UUID FK → organizations | UNIQUE — one branding config per org. ON DELETE CASCADE. |
| `primary_color` | VARCHAR(7) | Hex, e.g. `#1D9E75` |
| `secondary_color` | VARCHAR(7) | Hex |
| `logo_asset_id` | UUID FK → assets | nullable — defaults to org logo if unset |
| `updated_at` | TIMESTAMPTZ | |

One template in v1 — no multi-template selection (deferred, see Section 13).

---

### `invoice_line_items`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `invoice_id` | UUID FK → invoices | ON DELETE CASCADE |
| `worker_id` | UUID FK → workers | nullable, ON DELETE SET NULL |
| `job_id` | UUID FK → jobs | nullable, ON DELETE SET NULL |
| `description` | TEXT | |
| `hours` | DECIMAL(8,2) | nullable |
| `rate` | DECIMAL(10,2) | nullable |
| `amount` | DECIMAL(10,2) | |

One row per worker/job breakdown. Makes PDF generation and future analytics queries straightforward.

---

### `bio_pages`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `organization_id` | UUID FK → organizations | UNIQUE — one bio page per org. ON DELETE CASCADE. |
| `slug` | VARCHAR(100) UNIQUE | Public URL: `mybiopage.com/<slug>` |
| `title` | VARCHAR(200) | nullable |
| `short_bio` | TEXT | nullable |
| `color_preset` | VARCHAR(50) | Key into a curated preset list — users pick a preset, not raw hex |
| `logo_asset_id` | UUID FK → assets | nullable |
| `rendered_html` | TEXT | **Static snapshot.** Regenerated on every save, served on every public visit — no live render per visit. Keeps per-visit cost near-zero at scale. |
| `last_rendered_at` | TIMESTAMPTZ | nullable — when the snapshot was last rebuilt |
| `is_published` | BOOLEAN | FALSE = draft, not publicly accessible |

---

### `bio_page_buttons`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `bio_page_id` | UUID FK → bio_pages | ON DELETE CASCADE |
| `label` | VARCHAR(100) | |
| `url` | TEXT | |
| `button_type` | VARCHAR(20) | `call` \| `link` \| `social` |
| `sort_order` | SMALLINT | Controls display order |

---

### `referral_codes`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `organization_id` | UUID FK → organizations | UNIQUE — one code per org. ON DELETE CASCADE. |
| `code` | VARCHAR(50) UNIQUE | Auto-generated: first name + unique number, e.g. `SARA4821`. Guaranteed unique at DB level. |
| `discount_pct` | SMALLINT | Discount given to the new user who signs up with this code (default 10%) |

---

### `referral_uses`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `referral_code_id` | UUID FK → referral_codes | ON DELETE RESTRICT |
| `referred_organization_id` | UUID FK → organizations | UNIQUE — a code can only be used once per new org |
| `discount_applied_pct` | SMALLINT | Snapshot of the discount at time of use |
| `reward_type` | VARCHAR(50) | nullable — `gift_card` \| `account_credit` \| … TBD |
| `reward_value` | DECIMAL(10,2) | nullable |
| `reward_issued_at` | TIMESTAMPTZ | nullable — NULL until reward is sent to the referring org |
| `used_at` | TIMESTAMPTZ | |

---

### Indexes

**Core lookup indexes**

| Index | Table | Column(s) |
|-------|-------|-----------|
| `idx_organizations_owner` | organizations | owner_user_id |
| `idx_organizations_plan` | organizations | plan_id |
| `idx_subscribed_services_org` | subscribed_services | organization_id |
| `idx_subscribed_services_ext` | subscribed_services | external_subscription_id |
| `idx_workers_org` | workers | organization_id |
| `idx_clients_org` | clients | organization_id |
| `idx_jobs_org` | jobs | organization_id |
| `idx_jobs_client` | jobs | client_id |
| `idx_job_days_job` | job_days | job_id |
| `idx_job_days_date` | job_days | date |
| `idx_day_assignments_day` | day_assignments | job_day_id |
| `idx_day_assignments_worker` | day_assignments | worker_id |
| `idx_expenses_org` | expenses | organization_id |
| `idx_expenses_worker` | expenses | linked_worker_id |
| `idx_expenses_job` | expenses | linked_job_id |
| `idx_upcoming_bills_org` | upcoming_bills | organization_id |
| `idx_upcoming_bills_due` | upcoming_bills | due_date WHERE is_paid = FALSE |
| `idx_invoices_org` | invoices | organization_id |
| `idx_invoices_period` | invoices | organization_id, period_start, period_end |
| `idx_invoice_line_items` | invoice_line_items | invoice_id |
| `idx_bio_pages_slug` | bio_pages | slug |
| `idx_assets_owner` | assets | owner_type, owner_id |
| `idx_referral_codes_code` | referral_codes | code |

**Soft-delete partial indexes** (only scan non-deleted rows)

| Index | Table |
|-------|-------|
| `idx_organizations_active` | organizations WHERE deleted_at IS NULL |
| `idx_workers_active` | workers WHERE deleted_at IS NULL |
| `idx_clients_active` | clients WHERE deleted_at IS NULL |
| `idx_jobs_active` | jobs WHERE deleted_at IS NULL |

---

### API / hydration pattern

One API request returns a full JSON snapshot of a job's days + assignments to hydrate Riverpod state in the app. Edits happen locally; a single Save button sends the changed snapshot back in one request, and the backend upserts it into the normalized tables.

Historical access window is enforced as a query filter (`WHERE date >= NOW() - INTERVAL '{history_months} months'`) gated by `plans.history_months` — not a separate storage format. Older data can be archived to cheaper storage after the window closes and restored if the org upgrades.

---

*This document reflects the state of planning as of the current conversation. Treat Sections 1–14 as settled decisions unless explicitly revisited; Section 13 is the active backlog.*
