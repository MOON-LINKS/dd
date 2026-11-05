---
name: heaters-seo-skill
description: Complete SEO playbook for a heaters retail website in Lebanon (English main, Arabic secondary). Use it when building, auditing, writing content for, or doing link building for the heaters site.
---

# Heaters SEO Skill: Lebanon First, Worldwide Later

## 0. Context (read first)

- **Business:** a heaters retailer in Lebanon selling gas, diesel (mazout), electric, wood (sobia 7atab) and pellet heaters, plus delivery, installation and maintenance.
- **Goal:** rank on Google Search, Google Maps and AI Overviews for heater searches in Lebanon. Expanding outside Lebanon comes later.
- **System:** an admin/accountant dashboard where accountants add products (name, price, VAT on/off, image, quantity, description). Those products **automatically appear on the public website**.
- **Website structure:** a home page with 5 sections (carousel/offers, categories, services, about, contact), each linking to a sub page (products, services, about).
- **Languages:** **English is the main language. Arabic is the second.** Both are full sites, not a translation widget.
- **Sales channel reality:** most Lebanese sales close on **WhatsApp** or by phone. Prices are shown in **USD**.
- **Season:** searches peak **October to January**. New pages need **2–3 months** to rank, so seasonal content must be live by **August or early September**.

Your job as the model: follow this file when you build features, write content, review pages or plan links. Treat the hard rules in section 11 as non-negotiable.

---

## 1. Foundation decisions (before writing code)

### 1.1 Rendering (the most important rule)
- Every public page (home, categories, products, guides, contact) must be delivered as **full server-rendered HTML** (SSR or static generation).
- **Never** build the public site in Flutter Web, and never rely on loading products with JavaScript after the page opens. Google would see empty pages.
- Good stacks: Node/Express with server templates, Next.js, Astro or Nuxt, reading from the dashboard's API or database.
- The Flutter or admin dashboard is private. Its SEO doesn't matter.

### 1.2 Domain
- `.com.lb` sends the strongest "Lebanon" signal. `.com` keeps future worldwide expansion clean. If `.com` is chosen, the Lebanon signals have to come from the site itself (section 4.2).
- Never change domain after launch. A domain move costs months of rankings.

### 1.3 URL and language structure (English main)
```
https://domain.com/                         → English home (main)
https://domain.com/heaters/                 → EN all heaters
https://domain.com/heaters/diesel-sobia-mazout/
https://domain.com/heaters/diesel-sobia-mazout/{brand-model}/
https://domain.com/guides/{guide-slug}/

https://domain.com/ar/                      → Arabic home
https://domain.com/ar/heaters/diesel-sobia-mazout/
https://domain.com/ar/guides/{guide-slug}/
```
- Slugs are **English or transliterated, lowercase, hyphenated**, even on Arabic pages. Arabic slugs turn into `%D8%...` when shared on WhatsApp.
- Each page in one language has an exact counterpart in the other.
- Arabic pages: `<html lang="ar" dir="rtl">`, with fully mirrored RTL layout and a proper Arabic web font.
- English pages: `<html lang="en" dir="ltr">`.

### 1.4 hreflang (on every page, in both languages)
```html
<link rel="alternate" hreflang="en-LB" href="https://domain.com/heaters/gas/" />
<link rel="alternate" hreflang="ar-LB" href="https://domain.com/ar/heaters/gas/" />
<link rel="alternate" hreflang="x-default" href="https://domain.com/heaters/gas/" />
```
- `x-default` always points to the **English** version.
- hreflang must be **reciprocal**: both pages list each other and themselves.
- Each language version has a **self-referencing canonical**. Never point the Arabic canonical at the English page.
- The language switcher links to the matching page, not to the home page.

### 1.5 Hosting and speed
- A VPS (Europe is fine) with **Cloudflare** in front. HTTPS everywhere, with HTTP→HTTPS and non-www→www redirects (or the reverse, but pick one).
- Targets, measured on mobile 4G: LCP < 2.5s, CLS < 0.1, INP < 200ms. Check with PageSpeed Insights.

---

## 2. Technical SEO checklist (build into the system)

