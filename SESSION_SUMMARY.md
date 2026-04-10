# MyClubTracker — Session Summary
**Last updated:** April 10, 2026 (evening session)
**Continue in a new conversation — upload this file to GitHub repo root and paste at session start**

---

## ⚠️ END-OF-SESSION DIRECTIVE (always follow this)
At the end of every working session, Claude must:
1. Update this session summary to reflect all completed work, new bugs found, and changes to the pending to-do list
2. Output the updated summary as a downloadable file named `SESSION_SUMMARY.md`
3. Remind Jeffrey to upload the file to the GitHub repo root so it's available for the next session
4. The next session starts by uploading the repo ZIP + this file, then pasting file contents into chat
5. Always run `node --check` on app.html before delivering it — never skip this step

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
| `manifest.json` | PWA manifest (icons `?v=2` cache-busted) |
| `sw.js` | Service worker |
| `icon-72.png` through `icon-512.png` | PWA icons — green bolt, all 9 sizes |
| `SESSION_SUMMARY.md` | This file — always keep at repo root |

**Permanently deleted — never re-add:** `app2.html`, `club.html`, `register.html`, `admin-settings.html`

---

## Key People & IDs
| Person | Role | UUID |
|--------|------|------|
| Jeffrey Nemecek | Super-admin | `d442c584-51be-4e26-aff8-a6da824fed83` |
| Mary Nemecek | Owner, Empower | `9097fb68-963e-492e-93c2-52adea57c6b8` |
| Mike Cripe | Org leader | `25ce3db4-dc58-4648-bf23-cc5b677ab70a` |

- **Jeffrey's admin account** (`empowercouple24@gmail.com`) is now detached from Empower (`location_id = NULL`, `role = admin`). He accesses clubs via admin drill-in only.
- **Mary** (`bestlifeever247@gmail.com`) is the Empower owner — `role = owner`, `location_id = b021a4c4-8ba3-43fa-8e78-d87c870c9e05`
- **Private email** (`empowercouple24@gmail.com`) must never appear in app-facing code
- **Public contact:** `support@myclubtracker.com`
- **MN and JG** are the two primary Empower operators

---

## Role Hierarchy
`Admin` (Jeffrey only) → `Owner` (location-level) → `Operator` (DB value: `employee`) → `Pending`

---

## Known Locations
| Name | ID |
|------|-----|
| Empower Nutrition & Energy | `b021a4c4-8ba3-43fa-8e78-d87c870c9e05` |
| My Town Nutrition | `d97186de-919b-4ad3-a07c-c40c3924c4c1` |
| Westlake Nutrition | `db41d54d-c6ec-4915-b317-1f023ca7f54d` |
| Cripe | `1ea9b616-b7a2-423f-a2e9-9d80396cd7e0` |

---

## Tab Order by Role (app.html)
- **Owner/Admin:** Enter → History → *(divider)* → Inventory → Order → *(divider)* → Payouts → *(divider)* → Expansion
- **Operator:** Inventory → Order → Enter → History → Expansion *(Payouts hidden, lands on Inventory at login)*
- Operator tab reorder done at runtime via JS `appendChild` — HTML source stays in owner order
- Nav logo tap: operators → Inventory, owners → Enter

---

## Logo & Branding
- **Nav logo:** Green bolt SVG inline, `viewBox="0 0 52 80"`, 36×36px white tile, 8px border radius
- **PWA icons:** All 9 sizes (72–512px), green bolt, white bg, 18% safe-zone padding
- **manifest.json:** All icon `src` paths have `?v=2` cache-bust. Future updates: bump to `?v=3`
- PWA icon updates require uninstall + reinstall by user

---

## Product System

### DEFAULT_PRODUCTS
- Hardcoded array in both `app.html` and `products.html`
- 19 categories (in order): PDM, F1, Tea, Aloe, Liftoff, Add-Ins, Coffee, 24 Line, Health, Drink Mixes 4.4 oz, Drink Mixes 2 lb, Creamy Mixes, Extras, Tea Kits, Drink Mix Packets, Retail, Tablets, Other, Gram Zero Drink Mixes
- **Gram Zero Drink Mixes** is explicitly last — appended via `DEFAULT_PRODUCTS.push(..._GRAM_ZERO)` after the main array declaration
- **Creamy Mixes** — all 7 products: VP = 23.57, PAR = 1
- To revert a location: `UPDATE locations SET settings = settings - 'customProducts' WHERE id = '...';`
- To revert all: `UPDATE locations SET settings = settings - 'customProducts';`

### Recent Product Changes (this session)
- **CR7** (24 Line): SKU updated from `1445` → `416K`
- **Drink Mix - Strawberry (30 pkt)** added to Drink Mix Packets: SKU `363K`, VP `9.30`, PAR `2`, positioned after Raspberry (362K)
- **Gram Zero Drink Mixes** moved to last category position

