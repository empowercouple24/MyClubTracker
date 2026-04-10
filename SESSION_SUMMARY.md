# MyClubTracker — Session Summary
**Last updated:** April 11, 2026 (overnight session)
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

- **Jeffrey's admin account** (`empowercouple24@gmail.com`) is detached from Empower (`location_id = NULL`, `role = admin`). He accesses clubs via admin drill-in only.
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

### Recent Product Changes
- **CR7** (24 Line): SKU updated from `1445` → `416K`
- **Drink Mix - Strawberry (30 pkt)** added to Drink Mix Packets: SKU `363K`, VP `9.30`, PAR `2`, positioned after Raspberry (362K)
- **Gram Zero Drink Mixes** moved to last category position

### Product Push Flow
- Admin edits global list → Save → push modal → inserts `product_updates` rows per location
- Owner logs in → `checkPendingProductUpdates()` fires → approval modal with per-change checkboxes
- Owner accepts → `applyProdUpdate()` merges into `DEFAULT_PRODUCTS` or `customProducts` → saves → re-renders
- **Partial approve now supported:** unchecked items saved as new `pending` record in `product_updates`
- **"Skip for now"** just closes the modal — record stays `pending` and reappears on next login
- **Pending Updates badge** in Settings → Products shows count of pending changes; tapping opens the modal directly

### products.html — Global Mode
- `?mode=global` always loads fresh from `DEFAULT_PRODUCTS` — stale sessionStorage is ignored
- **Sort headers** on Name and SKU columns in every category — click to sort visually, only saves on Save button
- Sort changes do **not** trigger the push prompt

### Product Name Display (2-row format)
- `parseProdName(name)` in `app.html`
- Row 1 (bold): base name + flavor (before parens)
- Row 2 (muted): parens content — size/qty

---

## Order Tab — Full Feature State

### Toolbar
- **Load a saved plan** (dropdown) | **💾 Save Plan** | **✎ Rename** | **🗑** | **+ New Plan** | **✕ Unload**
- **Unload:** closes the active plan and returns to blank state without deleting the saved plan
- **Save Plan (on unsaved plan):** prompts for name → inserts new record
- **Save Plan (on already-saved plan):** confirm dialog — OK = overwrite existing, Cancel = prompts for new name → saves as independent copy
- **Rename:** renames the existing plan in place (does NOT create a copy)

### Saved Plan Data Structure
Each saved plan in `inventory` table (`data._type = 'order_plan'`) includes:
- `name` — plan label
- `assignments` — `{sku: opName}` map
- `skipped` — `[sku, sku, ...]` array of skipped SKUs ← persisted as of this session
- `items` — `[{cat, sku, name, need, vp, par, assignedTo}]` — full snapshot for self-contained reload
- `_type: 'order_plan'`

### Loading a Saved Plan (loadOrderPlan)
- Restores `_orderPlanActive.assignments` from saved data
- Restores `_orderSkipped` from saved `skipped` array
- Restores `invHave` from saved `items` (using `have = par - need`) so plan renders without requiring a live inventory snapshot

### Category Assign Button
- Only shows operator name/color when 100% of assignable items in the category are assigned to the same single operator
- Mixed, partial, or empty → shows "Assign All" with no color

### Skip Product (per row)
- `—` button per row; skipped rows dim with strikethrough
- Excluded from volume calculations and operator summary cards
- Undo with ↩ button
- **Skip state IS now persisted** to saved plans via `skipped` array

### Operator Summary Cards
- Collapsed by default below product list
- **Tap header** to expand/collapse — uses `max-height: 2000px` (not scrollHeight — scrollHeight returns 0 on hidden elements)
- Expand shows: Product / SKU / Need Qty / DV columns (read-only)
- **Mark ordered** button always visible — dims all rows, flips to "✓ Ordered"
- Ordered state is undoable
- Tap any row inside expanded card → inline edit action sheet (reassign or skip)

