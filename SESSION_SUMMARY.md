# MyClubTracker — Session Summary
**Date:** April 9, 2026 (updated end-of-session)
**Continue in a new conversation — upload this file to GitHub repo root and paste at session start**

---

## ⚠️ END-OF-SESSION DIRECTIVE (always follow this)
At the end of every working session, Claude must:
1. Update this session summary to reflect all completed work, new bugs found, and any changes to the pending to-do list
2. Output the updated summary as a downloadable file named `SESSION_SUMMARY.md` using today's date
3. Remind Jeffrey to upload the file to the GitHub repo root so it's available for the next session
4. The next session starts by uploading the ZIP + this file, pasting the file contents into chat

---

## Infrastructure
- **Live URL:** https://myclubtracker.com (GitHub Pages)
- **GitHub:** `empowercouple24/Nemecek-Org-Clubs` (files at repo root)
- **Supabase:** `https://ndaqlamzlaucigvnhgfu.supabase.co`
- **Anon key:** `sb_publishable_wO6XM4pC2CcaISQ8OlbkfQ_liqKJbi_`
- **Admin UUID:** `d442c584-51be-4e26-aff8-a6da824fed83`
- **Empower location ID:** `b021a4c4-8ba3-43fa-8e78-d87c870c9e05`
- **Nemecek Org UUID:** `2c9248b8-bf51-4235-96eb-a8e801e01c43`
- **Square location ID:** `LVX592AVBXCCY`

---

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS on GitHub Pages (no build step, files at repo root)
- **Backend:** Supabase (Postgres, Auth, Edge Functions, Storage)
- **Email:** Resend (domain: myclubtracker.com)
- **Payments:** Square POS integration
- **Fonts:** DM Sans, Outfit
- **Domain:** Namecheap → myclubtracker.com

---

## Active Files (repo root)
| File | Purpose |
|------|---------|
| `app.html` | Main club app — all owner/operator functionality |
| `index.html` | Login / Register / Request to Join |
| `admin.html` | Super-admin dashboard |
| `locations.html` | Locations management |
| `organizations.html` | Organizations list |
| `org-admin.html` | Org leader dashboard |
| `products.html` | Global product list editor |
| `settings.html` | Admin settings |
| `onboard.html` | New org onboarding wizard |
| `request.html` | Self-serve org request flow |
| `import.html` | Data import |
| `oauth-callback.html` | Google OAuth redirect handler |
| `manifest.json` | PWA manifest (icons now `?v=2` cache-busted) |
| `sw.js` | Service worker |
| `icon-72.png` through `icon-512.png` | PWA icons — green bolt logo, all 9 sizes |

**Permanently deleted — never re-add:** `app2.html`, `club.html`, `register.html`, `admin-settings.html`

---

## Key People & IDs
| Person | Role | UUID |
|--------|------|------|
| Jeffrey Nemecek | Super-admin | `d442c584-51be-4e26-aff8-a6da824fed83` |
| Mary Nemecek | Owner, Empower | `9097fb68-963e-492e-93c2-52adea57c6b8` |
| Mike Cripe | Org leader | `25ce3db4-dc58-4648-bf23-cc5b677ab70a` |

- **Private email** (`empowercouple24@gmail.com`) must never appear in app-facing code
- **Public contact:** `support@myclubtracker.com`
- **MN and JG** are the two primary Empower operators

---

## Role Hierarchy
`Admin` (Jeffrey only) → `Owner` (location-level) → `Operator` (DB value: `employee`) → `Pending`

---

## Known Locations
| Name | ID |
|------|----|
| Empower Nutrition & Energy | `b021a4c4-8ba3-43fa-8e78-d87c870c9e05` |
| My Town Nutrition | `d97186de-919b-4ad3-a07c-c40c3924c4c1` |
| Westlake Nutrition | `db41d54d-c6ec-4915-b317-1f023ca7f54d` |
| Cripe | `1ea9b616-b7a2-423f-a2e9-9d80396cd7e0` |