### Product Push Flow
- Admin edits global list → Save → push modal → inserts `product_updates` rows per location
- Owner logs in → `checkPendingProductUpdates()` fires → approval modal with per-change checkboxes
- Owner accepts → `applyProdUpdate()` merges into `DEFAULT_PRODUCTS` or `customProducts` → saves → re-renders
- **Partial approve now supported:** unchecked items saved as new `pending` record in `product_updates`
- **"Skip for now"** just closes the modal — record stays `pending` and reappears on next login (no longer marks as `dismissed`)
- **Pending Updates badge** in Settings → Products shows count of pending changes; tapping opens the modal directly

### products.html — Global Mode
- `?mode=global` now **always loads fresh from `DEFAULT_PRODUCTS`** — stale sessionStorage is ignored
- **Sort headers** on Name and SKU columns in every category — click to sort visually, only saves on Save button
- Sort saves update `DEFAULT_PRODUCTS` order (global) or `customProducts` (club level)
- Sort changes do **not** trigger the push prompt — only name/SKU/VP/PAR/category changes do

### Product Name Display (2-row format)
- `parseProdName(name)` in `app.html`
- Row 1 (bold): base name + flavor (before parens)
- Row 2 (muted): parens content — size/qty

---

## Order Tab — Full Feature State

### Toolbar
- **Load a saved plan** (dropdown) | **💾 Save Plan** | **✎ Rename** | **🗑** | **+ New Plan** | **✕ Unload**
- **Unload:** closes the active plan and returns to blank state without deleting the saved plan. Resets skipped and ordered state. Visible whenever a plan is active.
- Save Plan: saves at any completion level; prompts for name; overwrites if already saved
- Rename/Delete only visible on saved plans

### Category Assign Button
- **Fixed this session:** only shows operator name/color when 100% of assignable items in the category are assigned to the same single operator
- Mixed, partial, or empty → shows "Assign All" with no color
- Clicking always overrides the entire category regardless of display state

### Skip Product (per row)
- Each product row has a `—` skip button
- Skipped rows dim with strikethrough; assign button resets to unassigned
- Excluded from volume calculations and operator summary cards
- Undo with ↩ button
- Skip state is session-only (not persisted to Supabase)

### Operator Summary Cards (new this session)
- Collapsed by default below the product list — shows operator name, item count, DV total, "Mark ordered" button
- **Tap header** to expand and see full product list: Product / SKU / Need Qty / DV columns (all read-only)
- **Mark ordered** button always visible without expanding — one tap dims all rows in the card, flips button to "✓ Ordered"
- **Ordered state is undoable** — tap "✓ Ordered" again to revert entire card
- **Tap any row** inside expanded card (even when ordered/dimmed) → opens inline edit action sheet:
  - Move to another operator (card stays ordered, totals update)
  - Skip product entirely
  - Cancel
- If reassigned to an already-ordered operator: that operator stays ordered, list and DV totals update

### Volume Tracker (new this session)
- Persistent tracker above the product list showing:
  - **Large:** remaining DV (total minus assigned)
  - **Small lines:** X DV assigned · X DV ordered
  - Two progress bars (green = assigned, blue = ordered)
- Updates live on every assignment, skip, and mark-ordered action

### Assignment buttons
- Per-row: single tap cycles through operators → unassigned
- Per-category: cycles all non-OOS, non-skipped items to next operator

### Save/Archive flow
- `saveOrderPlan()`: saves at any completion level
- `archiveOrderPlan()`: triggered by "Save & Archive" bar when all items assigned
- Plans stored in `inventory` table with `data._type = 'order_plan'`

---

## Inventory Tab
- **Go to Order button:** Visible in toolbar, full-width row on mobile
- Toolbar order: All | Need | Snapshot picker | ✕ Clear | 📸 Snapshot | Go to Order →

---

## Payouts Tab — Full Feature State

### Preset chips (both Operator and Hourly sections)
Order: `This Week` | `Last Week` | `Wk Before Last` | `Last 2 Wks` | `This Month` | `Last Month` | ✕

### Per-person Review & Post
- Each operator and hourly employee card has an individual **"Review & Post"** button inline
- Check number computed fresh at tap time via `getNextCheckNumForAccount()`

### Daily totals below Total Payouts card
- Total Payouts card expands to show each day in selected range with payout pool amount

### Missing operator banner
- Amber warning banner when any day in range has sales but no operators assigned
- Tapping calls `jumpToDateForOp(dateStr)` → switches to Enter tab

