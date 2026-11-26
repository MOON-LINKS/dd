# Work Passport — Full Engineering Brief

You are acting as a principal engineer and technical lead. Your job is to design and build **Work Passport** end to end: architecture, database, backend, mobile/web apps, security, testing, and deployment. Work phase by phase. Do not skip phases. At the end of each phase, stop, summarize what you built, list assumptions you made, and wait for my "continue" before the next phase.

---

## 1. Product in plain words

Informal workers (plumbers, drivers, cleaners, electricians, painters) have years of reliable work but no paper proof of it. Their reputation lives in people's heads.

**Work Passport** turns that into something a stranger can check: a profile of real jobs, each **confirmed by the client**, that the worker can share with anyone.

Analogy: it is a CV that the clients wrote for you, backed by real jobs.

### Core loop
1. The worker finishes a job and logs it (description, price, date, client phone number).
2. The client receives a link by SMS/WhatsApp and confirms the job with one tap. **No app, no signup for the client.**
3. Confirmed jobs build the worker's passport: number of jobs, distinct clients, repeat clients, years active, work types, ratings.
4. The worker shares a public passport link or a PDF/QR certificate with new clients, landlords, or anyone who needs proof.

### Who pays
- Phase 1 payer: the **worker** (free basic passport, paid tier for extras).
- Later (NOT in this build, design for it only): lenders and other verifiers as a second paying side.

### Biggest risk
Everything depends on the client confirmation step. If clients ignore the link, passports stay empty. The confirmation flow must be extremely fast (target: under 15 seconds, one or two taps, works on a cheap phone and a slow connection).

---

## 2. Tech stack (use exactly this unless you have a strong reason, and explain the reason)

- **Backend:** Node.js + Express (TypeScript preferred)
- **Database:** MySQL 8 (use migrations; no manual schema edits)
- **Worker app:** Flutter/Dart (iOS, Android, Web from one codebase)
- **Client confirmation page:** lightweight, fast-loading web page (plain HTML/JS or Flutter Web with a small bundle). It must work without login.
- **Real-time:** Socket.io (worker sees confirmations arrive live)
- **Payments:** Stripe subscriptions
- **Messaging:** SMS/WhatsApp through a provider-agnostic interface (adapter pattern) so the provider can be swapped per country
- **Auth:** phone number + OTP for workers; JWT access tokens + refresh tokens
- **Infra:** Docker, docker-compose for local, CI via GitHub Actions
- **Observability:** structured logging, error tracking, basic metrics

---

## 3. Non-negotiable principles

1. **Simplicity for the worker.** Logging a job must take under 20 seconds.
2. **Zero friction for the client.** No app install, no account, no password.
3. **Trust is the product.** Every design choice must make fake confirmations harder and honest ones easier.
4. **Transparent scoring.** No black-box ML in v1. Every number on a passport must be explainable in one sentence.
5. **Privacy by default.** Client phone numbers are stored hashed for matching and are never shown publicly. Workers choose what is public.
6. **Low-end device and weak network friendly.** Small payloads, offline queue for job logging, retry on reconnect.
7. **Multilingual from day one.** All strings externalized; support RTL layouts and at least English plus one additional language as a proof of the pipeline.
8. **Extensible for verifiers later.** Design a consent-based data sharing layer, but do not build lender features now.

---

## 4. Domain model (starting point, refine it and justify changes)

- `workers` — id, phone (unique), name, trade_category, city, language, created_at, status
- `clients` — id, phone_hash (unique), phone_encrypted, first_seen_at (clients are created implicitly when first referenced)
- `jobs` — id, worker_id, client_id, title, description, trade_category, price_amount, price_currency, job_date, status (`logged`, `pending_confirmation`, `confirmed`, `disputed`, `expired`), created_at
- `confirmations` — id, job_id, token_hash, channel, sent_at, opened_at, responded_at, response (`confirmed`, `denied`, `price_differs`), rating (1–5, nullable), client_comment, ip_hash, device_fingerprint_hash
- `job_evidence` — id, job_id, type (`photo`, `payment_proof`, `receipt`), file_url, created_at
- `passports` — id, worker_id, slug (unique, shareable), visibility_settings (JSON), generated_at
- `trust_signals` — worker_id, confirmed_jobs, distinct_clients, repeat_clients, tenure_months, confirmation_rate, dispute_rate, last_computed_at
- `share_links` — id, worker_id, token, expires_at, view_count
- `consents` — id, worker_id, purpose, granted_at, revoked_at (needed for the future verifier layer)
- `subscriptions` — id, worker_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end
- `audit_log` — id, actor_type, actor_id, action, entity, entity_id, metadata (JSON), created_at

Indexes, foreign keys, and soft-delete strategy are your job. Document them.

---

## 5. Phased build plan

### Phase 0 — Discovery and confirmation of assumptions
- Restate the product back to me in your own words.
- List every assumption you are about to make (target country, currencies, SMS provider, languages, legal constraints).
- Ask me up to 10 clarifying questions, ranked by how much they change the architecture.
- Propose the MVP scope in one page. Wait for approval.

### Phase 1 — Architecture and repository setup
- Propose the monorepo layout (`/backend`, `/app`, `/confirm-web`, `/infra`, `/docs`).
- Produce an architecture diagram (Mermaid) and a short ADR (architecture decision record) for each major choice.
- Set up linting, formatting, commit hooks, environment config, Docker, docker-compose, and CI skeleton.
- Definition of done: a new developer can run the whole stack locally with one command.

### Phase 2 — Database
- Write migrations for the full schema in section 4.
- Seed script with realistic demo data (workers, clients, jobs in every status).
- Definition of done: migrations run clean up and down; seed works; ER diagram exported.