---

## Tab Order by Role (app.html)
- **Owner/Admin:** Enter → History → *(divider)* → Inventory → Order → *(divider)* → Payouts → *(divider)* → Expansion
- **Operator (employee):** Inventory → Order → Enter → History → Expansion *(Payouts hidden, lands on Inventory at login)*
- Operator tab reorder is done at runtime via JS `appendChild` — HTML source stays in owner order
- Nav logo tap is role-aware: operators → Inventory, owners → Enter

---

## Logo & Branding
- **Nav logo (sitewide):** Green bolt SVG inline, `viewBox="0 0 52 80"`, 36×36px white tile with 8px border radius
- **PWA icons:** All 9 sizes (72→512px) regenerated with green bolt, white background, 18% safe-zone padding
- **manifest.json:** All icon `src` paths have `?v=2` cache-bust query string
- **index.html:** `<link rel="manifest">`, `apple-mobile-web-app-*` meta tags, `apple-touch-icon` → `icon-180.png?v=2`
- PWA icon updates require user to uninstall + reinstall. Future logo updates: bump to `?v=3`, etc.

---

## Product System

### DEFAULT_PRODUCTS
- Hardcoded array in both `app.html` and `products.html`
- Category order (19 categories): PDM, F1, Tea, Aloe, Liftoff, Add-Ins, Coffee, 24 Line, Health, Drink Mixes 4.4 oz, Drink Mixes 2 lb, Creamy Mixes, Extras, Tea Kits, Drink Mix Packets, Retail, Tablets, Other, **Gram Zero Drink Mixes** (bottom)
- Editing the global list saves to admin user metadata (`globalProducts`) — does NOT overwrite `DEFAULT_PRODUCTS` in code
- To revert a location: `UPDATE locations SET settings = settings - 'customProducts' WHERE id = '...';`
- To revert all: `UPDATE locations SET settings = settings - 'customProducts';`

### Product Push Flow
- Admin edits global list → Save → push modal → insert `product_updates` rows per location
- Owner logs in → `checkPendingProductUpdates()` fires → approval modal with per-change checkboxes
- Owner accepts → `applyProdUpdate()` merges into `DEFAULT_PRODUCTS` (or `customProducts`) → saves as `customProducts` → re-renders inventory, order tab, dashboard widgets

### Product Name Display (2-row format)
- `parseProdName(name)` in `app.html`
- Row 1 (bold): base name + flavor/variant (before parens)
- Row 2 (muted): parens content — size/qty
- Applied to both Inventory tab and Order tab

### DV/VP Values
- All DV values use `fmtVP()` → always 2 decimal places
- `products.html` VP input displays `toFixed(2)`

---

## Inventory Snapshot Modal
- Snapshot name is required (red asterisk, red border + toast on empty save)
- Date picker added, pre-fills to today on open
- `snapshotDate` saved into `data` JSON in DB

---

## Payment Register — Color System
- `getOpColor(name)` uses two-pass matching: exact → word-contains fallback
- `renderPaymentRegister()` builds `_memberColorMap` + `_memberTokens`; `_resolvePayeeColor(payee)` for all row shading
- All roles (Owner, Operator, Hourly) get color shading in register

---

## Payouts Tab — Preset Chips
Both the **Operator** section and the **Hourly/Employee** section have these presets in order:
`This Week` | `Last Week` | **`Wk Before Last`** | `Last 2 Wks` | `This Month` | `Last Month` | ✕

- `Wk Before Last` = `getSunWeekRange(2)` (the full Sun–Sat week two weeks ago, standalone)
- Chip IDs: `ppc-range-weekbeforelast` (operator) and `hppc-weekbeforelast` (hourly)
- Label-init functions: `initPresetChipLabels()` and `initHourlyPresetChipLabels()`

---