### Credit Card Ledger
- Collapsed section below Payment Register
- Summary card: Grand total balance, Products bucket, Overhead bucket
- Filter chips: All / Products / Overhead / Purchases / Payments
- Sort: Date ↓ (default) / Date ↑ / Amount ↓ / Amount ↑ / Description A–Z / Type
- Data in `purchases` Supabase table
- 478 historical rows imported (July 2024 – April 2026, Empower location)

---

## History Tab — Full Feature State

### Unallocated Balance widget
- Fully collapsed by default
- Toggle row shows label + current balance + chevron

### Daily detail modal
- DV row added to Breakdown section

---

## Profile & Settings — Changes This Session

### Team Members list
- Profile photos now load in the Team Members section of the settings modal
- Owner and operator rows show avatar photo (or initials bubble) on the left
- Fixed: `escAttr` not defined in `app.html` was causing "stuck on Loading" — replaced with `escHtml`
- Wrapped in `try/catch` so errors show "Could not load team members" instead of freezing

### Owner contact cache auto-sync
- When owner saves their profile, `_ownerName`, `_ownerEmail`, `_ownerPhone` in `locations.settings` now auto-sync from their current profile data
- Profile modal now **re-fetches location settings fresh from Supabase** every time it opens — no more stale cached contact info

### Owner reassignment (done via SQL this session)
- Jeffrey's admin account detached from Empower: `location_id = NULL`, `role = admin`
- Mary promoted to owner: already correct in DB
- Empower `settings._ownerName/_ownerEmail/_ownerPhone` patched via SQL to reflect Mary

---

## Google Calendar Integration — Silent Refresh
- `gcal_tokens` Supabase table stores refresh token server-side
- `gcal-exchange` Edge Function stores `refresh_token` after code exchange
- `gcal-refresh` Edge Function silently renews `access_token` using stored refresh token
- Users connected before this fix must disconnect and reconnect once

### gcal_tokens table SQL
```sql
CREATE TABLE public.gcal_tokens (
  location_id   UUID PRIMARY KEY REFERENCES public.locations(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gcal_tokens ENABLE ROW LEVEL SECURITY;
-- No RLS policies = service role only
```

---

## Credit Card Ledger — purchases table SQL
```sql
CREATE TABLE public.purchases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  description TEXT NOT NULL,
  amount      NUMERIC(10,2) NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('Products','Overhead')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS purchases_location_date ON public.purchases(location_id, date DESC);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
```

---

## Payment Register — Color System
- `getOpColor(name)` uses two-pass matching: exact → word-contains fallback
- All roles (Owner, Operator, Hourly) get color shading in register rows

---

## app.html Architecture Notes
- Does NOT load `nav.js` or `nav.css` — all logic inline
- Never apostrophes in single-quoted JS strings — use `data-*` attributes
- **Never `escAttr()` in app.html** — that function only exists in `locations.html`. Use `escHtml()` everywhere in `app.html`
- Always `try/catch/finally` around `init()`
- `SETTINGS.teamMembers` unified array — guard with `|| []`
- Edge Functions require JWT verification OFF
- Supabase CDN: unpkg.com UMD path with `flowType: 'implicit'`
- Version checker uses `CACHE BUST` comment comparison — always update on delivery
- Template literal nested quotes silently kill entire script blocks
- **Never `JSON.stringify()` in inline onclick/onchange** — use `data-*` + `addEventListener`
- `saveSettings()` does not exist — use `sb.from('locations').update({settings:SETTINGS}).eq('id',LOCATION_ID)`
- Direct fetch to Resend from browser blocked by CORS — must route through Edge Function
- **Always run `node --check` on the JS before delivering** — prevents blank-screen bugs

### CSS Variables / Theme
- Blues: `--b0`–`--b9` | Greens: `--g0`–`--g6` | Reds: `--r3`–`--r5` | Ambers: `--a0`–`--a6`
- `--safe-top: env(safe-area-inset-top, 0px)` on topnav + content-area
- `--nav-h: 50px`, `--tab-h: 44px`

### Order Tab State Variables
- `_orderPlanActive` — working plan in memory `{id, assignments:{sku:opName}, saved_at}`
- `_orderSkipped` — `{sku:true}` session-only skipped products (not persisted)
- `_orderOrdered` — `{opName:true}` session-only ordered operators (not persisted)
- `_orderEditState` — `{op, sku}` currently open inline edit action sheet

---

## Supabase Edge Functions (all JWT verification OFF)
| Function | Purpose |
|----------|---------|
| `send-org-invite` | Send org leader invite email |
| `complete-onboarding` | Complete org onboarding |
| `gcal-exchange` | OAuth code → tokens; stores refresh_token server-side |
| `gcal-refresh` | Silent access token renewal via stored refresh_token |

---

