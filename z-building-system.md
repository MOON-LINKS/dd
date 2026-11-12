# [APP_NAME] — Building Fees Manager: Build Specification (v0.1 draft)

Date: 2026-11-12. Author: product owner (solo founder, Lebanon). Status: first draft, not final.

---

## 0. Instructions to the AI model reading this

You are the lead engineer for this product. Follow these rules.

1. Read the whole document before writing code.
2. **Before coding anything**, ask the owner the questions in section 17 (recommendations) and section 18 (pricing and plans). Ask them in small groups (5 or fewer at a time). For each recommendation, get a clear "agree" or "disagree". Record the answers in `docs/DECISIONS.md`.
3. Do not invent features outside this spec. If something is missing or contradictory, ask.
4. Build in the phase order of section 16. At the end of each phase, list what was built, how to run it, and what is left.
5. All SQL must use `?` placeholders (prepared statements). Never build SQL by string concatenation.
6. The local environment is **XAMPP** (Apache + MariaDB 10.4+, phpMyAdmin). All SQL must run on XAMPP's MariaDB without changes.
7. Anything marked **[ASK]** is undecided. Anything marked **[BASELINE]** is the owner's own design and stays unless he changes it.
8. `[APP_NAME]`, brand colours and logo are placeholders. Ask for them.

---

## 1. Product overview

### 1.1 Problem
In Lebanon, residential buildings share recurring costs: water, generator ("motor"), gas, elevator, cleaning, security/concierge, maintenance. Building owners or committee heads track who paid in a WhatsApp group. It is messy: no clear list of who paid, who is late, or what is due.

### 1.2 Solution
A mobile app where the building admin issues shared payments, residents see what they owe, residents report that they paid, and the admin confirms. The app sends reminders and includes a building group chat.

### 1.3 Important boundary
**The app does not move money between residents and the admin.** It is a ledger and reminder tool. Residents pay the admin outside the app (cash, Whish, OMT). The app only records status. Do not add in-app payment collection for building fees.

### 1.4 Roles

| Role | Who | Access |
|---|---|---|
| Owner (super admin) | The founder | Private web dashboard: accounts, subscriptions, manual payment entry |
| Admin | Building owner or director | Full control of one building |
| Habitant (resident) | One login per apartment | Own payments, chat, notifications, building view |

### 1.5 Glossary
- **Charge**: a shared payment issued by the admin (UI label: "Payment"). Code uses `charge` to avoid confusion with subscription payments.
- **Share**: one apartment's part of a charge.
- **Claim**: a resident's "I paid" request waiting for admin review.
- **Subscription**: the admin's yearly plan paid to the owner.

### 1.6 Deliverables
1. MariaDB database.
2. Node.js backend (REST + Socket.IO).
3. Flutter app (admin and habitant roles in one app).
4. Owner dashboard (web).
5. Marketing website.

---

## 2. Architecture and tech stack

| Layer | Choice |
|---|---|
| Mobile app | Flutter (Android + iOS), Riverpod, Hive, `flutter_localizations` + ARB files |
| Backend | Node.js LTS, Express, `mysql2/promise` with a connection pool |
| Database | MariaDB 10.4+ (XAMPP), InnoDB, `utf8mb4_unicode_ci` |
| Cache / realtime | Redis: session checks, rate limits, Socket.IO adapter |
| Realtime | Socket.IO |
| Push | Firebase Cloud Messaging (FCM) |
| Email | Nodemailer over SMTP (provider **[ASK]**) |
| Jobs | `node-cron` daily job for subscription and due-date reminders |
| Validation | `zod` (or `joi`) on every endpoint |
| Passwords | `argon2id` (fallback `bcrypt` cost 12) |

Notes:
- XAMPP does not include Redis. On Windows use Memurai, Docker or WSL for local Redis.
- Store all timestamps in UTC. Due dates are `DATE` values interpreted in `Asia/Beirut`.
- Money is `DECIMAL(12,2)` in SQL. Never use floats; in Dart use integer cents or a decimal package.
- Phone numbers are stored in E.164 format (default country code +961).

### 2.1 Repository layout
```
/backend        Node API, sockets, jobs, email templates
/backend/sql    schema.sql, seed.sql, migrations
/app            Flutter app
/owner-dashboard
/website
/docs           DECISIONS.md, API.md
```

### 2.2 Query pattern (mandatory)
```js
const [rows] = await pool.execute(
  'SELECT id, title, due_date FROM charges WHERE building_id = ? AND status = ? ORDER BY due_date ASC LIMIT ?',
  [buildingId, 'open', String(limit)]
);
```
`building_id` always comes from the authenticated session, never from the request body.

---

## 3. Subscription, trial and billing