## app.html Architecture Notes
- Does NOT load `nav.js` or `nav.css` — all logic inline
- Never apostrophes in single-quoted JS strings — use `data-*` attributes
- Always `try/catch/finally` around `init()`
- `SETTINGS.teamMembers` unified array — guard with `|| []`
- Edge Functions require JWT verification OFF
- Supabase CDN: use unpkg.com UMD path with `flowType: 'implicit'`
- Version checker uses `CACHE BUST` comment comparison
- Template literal nested quotes silently kill script blocks
- **Never use `JSON.stringify()` in inline onclick/onchange attributes** — use `data-*` + `addEventListener`
- `saveSettings()` does not exist — use `sb.from('locations').update({settings:SETTINGS}).eq('id',LOCATION_ID)`
- Direct fetch to Resend from browser blocked by CORS — must use Edge Function

### CSS Variables / Theme
- Colors: `--b0`–`--b9` (blue), `--g0`–`--g6` (green), `--r3`–`--r5` (red), `--a0`–`--a6` (amber)
- `--safe-top: env(safe-area-inset-top, 0px)` on topnav + content-area
- `--nav-h: 50px`, `--tab-h: 44px`

---

## Supabase Edge Functions (all JWT verification OFF)
| Function | Purpose |
|----------|---------|
| `send-org-invite` | Send org leader invite email |
| `complete-onboarding` | Complete org onboarding |
| `gcal-exchange` | One-time Google OAuth code → refresh token |
| `gcal-refresh` | Silent access token renewal |

---

## Database Schema
```
locations         — id, name, address, owner_name, owner_phone, invite_code, settings (JSON), created_at
users             — id, email, location_id, role (admin|owner|employee), display_name, first_name, last_name, phone, avatar_url
days              — id, location_id, date, data (JSON), created_at
inventory         — id, location_id, data (JSON), saved_at
product_updates   — id, location_id, changes (JSON), status (pending|reviewed|dismissed), pushed_at, reviewed_at, created_at
organizations     — org table for multi-tenant SaaS
location_requests — id, club_name, street, city, state, zip, first_name, last_name, owner_name, phone, email, notes, status, denial_reason, created_at
app_settings      — key (PK), value
```

---

## Pending To-Dos
1. Location comparison filtered by org
2. End-to-end onboarding testing with clean email
3. **Purchases tab** — credit card purchase/payment tracking & reconciliation
4. Profile photos in owner's operator list view
5. Mobile-friendly improvements sitewide
6. Co-owners (low priority)
7. Daily sales summary email via Resend
8. Operator performance dashboard on Payouts tab
9. Verify Cripe Org's two locations have `org_id` set in DB
10. Confirm Mary's `app.html` loads correctly
11. Fix incorrect owner email showing on Empower's club details in `locations.html`

---

## Completed This Session (April 9, 2026)
- ✅ **Payouts tab — "Wk Before Last" preset** added to both Operator and Hourly/Employee sections in `app.html`. Chip appears between Last Week and Last 2 Wks. JS cases added to `setPayoutPreset()` and `setHourlyPreset()`. Label-init functions updated.

---

## Key Terminology
| Term | Meaning |
|------|---------|
| DV | Daily Volume |
| VP | Value Points |
| PAR | Reorder threshold |
| DVΔ | DV delta % |
| OH | Overhead rate |
| Operator | UI term; DB value is `employee` |

---

## Critical Rules (never violate)
- Jeffrey prefers **complete ready-to-upload files** over snippets
- Always **repeat back the bug** before fixing
- Always `try/catch/finally` around `init()`
- Never apostrophes in single-quoted JS strings
- Never `JSON.stringify()` in inline HTML attributes
- Always syntax-check all JS blocks before delivering
- Always cache-bust before delivering `app.html`
- `app.html` does not load `nav.js` or `nav.css`
- `saveSettings()` does not exist
- Template literal nested quotes silently kill script blocks
- **Always output an updated SESSION_SUMMARY at end of session** (see directive at top of this file)
