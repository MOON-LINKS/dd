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
- **Expenses** (new — added after initial nav draft)
  - Manager logs external costs not tied to worker billing: hospital bills, government taxes, electricity, rent, fuel/transportation, etc.
  - Each expense: `category`, `amount`, `date`, `recurring` (yes/no)
  - **Optionally linked** to a specific worker and/or a specific job (nullable foreign keys) — supports future job-cost/margin analysis without forcing every expense into a job
- **Billing & Invoices**
  - Auto-generated monthly invoice per client/job
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
- [ ] Design full database schema (Workers, Jobs, Days, Expenses, Invoices, Plans, Entitlements, Assets, Bio Pages)
- [ ] Design the Bio Page snapshot generation/caching mechanism in detail
- [ ] Define exact invoice PDF layout/fields
- [ ] Define email template list and content per template
- [ ] Referral reward mechanism for the referring user (not yet decided — gift card vs payback vs other)
- [ ] Revisit worker self-service portal, GPS clock-in, certification tracking, payroll export, job cost/margin reporting, AI prediction, and marketplace/bidding once core v1 is live and proven

---

*This document reflects the state of planning as of the current conversation. Treat Sections 1–12 as settled decisions unless explicitly revisited; Section 13 is the active backlog.*