### 3.1 Model [BASELINE]
- One plan, yearly subscription, with a **14-day free trial**.
- Admin signs up with email and password. The account starts with `is_trial = 1` and `trial_ends_at = now + 14 days`.
- Phase 1 billing is **manual**: the admin pays the owner's Whish account (Whish payment link, card, or cash at an agent). The owner then records the payment in the owner dashboard, which creates the subscription row, sets `is_trial = 0`, and sets `ends_at = starts_at + 1 year`.
- Phase 2 replaces manual entry with **Paddle** checkout and webhooks. Design the `subscriptions` table so Paddle IDs fit without a rewrite. Paddle seller onboarding from Lebanon is unconfirmed; do not block phase 1 on it.

### 3.2 Renewal reminders [BASELINE]
A daily job (09:00 Asia/Beirut) finds subscriptions and trials ending in **15 days** and:
1. Emails the admin (template in section 13).
2. Creates an alert in the owner dashboard and emails the owner.
3. The owner dashboard shows an "Expiring soon" list with a **WhatsApp** button that opens a pre-filled reminder to the admin.

Also send at 7 days, 1 day and on expiry. `subscription_reminders` prevents duplicates.

### 3.3 Expiry behaviour [ASK]
Proposed: 7-day grace period, then the building becomes read-only (no new charges, no chat posting; history stays visible).

---

## 4. Authentication and sessions

### 4.1 Admin
- Sign-up: email, password, full name, phone. Email verification link.
- Login: email + password. Password reset by email. Change password in profile.
- Delete account: soft delete, see 5.7.

### 4.2 Habitant username [BASELINE]
- Each building has a unique **4-letter prefix** (A–Z, uppercase, e.g. `CEDR`). 26^4 = 456,976 combinations.
- Username = `PREFIX-FLOOR-APARTMENT`, e.g. `CEDR-3-2`. Generated by the server, unique across the system.
- The login belongs to the apartment, not the person.

### 4.3 Habitant login without password [BASELINE]
- The habitant enters the username. If the apartment has an active resident and **no active session**, the server creates a session and returns tokens.
- **One device only.** If an active session exists, login is refused with `ALREADY_LOGGED_IN`.
- Logging out frees the apartment for another device.
- If the wrong person is logged in, or the phone is lost, the resident messages the admin. The admin taps **Force logout** on that apartment, then the resident logs in again.
- Security weakness and proposed fix: see recommendation R1.

### 4.4 Tokens (long-lived, like Instagram)
- Access token: JWT, 15 minutes, claims `sid`, `role`, `building_id`, `actor_id`.
- Refresh token: random 256-bit opaque string, **stored only as a SHA-256 hash**, rotated on every refresh, sliding expiry of 180 days.
- Reuse of an old refresh token revokes the session.
- Redis key `sess:{sid}` is checked on every request and socket connection so force-logout is instant.
- Flutter stores tokens in `flutter_secure_storage`. Hive is only for theme and language.
- The database enforces one active habitant session per apartment (see `sessions` table).

---

## 5. Building structure, residents and archive

### 5.1 Structure
Building → floors → apartments → one active resident per apartment.
`FLOOR 1: { apartment 1: name, phone; apartment 2: ... }, FLOOR 2: { ... }`

### 5.2 Apartments
- The admin adds floors and apartments.
- An apartment can be **vacant** (empty). Vacant apartments are excluded from all charges.
- When adding a new resident, the admin picks from vacant apartments instead of recreating the floor or apartment.

### 5.3 Residents
- Fields: full name, phone, optional email, language.
- The admin can edit name, phone and other details.
- **Occupancy rule:** the admin cannot add a resident to an occupied apartment. He must archive the current resident first.

### 5.4 Archive [BASELINE]
- Archiving sets `status = 'archived'` and `archived_at`, revokes the apartment's session, and marks the apartment vacant.
- Archived residents appear on a separate **Archive** screen with their full payment history and the line "Lived here until: {date}".
- Archived residents are never deleted, so charge history stays intact.
- Unpaid shares of an archived resident stay attached to that resident and are flagged "archived resident".

### 5.5 CSV import
- The admin uploads a CSV to create floors, apartments and residents at once.
- Columns: `floor,apartment,full_name,phone,email,language`. An empty `full_name` creates a vacant apartment.
- Flow: upload → server validates → preview with row errors → admin confirms → one transaction (all or nothing).
- Provide a downloadable template file. Reject duplicate floor/apartment pairs and invalid phones.

### 5.6 Visibility setting [BASELINE]
- Building-level toggle: residents can see who paid and who did not (**public**) or cannot (**private**).
- Each charge can override the building setting.
- The admin always sees everything.

### 5.7 Admin account deletion
Soft delete: mark the admin `deleted`, revoke all sessions in the building, keep data for 30 days **[ASK]**, then purge.

---

## 6. Payments (charges) module

### 6.1 Creating a charge (admin, "+" button)
Fields: title, category (elevator, water, generator, gas, cleaning, security, maintenance, other), description, total amount, currency, **created at** (automatic), **due date**, who pays, split, visibility.