### Volume Tracker
- Persistent tracker above product list: remaining DV, assigned DV, ordered DV
- Dual progress bars (green = assigned, blue = ordered)
- Updates live on every assignment, skip, and mark-ordered action

### Save/Archive flow
- `saveOrderPlan()` — saves at any completion level (see toolbar notes above)
- `archiveOrderPlan()` — triggered by "Save & Archive" bar when all items assigned; always inserts new record
- Plans stored in `inventory` table with `data._type = 'order_plan'`

### Order Table Column Widths
- Product (auto) | Need 72px | DV 76px | Assign 150px | DV Subtotal 76px | Skip 36px

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

### Daily detail modal
- DV row added to Breakdown section

---

## Profile & Settings

### Team Members list
- Profile photos load in Team Members section of settings modal
- Owner and operator rows show avatar photo (or initials bubble) on the left

### Owner contact cache auto-sync
- Saving profile writes `_ownerName/_ownerEmail/_ownerPhone` into `locations.settings`
- Profile modal re-fetches location settings fresh from Supabase every time it opens

### Owner reassignment (done via SQL)
- Jeffrey's admin account detached from Empower: `location_id = NULL`, `role = admin`
- Mary is confirmed Empower owner

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
- **max-height CSS accordion pattern:** always use a fixed large value (`2000px`) not `scrollHeight` — `scrollHeight` returns 0 on `overflow:hidden` elements

### CSS Variables / Theme
- Blues: `--b0`–`--b9` | Greens: `--g0`–`--g6` | Reds: `--r3`–`--r5` | Ambers: `--a0`–`--a6`
- `--safe-top: env(safe-area-inset-top, 0px)` on topnav + content-area
- `--nav-h: 50px`, `--tab-h: 44px`

### Order Tab State Variables
- `_orderPlanActive` — working plan in memory `{id, assignments:{sku:opName}, saved_at}`
- `_orderSkipped` — `{sku:true}` — persisted to saved plans via `skipped` array
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
3. Profile photos in owner's operator list view — code shipped, needs live testing
4. Mobile-friendly improvements sitewide
5. Verify Order tab fixes work end-to-end on live site (plan load, skip persist, operator card expand, save-as-copy flow)
6. Test partial product update approval flow end-to-end
7. Co-owners (low priority)

---

## Completed This Session (April 11, 2026 — overnight)

### Order Tab — Bug Fixes
- ✅ **Saved plan not loading** — `renderOrderBody` depends on `invHave` which is empty in a fresh session; fixed by having `loadOrderPlan` reconstruct `invHave` from saved plan's `items` array (`have = par - need`). Items now save `cat` and `par` fields for accurate restore.
- ✅ **Skip button clipping** — DV Subtotal column narrowed from 88px → 76px; skip column widened from 28px → 36px. Net table width unchanged.
- ✅ **Operator cards not expandable** — `orderToggleOpCard` used `body.scrollHeight` which returns 0 on `overflow:hidden` elements; replaced with fixed `max-height: 2000px`. Same fix applied in `orderRebuildOpCards` and `orderOpenRowEdit`.
- ✅ **Skipped state not persisting** — `_orderSkipped` now serialized as `skipped: [sku, ...]` array in all save payloads (`saveOrderPlan`, `archiveOrderPlan`); restored into `_orderSkipped` on `loadOrderPlan`.
- ✅ **Can't save more than 1 plan** — `saveOrderPlan` on an already-saved plan now shows confirm dialog: OK = overwrite, Cancel = prompts for new name and inserts a fresh independent record.
- ✅ **Rename creating confusion** — Rename remains rename-only (correct). The "branch to new plan" workflow is now handled by Save Plan → Cancel → new name. Behavior is now clearly separated.

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
- **max-height accordion: always use `2000px`, never `scrollHeight`** — scrollHeight is 0 on hidden elements
- When chaining file edits across a session, always build on the latest working file — never the original ZIP
- **Always output an updated `SESSION_SUMMARY.md` at end of session**