| Item | Requirement |
|---|---|
| Title tag | Generated per page. Product: `{Model} {Type} Heater, Price in Lebanon \| {Store}`. Arabic: `{الموديل} صوبيا {النوع} – السعر في لبنان \| {المتجر}`. Max ~60 chars |
| Meta description | Generated with price, key benefit, delivery and a WhatsApp call to action. ~150 chars. Unique per page |
| H1 | Exactly one per page (product name / category name / guide title) |
| Headings | H2 for specs, FAQ, delivery and related products |
| Product description | **Unique per product.** Never paste the manufacturer's text. Include room size heated, fuel use, power (kW), safety features, warranty and delivery |
| Specs table | HTML `<table>` on every product page |
| Images | WebP, descriptive filenames (`cast-iron-wood-stove-12kw.webp`), alt text in the page's language, `width`/`height` set, lazy-load below the first screen |
| Sitemap | `sitemap.xml` auto-generated from the database, covering both languages, with `lastmod`. Update when a product is added or edited |
| robots.txt | Disallow `/admin`, `/cart`, `/checkout` and internal search. Reference the sitemap |
| Canonicals | Filter and sort URLs (`?sort=`, `?color=`, `?page=`) carry a canonical to the clean category URL, or `noindex,follow` |
| Pagination | Crawlable `<a href>` links (`?page=2`) |
| Out of stock | **Never delete or 404 a seasonal product.** Keep the page with "Available next season" or "Back in stock soon", and schema availability `OutOfStock` or `PreOrder` |
| Discontinued product | 301 redirect to the closest product or category |
| Redirects | Keep a redirect table in the DB. Any URL change gets a 301 redirect |
| 404 page | Helpful, links to categories, returns a real 404 status |
| Breadcrumbs | Visible on every page, plus `BreadcrumbList` schema |
| Mobile | Mobile-first design, tap targets ≥ 48px, sticky WhatsApp and Call buttons |

---

## 3. Structured data (JSON-LD)

Rule: **schema must describe what is visible on the page.** Never put hidden keywords in JSON-LD.

### 3.1 Store (contact page plus site-wide footer)
```json
{
  "@context": "https://schema.org",
  "@type": "HomeGoodsStore",
  "name": "{Store Name}",
  "alternateName": "{Arabic store name}",
  "url": "https://domain.com/",
  "logo": "https://domain.com/logo.png",
  "image": "https://domain.com/store-front.webp",
  "telephone": "+961XXXXXXXX",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{Street, Building}",
    "addressLocality": "{Town}",
    "addressRegion": "{Mohafaza/Caza}",
    "addressCountry": "LB"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 0.0, "longitude": 0.0 },
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    "opens": "08:30", "closes": "18:30"
  }],
  "areaServed": ["Beirut","Mount Lebanon","North Lebanon","Bekaa","South Lebanon"],
  "sameAs": [
    "https://www.facebook.com/{page}",
    "https://www.instagram.com/{handle}",
    "https://www.tiktok.com/@{handle}"
  ]
}
```