- Each charge gets a per-building reference number, shown as `#123`.
- **Who pays:** all occupied apartments, or a selected list. Example: elevator and cleaning for all; water only for apartments that have it.
- **Split modes:**
  - `equal`: total divided equally. Put rounding cents on the first shares so the sum equals the total.
  - `custom` (exceptions): the admin builds groups. Example: total $100; one apartment pays $50; five others share $50 ($10 each). The server validates that shares sum to the total.
- The create screen must be simple: default is "all apartments, equal split"; an "Exceptions" switch reveals custom groups.

### 6.2 Share status and colours

| Status | Condition | Colour |
|---|---|---|
| Unpaid | Not paid, due date not passed | Orange |
| Pending | Claim sent, waiting for admin | Orange with "pending" badge |
| Paid | Confirmed | Green |
| Overdue | Not paid and due date passed | Red |

Overdue is computed from `due_date`, not stored.

### 6.3 Habitant flow
1. Opens a charge and taps **I paid**. A claim is created; the share becomes `pending`.
2. The admin gets a notification.
3. The app then offers **Send on WhatsApp**, opening WhatsApp to the admin with a pre-filled message (section 7.3).

### 6.4 Admin flow
- Claims list: **Accept** (share → paid), **Reject** (share → unpaid, optional reason), or leave **pending**.
- The admin can **mark a share paid directly** without a claim. The resident gets a "your payment was recorded" notification.
- The admin can undo a paid mark (audit logged).
- Charge lists, as tabs: **Open**, **Overdue**, **Completed**. Each charge shows who paid and who did not.
- Beside each unpaid name: **Send reminder** (push notification to that apartment's logged-in device) and a bubble **Remind by WhatsApp** (opens WhatsApp to that resident's number with a pre-filled message).
- A charge closes automatically when all shares are paid. The admin can cancel a charge.
- **Payment history**: all charges ever created, with filters.

### 6.5 Habitant payments page
- List of charges that include the apartment, coloured per 6.2.
- Search, filter by date range and status, sort ascending or descending.
- Detail page: admin's info, amount, due date, own status, and the paid/unpaid list if visibility is public.

---

## 7. Notifications, reminders and WhatsApp

### 7.1 Channels
- In-app notification list (bell icon) for both roles, with read/unread.
- FCM push to the logged-in device.
- Socket.IO event for live updates while the app is open.

### 7.2 Notification types

| Type | To | Trigger |
|---|---|---|
| `charge_created` | Residents in the charge | Admin creates a charge |
| `charge_reminder` | One resident | Admin taps Send reminder |
| `charge_due_soon` | Unpaid residents | 3 days before due **[ASK]** |
| `charge_overdue` | Unpaid residents | Day after due date |
| `claim_submitted` | Admin | Resident taps I paid |
| `claim_accepted` / `claim_rejected` | Resident | Admin decision |
| `share_marked_paid` | Resident | Admin marks paid directly |
| `session_revoked` | Resident device | Admin force logout |
| `subscription_expiring` | Admin | 15, 7, 1 days before expiry |

Notification text is stored as a type plus parameters and rendered in the user's language on the device.

### 7.3 WhatsApp deep links
Open `https://wa.me/{digits}?text={urlencoded}` with `url_launcher`. No WhatsApp API is used. All templates exist in English, Arabic and French.

- **Admin → resident reminder:** "Hello {name}, a reminder that payment #{ref} "{title}" of {amount} {currency} for apartment {floor}-{apt} is due on {due_date}. Thank you."
- **Resident → admin after paying:** "Hi, I'm {name} from apartment {floor}-{apt} in {building}. I paid {amount} {currency} for "{title}" (#{ref})."
- **Resident → resident from chat profile:** "Hi, I'm {name} from apartment {floor}-{apt} in your building {building}."
- **Owner → admin renewal:** "Hello {name}, your [APP_NAME] subscription for {building} ends on {date}. Reply here to renew."

---

## 8. Group chat

- One group chat per building, WhatsApp-style bubbles, over Socket.IO.
- **Text and emoji only.** No pictures, files, voice or links preview. The API accepts only a `body` string, max 1,000 characters.
- Each message shows the sender's **name** (not floor or apartment). The admin's name is shown in **gold**.
- Tapping a name opens a profile sheet: name, floor, apartment, phone, and a WhatsApp button (template in 7.3).
- History loads by pagination (50 messages per page) over REST; new messages arrive by socket.
- Rate limit: 1 message per second, 20 per minute per user.
- The admin can delete any message **[ASK]**.

---

## 9. Flutter app

### 9.1 Global
- Languages: English, Arabic, French using app localization (ARB). Arabic is full RTL.
- Theme: light and dark. Theme and language are stored in **Hive** and exposed through **Riverpod**.
- State management: Riverpod. Networking: `dio` with a refresh-token interceptor.
- Role is decided at login: email + password → admin; username → habitant.