### Phase 3 — Backend API
Build REST endpoints with validation, pagination, consistent error format, and OpenAPI documentation.

- Auth: request OTP, verify OTP, refresh token, logout
- Workers: profile CRUD
- Jobs: create, list, update, cancel, resend confirmation
- Confirmations: public endpoints used by the client page (token-based, rate limited)
- Passports: get own passport, public passport by slug, visibility settings
- Share: create/revoke share links, generate QR and PDF certificate
- Subscriptions: Stripe checkout session, webhook handler, plan status
- Definition of done: all endpoints documented, covered by integration tests, and runnable through a Postman/Insomnia collection you generate.

### Phase 4 — Client confirmation flow (the most important phase)
- Secure single-use confirmation tokens (random, hashed in DB, expiring).
- Message templates, short and clear, localized, with a link.
- Confirmation page: shows job summary (worker name, job, price, date) and offers three big buttons: **Confirm**, **Price was different**, **This didn't happen**. Optional 1–5 rating and short comment.
- Automatic reminders (e.g., after 24h and 72h, then expire at 7 days), with a hard cap on messages per client.
- Worker sees status change live via Socket.io.
- Page weight under 100 KB where possible, works on 3G.
- Definition of done: end-to-end demo from logging a job to seeing it confirmed live, with a recorded test script.

### Phase 5 — Worker app (Flutter)
- Screens: onboarding with OTP, home (recent jobs and passport strength), log job (fast form with saved clients and trade presets), job detail, my passport, share, settings, subscription.
- Offline queue for job logging with sync on reconnect.
- Push notifications for confirmations.
- Localization and RTL support, accessibility basics (large touch targets, readable fonts).
- Definition of done: runs on iOS, Android, and Web; key flows covered by widget/integration tests.

### Phase 6 — Public passport and certificate
- Public page at `/p/<slug>`: worker name, trade, city, verified job count, distinct clients, repeat clients, tenure, rating summary, recent confirmed jobs (only what the worker allows).
- Clear label separating **client-confirmed** from **self-reported** data.
- Printable PDF certificate with QR code that links back to the live page.
- Open Graph tags so shared links look good in chat apps.
- Definition of done: passport loads fast, is SEO-safe for opted-in workers, and never exposes private data.

### Phase 7 — Trust signals and anti-fraud
Design and implement, with a written threat model first:
- Block self-confirmation (client phone equals worker phone, same device fingerprint, same IP bursts).
- Weight by **distinct clients**, not raw job count.
- Velocity limits on job creation and confirmations.
- Detect suspicious patterns (many confirmations from one device, circular worker-client pairs, confirmations seconds after creation).
- Optional payment proof upload that raises a job's confidence level.
- Client can flag a confirmation they did not make; flagged items are excluded from scoring and reviewed.
- Transparent trust summary shown on the passport, with a plain-language explanation of each metric.
- Definition of done: unit tests for every rule, plus a simulation script that attempts common fraud patterns and shows they are caught.

### Phase 8 — Monetization
- Free tier: limited number of jobs per month, basic passport.
- Paid tier via Stripe: unlimited jobs, custom slug, PDF certificate, branded share card, priority reminders.
- Handle webhooks idempotently, failed payments, cancellations, and plan changes.
- Definition of done: full subscription lifecycle tested with Stripe test mode.

### Phase 9 — Security, privacy, and compliance
- OWASP top 10 review against the codebase, with findings fixed or documented.
- Encryption in transit and at rest for personal data; phone numbers hashed for lookup and encrypted for storage.
- Rate limiting, bot protection on public endpoints, secure headers, CORS policy.
- Data export and account deletion flows for workers; client opt-out and "stop messaging me" handling.
- Privacy policy and terms skeletons that I can give to a lawyer, listing exactly what data is collected and why.
- Definition of done: a written security checklist with every item marked done or justified.

### Phase 10 — Testing
- Unit, integration, and end-to-end tests with a coverage report.
- Load test of the public confirmation endpoint and passport page.
- Chaos checks: messaging provider down, Stripe webhook delayed, database failover.
- Definition of done: CI blocks merges on failing tests.

### Phase 11 — Deployment and operations
- Production-grade Docker images, environment configs, secrets management.
- CI/CD pipeline: test, build, deploy to staging, manual approval, production.
- Backups, migrations in deployment, health checks, uptime monitoring, alerting.
- Runbook for the five most likely incidents.
- Definition of done: one-command deploy to staging; documented rollback.

### Phase 12 — Future-proofing (design only, do not build)
- Propose how a verifier/lender module would plug in: worker-granted consent, scoped read-only API, signed passport data, audit trail, and usage-based billing.
- Identify which parts of the current schema and API already support it and which would need change.
- Definition of done: a 2-page design note.

---

## 6. How you must work

- Produce real, runnable code, not pseudo-code. Provide full file contents with paths.
- Explain every non-obvious decision in two sentences or fewer, in plain language.
- After each phase give: (1) what was built, (2) how to run and test it, (3) assumptions, (4) risks, (5) what comes next.
- If a requirement is ambiguous or two options have real trade-offs, ask me before choosing.
- Never invent library APIs; if unsure about a version or method, say so and tell me what to verify.
- Keep dependencies minimal and justify each major one.
- Write a `README.md` and a `/docs` folder that stay current as you build.

---

## 7. Out of scope for this build

- Lender or bank integrations (design note only, Phase 12)
- Payments between worker and client (Work Passport records jobs; it does not process job payments)
- Machine-learning scoring
- Marketplace or lead generation features

---

## 8. First message back to me

Start with **Phase 0** only. Restate the product, list your assumptions, ask your clarifying questions, and propose the MVP scope. Do not write code yet.