### 3.2 Product (every product page, generated from dashboard data)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Cast Iron Wood Stove 12kW",
  "alternateName": ["Sobia 7atab", "صوبيا حطب"],
  "image": ["https://domain.com/img/cast-iron-wood-stove-12kw.webp"],
  "description": "{unique description}",
  "sku": "{SKU}",
  "brand": { "@type": "Brand", "name": "{Brand}" },
  "offers": {
    "@type": "Offer",
    "url": "https://domain.com/heaters/wood-sobia-7atab/cast-iron-wood-stove-12kw/",
    "priceCurrency": "USD",
    "price": "350.00",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@type": "Organization", "name": "{Store Name}" }
  }
}
```
- Map dashboard quantity to availability: `> 0` → `InStock`, `0` → `OutOfStock` (or `PreOrder` off-season).
- Price must match the visible price, including VAT where VAT is enabled.
- Add `aggregateRating` only if real reviews are shown on the page.

### 3.3 Also use
- `BreadcrumbList` on all pages.
- `FAQPage` on guides and categories with a visible FAQ.
- `Article` on guides, with `author` (a real person, e.g. the store technician), `datePublished` and `dateModified`.
- `WebSite` on the home page.

---

## 4. Local SEO (Lebanon)

### 4.1 Google Business Profile (the top priority)
- Primary category: **Heating equipment supplier**. Secondary categories only if true (Home goods store, Appliance store, HVAC contractor).
- Address: the most precise version possible (building, street, area). Add landmarks to the description ("near ... roundabout/church"). The pin must sit exactly on the shop.
- **Verification is usually by video.** Before starting, prepare a continuous clip showing: the street and signage → the shop entrance → the inside with stock → proof of management (keys, register, tools).
- Fill in everything: hours, phone, website (English home), WhatsApp, service areas, products (top 20 heaters with prices), services, an English description that also mentions the Arabic name.
- Photos: real storefront, interior, stock, team, delivery van. Add new photos monthly. (Geotagging photos does nothing, so skip it.)
- Posts: weekly from October to February (offers, new arrivals, safety tips).
- **Reviews:** after each delivery, send the GBP review link on WhatsApp. Ask customers to mention what they bought and where it was delivered, but **never script or fake reviews**. Reply to every review in its own language.
- Never create profiles at addresses that aren't real branches. The suspension risk is high.

### 4.2 On-site local signals
- `+961` phone number, a WhatsApp click-to-chat button, USD prices, an embedded Google Map on the contact page, the full address in the footer.
- A **Delivery & Installation** page listing real coverage areas and timing.
- Area pages **only if genuinely useful** (real showroom, delivery times, local installation photos). Never create copy-paste "heaters in {town}" pages.

### 4.3 Name, address and phone consistency
Keep one master text file with the exact business name, address, phone and website. Copy-paste it into every listing. Never vary it.

---

## 5. Internal linking

```
Home
 ├── Category hubs: Gas · Diesel (Mazout) · Electric · Wood (Sobia 7atab) · Pellet · Accessories
 │     └── Product pages → link back to their hub + 3–4 related products
 ├── Guides
 │     └── each guide → 2–3 specific products + 1 category hub
 ├── Services: Delivery & Installation · Maintenance
 └── About · Contact