### 9.2 Navigation
- **Habitant:** fixed bottom navigation bar (Instagram style).
- **Admin:** vertical sidebar, because it has more destinations.
- For both roles, the **first** item is the Building view and the **last** item is Profile.

| # | Habitant bottom nav | Admin sidebar |
|---|---|---|
| 1 | Building (3D view) | Building (3D view) |
| 2 | Payments | Payments: Open / Overdue / Completed |
| 3 | Chat | Create payment (+) |
| 4 | Notifications (bell) | Payment requests (claims) |
| 5 | Profile | Payment history |
| 6 | | Residents (view all, add new) |
| 7 | | Apartments and floors (incl. vacant) |
| 8 | | Archive |
| 9 | | Chat |
| 10 | | Notifications (bell) |
| 11 | | Settings (visibility, language, theme) |
| 12 | | Profile |

### 9.3 Building view ("3D printed" building)
- A clean, good-looking 3D-style view of the building: floors stacked, apartments as blocks on each floor.
- Colours: green = all paid, orange = has unpaid, red = has overdue, grey = vacant. Residents see other apartments' colours only if visibility is public.
- Tap an apartment: habitant sees name and floor; admin sees resident details, open shares and quick actions (remind, mark paid, force logout, edit, archive).
- Implementation approach: see recommendation R12.

### 9.4 Screens
**Habitant:** Login, Building, Payments list (search/filter/sort), Payment detail (I paid, WhatsApp), Chat, Profile sheet from chat, Notifications, Profile (name, language, theme, **log out**).

**Admin:** Sign-up, Login, Verify email, Forgot password, Trial/subscription status banner, Building, Payments tabs, Charge detail (per-share actions), Create payment (with Exceptions), Claims, Payment history, Residents list, Add/edit resident, Apartments and floors, CSV import with preview, Archive, Chat, Notifications, Settings, Profile (**name, change password, payment history, delete account, log out**).

---

## 10. Database schema (MariaDB 10.4+, XAMPP)