## Database Schema
```
locations         — id, name, address, owner_name, owner_phone, invite_code, settings (JSON), created_at
users             — id, email, location_id, role (admin|owner|employee), display_name, first_name, last_name, phone, avatar_url
days              — id, location_id, date, data (JSON), created_at
inventory         — id, location_id, data (JSON), saved_at  [also stores order plans: data._type='order_plan']
product_updates   — id, location_id, changes (JSON), status, pushed_at, reviewed_at, created_at
purchases         — id, location_id, date, description, amount, type, created_at  ← CC Ledger
gcal_tokens       — location_id (PK), refresh_token, updated_at  ← GCal silent refresh
organizations     — org table for multi-tenant SaaS
location_requests — id, club_name, street, city, state, zip, first_name, last_name, owner_name, phone, email, notes, status, denial_reason, created_at
app_settings      — key (PK), value
```

---

## Pending To-Dos
1. Location comparison filtered by org
2. End-to-end onboarding testing with clean email
3. Profile photos in owner's operator list view — **code shipped, needs live testing**
4. Mobile-friendly improvements sitewide
5. Verify Order tab new features work end-to-end on live site (skip, unload, operator cards, volume tracker, category assign button fix)
6. Test partial product update approval flow end-to-end (new pending record on partial save)
7. Co-owners (low priority)

---

## Completed This Session (April 10, 2026 — evening)

### Profile & Team Members
- ✅ **Profile photos in Team Members list** — `loadTeamMembers()` now fetches `avatar_url`; renders photo circle or initials bubble per member
- ✅ **Fixed "stuck on Loading" bug** — `escAttr` not defined in `app.html` was crashing `renderMember()`; replaced with `escHtml`; wrapped in `try/catch`
- ✅ **Owner contact cache auto-sync** — saving profile now writes `_ownerName/_ownerEmail/_ownerPhone` into `locations.settings`
- ✅ **Profile modal re-fetches settings fresh** — no more stale cached owner contact info; `openProfileModal()` now fetches `settings + address` from Supabase on every open
- ✅ **Owner reassignment** — Jeffrey detached from Empower via SQL; Mary confirmed as owner; Empower settings patched

### Product System
- ✅ **CR7 SKU** updated `1445` → `416K` in both `app.html` and `products.html`
- ✅ **Drink Mix - Strawberry (30 pkt)** added: SKU `363K`, VP `9.30`, PAR `2`, after Raspberry in Drink Mix Packets
- ✅ **Gram Zero Drink Mixes** moved to last category in both files
- ✅ **Creamy Mixes VP** updated 0.00 → **23.57** across all 7 products in both files
- ✅ **Creamy Mixes PAR** updated 2 → **1** across all 7 products in both files
- ✅ **Global mode always loads fresh** — `products.html?mode=global` now ignores stale sessionStorage
- ✅ **Sort headers** — Name and SKU column headers clickable in every category; visual-only until Save; no push prompt on sort-only saves

### Product Update Flow
- ✅ **Partial approve saves remainder** — unchecked items inserted as new `pending` `product_updates` record
- ✅ **Skip for now fixed** — no longer marks record as `dismissed`; stays `pending` and reappears on next login
- ✅ **Pending Updates badge** — amber button in Settings → Products with count; opens modal on tap

### Order Tab
- ✅ **Category assign button fix** — only shows operator name when 100% of items assigned to same single operator
- ✅ **Unload plan** — `✕ Unload` button in toolbar; clears active plan without deleting saved plan
- ✅ **Skip product** — `—` button per row; skips from order, dims row, undo with ↩; excluded from all calculations
- ✅ **Operator summary cards** — collapsed by default; expand to show Product/SKU/Need/DV; Mark ordered button; inline row edit with reassign/skip; stays ordered after reassign with updated totals
- ✅ **Operator cards apostrophe fix** — product names with apostrophes (Cookies n Cream etc.) were breaking inline onclick strings and silently dropping all cards; fixed using `data-op`/`data-sku`/`data-name` attributes in both `renderOrderBody` and `orderRebuildOpCards`
- ✅ **Volume tracker** — remaining DV + assigned DV + ordered DV with dual progress bars; updates live

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
- Jeffrey prefers **complete ready-to-upload files** over snippets or diffs
- Always **repeat back the described bug** before fixing
- Always `try/catch/finally` around `init()`
- Never apostrophes in single-quoted JS strings
- Never `JSON.stringify()` in inline HTML attributes
- **Never use `escAttr()` in `app.html`** — use `escHtml()` instead
- **Always run `node --check` on app.html JS before delivering** — no exceptions
- Always update `CACHE BUST` timestamp before delivering `app.html`
- `app.html` does not load `nav.js` or `nav.css`
- `saveSettings()` does not exist
- Template literal nested quotes silently kill script blocks
- When chaining file edits across a session, always build on the latest working file — never the original ZIP
- **Always output an updated `SESSION_SUMMARY.md` at end of session**