```
- Every product is **3 clicks or fewer** from the home page.
- Link text is descriptive ("diesel heaters for large rooms"), never "click here".
- Each category hub has a "Buying guides" block linking to its related guides.
- No orphan pages: every page has at least one internal link pointing to it.
- Arabic pages link only to Arabic pages, and English pages to English, apart from the language switcher.

---

## 6. Off-site links and listings

Before submitting anywhere, check the site's authority with the free Ahrefs Website Authority Checker or Moz. Note whether the link is dofollow or nofollow.

### Tier 1: Profiles (week 1)
Google Business Profile · Bing Places (feeds Bing, ChatGPT search and Copilot) · Apple Business Connect · Facebook Page · Instagram · TikTok · YouTube · LinkedIn company page.

### Tier 2: Lebanese directories and marketplaces (week 2–3)
- **Kompass Lebanon** (lb.kompass.com): pick the heater and space-heater categories
- **Yelleb.com**, a Lebanese business directory
- **5index.com**, a Lebanese business directory
- **Dun & Bradstreet** (dnb.com): claim or create the company record
- **LibanMall**, a Lebanese marketplace with a store page
- **OLX Lebanon** (olx.com.lb): a business account with seasonal listings, for traffic and brand searches

### Tier 3: Institutions (month 2)
- Chamber of Commerce: CCIA-BML (Beirut & Mount Lebanon), or the Tripoli or Saida chamber depending on the shop's location
- Association of Lebanese Industrialists (only if the business manufactures or assembles)
- AmCham Lebanon (only if it imports American brands)

### Tier 4: The highest-value links (ongoing)
1. **Brand dealer pages:** ask every brand the store carries to list it on "Where to buy / Distributors – Lebanon".
2. **Lebanese media and blogs:** pitch real stories (the monthly heating cost index, safety campaigns, heater donations to schools). Paid posts must be marked sponsored and nofollow.
3. **Partners:** solar installers, generator operators, contractors, interior designers.
4. Case studies or mentions from related businesses the owner actually works with. One or two only.

### Never
Buying link packages, "500 directory submissions", private blog networks, buying spare domains and redirecting them, link exchanges at scale, or submitting to many sites in a single day.

---

## 7. Content strategy

### 7.1 Rules for every article
- Publish in **English first** (main), then a **native Arabic version** at the matching `/ar/` URL with hreflang. Arabic must be written or edited by a native speaker. No raw machine translation.
- One main question per article, **answered in the first 2 sentences**. That's what AI Overviews quote.
- Include a comparison or specs table, an FAQ section (with FAQ schema) and **real store photos**.
- Link to at least **2 products and 1 category hub**.
- Show an author or reviewer (e.g. "Reviewed by {Name}, heating technician, X years").
- Use real local data: Lebanese fuel prices, ampere subscriptions, real room sizes, real towns.
- Never publish unedited AI text. Low-effort AI content at scale gets hit by Google core updates.
- Add a visible "Last updated: {date}" and update guides yearly before the season.

### 7.2 Content plan (about 30 articles)

**Cluster 1: Buying guides (closest to a sale)**
1. Gas vs Diesel vs Electric vs Wood Heater: Which Is Best for Lebanese Homes?
2. What Size Heater Do I Need? kW Guide for 20m² to 100m² Rooms
3. Best Heaters for Mountain Homes (Faraya, Ehden, Zahle, Bhamdoun)
4. Best Heaters for Coastal Apartments (Beirut, Jounieh, Saida)
5. Diesel (Mazout) Heaters: Complete Buying Guide
6. Wood Stove Buying Guide: Cast Iron vs Steel
7. Gas Heater Buying Guide: Catalytic vs Infrared vs Blue Flame
8. Pellet Stoves in Lebanon: Worth It?
9. Best Heaters Under $100 / $300 / $600 This Winter

**Cluster 2: Cost and electricity (the Lebanese angle, which attracts links)**
10. Real Cost per Hour: Diesel vs Gas vs Electric vs Wood in Lebanon (updated monthly). This is the flagship link-magnet piece
11. Which Heater Works on a 5A / 10A Generator Subscription?
12. Heating During Power Cuts: Heaters That Need No Electricity
13. Can You Run an Electric Heater on Solar Panels & Batteries?
14. How Much Diesel Does a Heater Burn per Night?
15. 5 Ways to Cut Your Heating Bill This Winter

**Cluster 3: Safety (trust)**
16. Carbon Monoxide & Gas Heaters: Signs, Prevention, Ventilation
17. Is It Safe to Sleep with a Gas Heater On?
18. Heater Safety with Kids & Pets
19. How to Install a Wood Stove Chimney Correctly
20. Gas Cylinder Safety: Leaks, Hoses & Regulators

**Cluster 4: Maintenance (traffic outside the season)**
21. Pre-Winter Heater Checklist: 10 Things Before First Use (publish in September)
22. How to Clean a Diesel Heater & Replace the Wick
23. Why Does My Heater Smell? Causes & Fixes
24. How to Store Your Heater in Summer
25. Common Heater Problems & When to Call a Technician (links to the service page)

**Cluster 5: Comparisons**
26. {Brand A} vs {Brand B} (only brands in stock)
27. Best-Selling Heaters This Winter in Our Store (real sales data)
28. Oil Radiator vs Fan Heater vs Ceramic Heater
29. New vs Used Heaters: What to Check Before Buying Second-Hand

**Cluster 6: Local and seasonal**
30. Heater Delivery & Installation Across Lebanon
31. Winter Storm Prep Guide for Lebanese Homes
32. Pre-Winter Heater Deals (the same URL every year, updated each season)
33. Case studies: real installations, with photos and the customer's permission

### 7.3 Publishing calendar
| Period | Publish / update |
|---|---|
| Nov–Dec | #1, #10, #11, #12, #16, #17 |
| Jan–Feb | Comparisons, best-sellers, case studies |
| Mar–May | Maintenance and storage (#22–25) |
| Jun–Aug | Refresh all buying guides, publish #2–#4, update prices in #10 |
| September | Pre-winter checklist (#21), deals page (#32). Everything should already be indexed |

---

## 8. Franco-Arabic policy (important)

Lebanese users search in Franco-Arabic (e.g. "sobia", "sobia mazout", "sobia 7atab", "sobba"), but Franco in body text looks unprofessional. Hidden Franco in JSON or hidden text **does not rank and violates Google's guidelines**. So use it **only** in these places:

| Place | Allowed usage |
|---|---|
| URL slugs | ✅ e.g. `/heaters/diesel-sobia-mazout/`, `/heaters/wood-sobia-7atab/` |
| Schema `alternateName` | ✅ Real alternative product or category names only (1–2), e.g. `["Sobia 7atab", "صوبيا حطب"]`. Never a keyword list |
| Category H1 or first line | ✅ **One** bracketed translation per category, e.g. *Wood Stoves (Sobia 7atab / صوبيا حطب)* |
| FAQ questions | ✅ Customer voice, e.g. *"Is a sobia mazout cheaper than a gas heater?"*. Answer in proper English |
| Image alt text | ✅ Only where it really describes the image, max one per page |
| Google Ads keywords | ✅ Unlimited (users never see them) |
| GBP posts, social captions, hashtags, OLX titles | ✅ Casual tone is fine there |
| Body paragraphs, product descriptions, titles, meta descriptions | ❌ |
| Hidden text, `display:none`, keyword lists inside JSON-LD, meta keywords | ❌ Never |

After launch: in Search Console → Performance → Queries, filter for "sobia" to see which pages need it reinforced.

---

## 9. Measurement and indexing

1. **Google Search Console:** verify the domain property, submit the sitemap, and request indexing for key pages. Weekly, check Pages (watch "Crawled – currently not indexed"), Performance and Core Web Vitals. Use the AI Overviews / AI Mode reports where available.
2. **Bing Webmaster Tools:** import from Search Console. Bing powers ChatGPT search and Copilot.
3. **GA4:** set up conversions for `whatsapp_click`, `call_click`, `form_submit`, `add_to_cart` and `purchase`. Without WhatsApp and call tracking, SEO will look like it "doesn't convert".
4. Use UTM tags on GBP website links (`?utm_source=google&utm_medium=organic&utm_campaign=gbp`).
5. **During a Google core update:** don't make reactive changes. Note the dates, wait until the rollout completes, then analyze.
6. Track monthly: impressions and clicks by language, top queries, GBP calls and direction requests, number of reviews, WhatsApp conversions.

---

## 10. Phase 2: Worldwide (only after Lebanon works)

Expand only where fulfilment really exists. Heaters are heavy and seasonal. In order:
1. **Lebanese diaspora** buying for family in Lebanon: content like "Send a heater to your family in Lebanon", international card payment, local delivery. Same logistics, new buyers.
2. **Regional wholesale and export:** B2B pages such as "Heater Wholesale Supplier – Lebanon".
3. **A real foreign presence:** subfolders per market (`/en-cy/`, `/ar-iq/`), hreflang per market, local currency, a GBP **only for real physical locations**.

Because of the subfolder structure and hreflang in section 1, nothing needs rebuilding.

---

## 11. Hard rules (never break)

1. Public pages are server-rendered HTML. No Flutter Web or JavaScript-only product listings.
2. English is the main language (`/`). Arabic sits at `/ar/`. Pages correspond one-to-one, with reciprocal hreflang and self-canonicals.
3. Never delete seasonal product URLs. Mark them out of stock instead.
4. Schema only describes visible content. Never hide keywords anywhere.
5. Every product description is unique. Never paste manufacturer text.
6. Use the identical business name, address and phone everywhere.
7. No bought links, link networks, redirected spare domains or mass directory blasts.
8. No fake reviews, no fake locations.
9. Franco-Arabic only in the places allowed by section 8.
10. Seasonal content goes live by August or early September.
11. Track WhatsApp and call clicks as conversions.
12. Never publish unedited AI content. Always add local data, real photos and an expert reviewer.

---

## 12. Launch checklist

- [ ] Public site is server-rendered, with EN at `/` and AR at `/ar/`, RTL correct
- [ ] hreflang (en-LB, ar-LB, x-default→EN) on every page, validated
- [ ] Titles, metas and H1 generated from dashboard data, unique per page
- [ ] Product, Store, Breadcrumb and FAQ schema validated (Rich Results Test)
- [ ] Sitemap covering both languages, robots.txt, canonicals on filter URLs
- [ ] Out-of-stock logic keeps URLs live
- [ ] Core Web Vitals pass on mobile
- [ ] WhatsApp and Call sticky buttons, tracked in GA4
- [ ] Search Console and Bing Webmaster Tools verified, sitemaps submitted
- [ ] GBP verified and complete, review-request flow on WhatsApp active
- [ ] Tier 1 and Tier 2 listings done with identical business details
- [ ] First 6 guides published in EN and AR
- [ ] Brand-dealer link requests sent