```sql
CREATE DATABASE IF NOT EXISTS building_fees
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE building_fees;

CREATE TABLE owners (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  locale ENUM('en','ar','fr') NOT NULL DEFAULT 'en',
  email_verified_at DATETIME NULL,
  is_trial TINYINT(1) NOT NULL DEFAULT 1,
  trial_ends_at DATETIME NULL,
  status ENUM('active','suspended','deleted') NOT NULL DEFAULT 'active',
  deleted_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE buildings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  prefix CHAR(4) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  address VARCHAR(255) NULL,
  city VARCHAR(80) NULL,
  default_currency CHAR(3) NOT NULL DEFAULT 'USD',
  shares_public TINYINT(1) NOT NULL DEFAULT 1,
  chat_enabled TINYINT(1) NOT NULL DEFAULT 1,
  next_charge_ref INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_buildings_admin FOREIGN KEY (admin_id) REFERENCES admins(id)
) ENGINE=InnoDB;

CREATE TABLE floors (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  building_id INT UNSIGNED NOT NULL,
  floor_number SMALLINT NOT NULL,
  label VARCHAR(40) NULL,
  UNIQUE KEY uq_floor (building_id, floor_number),
  CONSTRAINT fk_floors_building FOREIGN KEY (building_id) REFERENCES buildings(id)
) ENGINE=InnoDB;

CREATE TABLE apartments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  building_id INT UNSIGNED NOT NULL,
  floor_id INT UNSIGNED NOT NULL,
  apartment_number VARCHAR(8) NOT NULL,
  username VARCHAR(24) NOT NULL UNIQUE,
  is_vacant TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_apartment (floor_id, apartment_number),
  KEY idx_apartments_building (building_id),
  CONSTRAINT fk_apartments_building FOREIGN KEY (building_id) REFERENCES buildings(id),
  CONSTRAINT fk_apartments_floor FOREIGN KEY (floor_id) REFERENCES floors(id)
) ENGINE=InnoDB;

-- One ACTIVE resident per apartment, enforced by the unique generated column.
CREATE TABLE residents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  building_id INT UNSIGNED NOT NULL,
  apartment_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(190) NULL,
  locale ENUM('en','ar','fr') NOT NULL DEFAULT 'ar',
  status ENUM('active','archived') NOT NULL DEFAULT 'active',
  moved_in_at DATE NULL,
  archived_at DATETIME NULL,
  active_apartment_id INT UNSIGNED AS (IF(status = 'active', apartment_id, NULL)) PERSISTENT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_one_active_resident (active_apartment_id),
  KEY idx_residents_building (building_id, status),
  CONSTRAINT fk_residents_building FOREIGN KEY (building_id) REFERENCES buildings(id),
  CONSTRAINT fk_residents_apartment FOREIGN KEY (apartment_id) REFERENCES apartments(id)
) ENGINE=InnoDB;

-- One ACTIVE habitant session per apartment, enforced by the unique generated column.
CREATE TABLE sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_type ENUM('owner','admin','resident') NOT NULL,
  actor_id INT UNSIGNED NOT NULL,
  building_id INT UNSIGNED NULL,
  apartment_id INT UNSIGNED NULL,
  refresh_token_hash CHAR(64) NOT NULL UNIQUE,
  device_id VARCHAR(64) NOT NULL,
  device_name VARCHAR(120) NULL,
  platform ENUM('android','ios','web') NOT NULL,
  fcm_token VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  revoked_reason ENUM('logout','admin_force','token_reuse','expired','archived','account_deleted') NULL,
  active_apartment_id INT UNSIGNED AS (
    IF(revoked_at IS NULL AND actor_type = 'resident', apartment_id, NULL)
  ) PERSISTENT,
  UNIQUE KEY uq_one_active_session (active_apartment_id),
  KEY idx_sessions_actor (actor_type, actor_id, revoked_at)
) ENGINE=InnoDB;

CREATE TABLE auth_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  purpose ENUM('verify_email','reset_password') NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  CONSTRAINT fk_auth_tokens_admin FOREIGN KEY (admin_id) REFERENCES admins(id)
) ENGINE=InnoDB;

CREATE TABLE charges (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  building_id INT UNSIGNED NOT NULL,
  ref_no INT UNSIGNED NOT NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT NULL,
  category ENUM('elevator','water','generator','gas','cleaning','security','maintenance','other') NOT NULL DEFAULT 'other',
  total_amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  split_mode ENUM('equal','custom') NOT NULL DEFAULT 'equal',
  visibility ENUM('inherit','public','private') NOT NULL DEFAULT 'inherit',
  due_date DATE NOT NULL,
  status ENUM('open','closed','cancelled') NOT NULL DEFAULT 'open',
  created_by INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME NULL,
  UNIQUE KEY uq_charge_ref (building_id, ref_no),
  KEY idx_charges_list (building_id, status, due_date),
  CONSTRAINT fk_charges_building FOREIGN KEY (building_id) REFERENCES buildings(id),
  CONSTRAINT fk_charges_admin FOREIGN KEY (created_by) REFERENCES admins(id)
) ENGINE=InnoDB;

CREATE TABLE charge_shares (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  charge_id BIGINT UNSIGNED NOT NULL,
  apartment_id INT UNSIGNED NOT NULL,
  resident_id INT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('unpaid','pending','paid') NOT NULL DEFAULT 'unpaid',
  paid_at DATETIME NULL,
  paid_via ENUM('claim','admin') NULL,
  reminder_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  last_reminded_at DATETIME NULL,
  UNIQUE KEY uq_share (charge_id, apartment_id),
  KEY idx_shares_resident (resident_id, status),
  CONSTRAINT fk_shares_charge FOREIGN KEY (charge_id) REFERENCES charges(id),
  CONSTRAINT fk_shares_apartment FOREIGN KEY (apartment_id) REFERENCES apartments(id),
  CONSTRAINT fk_shares_resident FOREIGN KEY (resident_id) REFERENCES residents(id)
) ENGINE=InnoDB;

CREATE TABLE payment_claims (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  share_id BIGINT UNSIGNED NOT NULL,
  resident_id INT UNSIGNED NOT NULL,
  note VARCHAR(255) NULL,
  status ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  decided_by INT UNSIGNED NULL,
  decided_at DATETIME NULL,
  decision_note VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_claims_share (share_id, status),
  CONSTRAINT fk_claims_share FOREIGN KEY (share_id) REFERENCES charge_shares(id),
  CONSTRAINT fk_claims_resident FOREIGN KEY (resident_id) REFERENCES residents(id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  building_id INT UNSIGNED NOT NULL,
  recipient_type ENUM('admin','resident') NOT NULL,
  recipient_id INT UNSIGNED NOT NULL,
  type VARCHAR(40) NOT NULL,
  params LONGTEXT NULL,            -- JSON string
  charge_id BIGINT UNSIGNED NULL,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notif_inbox (recipient_type, recipient_id, read_at, created_at)
) ENGINE=InnoDB;

CREATE TABLE chat_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  building_id INT UNSIGNED NOT NULL,
  sender_type ENUM('admin','resident') NOT NULL,
  sender_id INT UNSIGNED NOT NULL,
  sender_name VARCHAR(120) NOT NULL,
  body VARCHAR(1000) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  deleted_at DATETIME NULL,
  deleted_by INT UNSIGNED NULL,
  KEY idx_chat_page (building_id, id),
  CONSTRAINT fk_chat_building FOREIGN KEY (building_id) REFERENCES buildings(id)
) ENGINE=InnoDB;

CREATE TABLE subscriptions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  building_id INT UNSIGNED NOT NULL,
  plan_code VARCHAR(30) NOT NULL DEFAULT 'yearly',
  amount DECIMAL(10,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  method ENUM('whish','omt','cash','paddle','other') NOT NULL DEFAULT 'whish',
  reference VARCHAR(120) NULL,
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  status ENUM('active','expired','cancelled','refunded') NOT NULL DEFAULT 'active',
  notes VARCHAR(500) NULL,
  recorded_by INT UNSIGNED NULL,
  paddle_subscription_id VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_subs_expiry (status, ends_at),
  CONSTRAINT fk_subs_admin FOREIGN KEY (admin_id) REFERENCES admins(id),
  CONSTRAINT fk_subs_building FOREIGN KEY (building_id) REFERENCES buildings(id)
) ENGINE=InnoDB;

CREATE TABLE subscription_reminders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  subscription_id INT UNSIGNED NULL,   -- NULL = trial reminder
  kind ENUM('d15','d7','d1','expired') NOT NULL,
  period_end DATE NOT NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_reminder (admin_id, period_end, kind)
) ENGINE=InnoDB;

CREATE TABLE audit_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  building_id INT UNSIGNED NULL,
  actor_type ENUM('owner','admin','resident','system') NOT NULL,
  actor_id INT UNSIGNED NULL,
  action VARCHAR(60) NOT NULL,
  entity VARCHAR(40) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  meta LONGTEXT NULL,
  ip VARCHAR(45) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit (building_id, created_at)
) ENGINE=InnoDB;
```

Rules for the schema:
- Creating a charge, creating its shares and incrementing `next_charge_ref` happen in one transaction with `SELECT ... FOR UPDATE` on the building row.
- Habitant login runs in a transaction; a duplicate-key error on `uq_one_active_session` maps to `ALREADY_LOGGED_IN`.
- A cleanup job sets `revoked_at` on expired sessions so they do not block new logins.

---

## 11. API

Base path `/api/v1`. JSON only. Errors: `{ "error": { "code": "STRING", "message": "..." } }`.

### 11.1 Auth
| Method | Path | Notes |
|---|---|---|
| POST | `/auth/admin/register` | Starts 14-day trial |
| POST | `/auth/admin/verify-email` | |
| POST | `/auth/admin/login` | |
| POST | `/auth/admin/forgot-password`, `/auth/admin/reset-password` | |
| POST | `/auth/admin/change-password` | |
| POST | `/auth/resident/login` | Body: username, device info |
| POST | `/auth/refresh` | Rotates refresh token |
| POST | `/auth/logout` | Revokes own session |
| DELETE | `/admin/account` | Soft delete |

### 11.2 Admin: structure
| Method | Path |
|---|---|
| GET/POST/PATCH | `/admin/building` (create with prefix, settings, visibility) |
| GET/POST/DELETE | `/admin/floors` |
| GET/POST/PATCH/DELETE | `/admin/apartments` (delete only if no history) |
| GET/POST/PATCH | `/admin/residents` |
| POST | `/admin/residents/:id/archive` |
| GET | `/admin/residents/archived`, `/admin/residents/:id/history` |
| POST | `/admin/apartments/:id/force-logout` |
| POST | `/admin/import/csv/preview`, `/admin/import/csv/commit` |

### 11.3 Admin: charges
| Method | Path |
|---|---|
| POST | `/admin/charges` |
| GET | `/admin/charges?tab=open|overdue|completed&search=&from=&to=&sort=` |
| GET | `/admin/charges/:id` (with all shares) |
| POST | `/admin/charges/:id/cancel` |
| POST | `/admin/shares/:id/mark-paid`, `/admin/shares/:id/mark-unpaid` |
| POST | `/admin/shares/:id/remind` |
| GET | `/admin/claims?status=pending` |
| POST | `/admin/claims/:id/accept`, `/admin/claims/:id/reject` |

### 11.4 Habitant
| Method | Path |
|---|---|
| GET | `/me` |
| GET | `/building/overview` (floors, apartments, colours per visibility) |
| GET | `/charges?status=&from=&to=&search=&sort=asc|desc` |
| GET | `/charges/:id` (others' statuses only if public) |
| POST | `/shares/:id/claim` |
| GET | `/residents/:id/profile` (name, floor, apartment, phone) |

### 11.5 Shared
| Method | Path |
|---|---|
| GET | `/notifications`, POST `/notifications/read` |
| GET | `/chat/messages?before=&limit=50` |
| PUT | `/devices/fcm-token` |
| GET | `/subscription/status` (admin) |

### 11.6 Owner dashboard
| Method | Path |
|---|---|
| POST | `/owner/login` |
| GET | `/owner/admins?filter=trial|active|expiring|expired` |
| POST | `/owner/subscriptions` (manual Whish entry) |
| PATCH | `/owner/subscriptions/:id` |
| POST | `/owner/admins/:id/extend-trial`, `/owner/admins/:id/suspend` |
| GET | `/owner/stats` |

### 11.7 Socket.IO
- Auth: access token in the handshake. Each socket joins `building:{id}` and `user:{type}:{id}`.
- Client → server: `chat:send { body }`.
- Server → client: `chat:new`, `chat:deleted`, `notification:new`, `share:updated`, `charge:updated`, `session:revoked`.
- Use the Redis adapter.

---

## 12. Security requirements

1. Prepared statements with `?` everywhere. No string-built SQL.
2. Tenant isolation: every query filters by the session's `building_id`. Add tests proving building A cannot read building B.
3. Role checks in middleware: owner, admin, resident.
4. Passwords hashed with argon2id. Refresh tokens and email tokens stored as SHA-256 hashes.
5. Rate limits in Redis: login 5 per 15 minutes per IP and per username; chat as in section 8; reminders max 1 push per share per 12 hours **[ASK]**.
6. HTTPS only in production, `helmet`, strict CORS, request size limit 100 KB (CSV endpoint 2 MB).
7. Validate all input with schemas. Chat body: strip control characters, text only.
8. CSV import: parse safely, cap at 500 rows, escape values that start with `=`, `+`, `-`, `@` on export.
9. Audit log for: mark paid/unpaid, claim decisions, archive, force logout, subscription changes, deletes.
10. Secrets in `.env`, never in the repository. Provide `.env.example`.
11. Owner dashboard on a separate path with its own login and 2FA **[ASK]**.

---

## 13. Emails

Emails go to the **admin** (and alerts to the owner). The design must be modern and professional.

### 13.1 Design system
- Single column, 600 px max, table-based layout, inline CSS, works in Gmail, Outlook and Apple Mail.
- Header with logo, one clear headline, short body, one primary button, small footer with support WhatsApp and website.
- System font stack, generous spacing, rounded button, brand colour **[ASK]**.
- Light and dark mode support, a hidden preheader line, and a plain-text version of every email.
- Three languages; Arabic version uses `dir="rtl"`.

### 13.2 Templates
| Template | Trigger |
|---|---|
| Verify your email | Sign-up |
| Welcome, trial started | After verification |
| Trial ends in 15 / 7 / 1 days | Daily job |
| **Subscription renewal reminder (15 / 7 / 1 days)** | Daily job; shows building, end date, amount, how to pay by Whish |
| Subscription activated (receipt) | Owner records a payment |
| Subscription expired | Expiry day |
| Reset your password | Request |
| Owner alert: accounts expiring | Daily job, to the owner |

---

## 14. Owner dashboard and website

### 14.1 Owner dashboard (web, private)
- Login for the owner only.
- Accounts table: admin, building, apartments count, **trial or paid** (`is_trial`), start, end, days left, status.
- **Add payment**: pick the account, amount, method (Whish, OMT, cash), reference, start date. Saving creates the subscription and sends the receipt email.
- **Expiring soon** list (15 days) with a WhatsApp button per admin.
- Actions: extend trial, suspend, reactivate, view history.
- Stats: active buildings, trials, conversions, revenue per month.
- Tech **[ASK]**: simple React or server-rendered pages on the same Node backend.

### 14.2 Marketing website
- Pages: Home (problem, features, screenshots), Pricing, How it works, FAQ, Contact (WhatsApp), Privacy Policy, Terms.
- Three languages with RTL for Arabic.
- "Start free trial" leads to app download links and admin sign-up.
- Payment instructions for Whish now; Paddle checkout later.

---

## 15. Non-functional requirements
- API responses under 300 ms for list endpoints at 200 apartments per building.
- Pagination on every list.
- Graceful offline state in the app: cached last data, retry on reconnect.
- Automated tests for auth, single-device rule, charge splitting and tenant isolation.
- Seed script: one demo building with 5 floors, 10 apartments, sample charges.

---

## 16. Build phases and acceptance criteria

| Phase | Scope | Done when |
|---|---|---|
| 0 | Ask sections 17 and 18, write `DECISIONS.md` | Owner answered every item |
| 1 | Schema, admin auth, sessions, habitant login | Second device gets `ALREADY_LOGGED_IN`; force logout works instantly |
| 2 | Building, floors, apartments, residents, CSV, archive | Cannot add to occupied apartment; archive shows "lived here until" |
| 3 | Charges, shares, claims, notifications, WhatsApp links | $100 custom split example works; colours correct; reminders arrive |
| 4 | Chat | Text and emoji only; admin name gold; profile sheet opens WhatsApp |
| 5 | Flutter UI complete, 3 languages, themes, building view | RTL correct; theme and language survive restart |
| 6 | Owner dashboard, subscription job, emails | 15-day reminder sent once; manual payment flips `is_trial` to 0 |
| 7 | Website | Live in 3 languages |
| 8 | Hardening, tests, store submission | Security checklist in section 12 passes |

---

## 17. Recommendations — ASK THE OWNER TO AGREE OR DISAGREE WITH EACH

Model: present these one group at a time. Do not implement any of them without a clear answer.

**Security and login**
- **R1. Activation code for habitant login.** Usernames are guessable, so anyone could log in as a free apartment. Proposal: the admin's app shows a 6-digit one-time code per apartment; the habitant enters username + code on each new login. *this will be hard for admin though, so we better keep it as it is, and a user can only log into an appartment that already have a habitant name, and that its not archived*
- **R2. Auto-release inactive sessions** after 60 days so a lost phone does not block an apartment forever. *no as the admin can make them logout, auto log out after 60 days is a bit useless*
- **R3. Admin sessions:** allow the admin on several devices (phone + tablet), or one only?: *yes allow*
- **R4. Phone privacy:** let a resident hide their phone number from other residents. *yes we can have it in the profile/settings in each habitabt* 

**Payments module**
- **R5. Recurring charges:** monthly templates (generator, cleaning) that create themselves. *thats so great idea, it can be added as recurrent yea, and can be made monthly or yearly and when its due (as month or day)*
- **R6. Currencies:** support USD and LBP per charge. *also yes and the conversion rate is in admin dashboard*
- **R7. Partial payments:** allow paying part of a share, or keep paid/unpaid only. *thats another great idea, and yes we can have installements and they can be made by the habitant itself or by the admin as said about the paid one, but when the admin creates a payment he can make installements off if its a 1 time payment impoortant*
- **R8. Payment method and optional proof photo** on a claim (pictures stay banned in chat). *no mainly this let it paused*
- **R9. Expenses ledger:** the admin records what the collected money was spent on, with a building balance. *yes we can add analytics based on yearly, monthly, and by habitant names, and by apartments*
- **R10. Export:** monthly statement as PDF or Excel. *of course export and create a cronjob monthly send to admin email, and it should be specified by name phone number spent amount, amount left to pay, overall money weight etc..*
- **R11. Automatic due-soon and overdue notifications** in addition to manual reminders. *yes of course its a great professional addition, automatic say reminder, manual by adfmin say Admin (or its real name):...*

**App and product**
- **R12. Building view:** build it first as a 2.5D isometric view drawn in Flutter (fast, light), not a real 3D engine. Upgrade later if wanted. *yes i agree with it, and we let it be flexible when adding a new floor and appartment and at top a summary pf floors and appartments*
- **R13. Admin on the web:** also ship the admin side as Flutter Web, since it uses a sidebar and suits a computer. *of course Flutter can make it web, desktop app, or mobile app*
- **R14. Co-admin / committee role** (for example a treasurer). *yes its a great addition, can view payments, create new ones (based on admin acceptance or not based on admin preference when creating the treasurer account), analytics view, so now we have a new role and a new dashboard*
- **R15. Several buildings under one admin account.** *that can be great and i guess here where it comes the plans from standard to entreprize*
- **R16. Announcements:** an admin-only channel separate from the group chat. *yes of course*
- **R17. Chat moderation:** admin can delete messages, mute a resident, or turn chat off. *also of course he can*

**Business and operations**
- **R18. Expiry behaviour:** 7-day grace, then read-only. *thats great yes*
- **R19. Store rules:** keep all subscription buying on the website, with no prices or payment buttons in the app, and check current Apple and Google rules before submission. *yes mainly mobile apps will be the builder*
- **R20. Hosting:** XAMPP for development only; production on a VPS with MariaDB, Redis, Nginx, HTTPS and daily backups. *yes im aware of it*
- **R21. Paddle:** confirm that Paddle onboards and pays out a Lebanon-based seller before building the integration. *we already will keep it paused until we make our first clients and make sure that will be flexible to be added later*
- **R22. Legal pages:** privacy policy and terms, since the app stores names and phone numbers. *yes please add those all*

Also ask: product name, brand colours, logo, support WhatsApp number, sender email address, SMTP provider.
*sender email will be starting by my gamil for testing, and later will go to my VPS SMTP mail, whatsapp number not needed from my side, brand clors and logo and name will be figured out later*

---

## 18. Pricing and plans — ASK THE OWNER

1. What is the yearly price (USD assumed)?
2. Is the price per building flat, or by number of apartments (for example small / medium / large)?
3. Do we need more than one plan? If yes, what differs between them (apartment limit, chat, exports, co-admins)?
4. Yearly only, or also monthly?*yearly only for now, when i automate payments we go to monthly*
5. Is the 14-day trial full-featured? Any limit on apartments during trial? *fully featured* 
6. Discount for an admin or company that manages several buildings?
7. Is the app always free for residents? *yes, unless the admin adds a annual payment for each person for the app expenses as some do as part of building services*
8. Refund policy and grace period after expiry? *no refund, grace period 15 days after due time*
9. Promo codes or referral rewards (for example for building management companies)? *yes there will be a place in my dashboard to add coupons, and to search how many payments i got using these coupons, as i might name a coupon Sarah, and check this sales person named Sarah how much sales she made so i pay her share*
10. Should the owner dashboard support custom prices per client? *it can for now as offline payments and not using paddle but i dont want to emphasize it on my site*