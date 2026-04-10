# MyClubTracker — Session Summary
**Last updated:** April 10, 2026
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
- To revert a location: `UPDATE locations SET settings = settings - 'customProducts' WHERE id = '...';`
- To revert all: `UPDATE locations SET settings = settings - 'customProducts';`

### Product Push Flow
- Admin edits global list → Save → push modal → inserts `product_updates` rows per location
- Owner logs in → `checkPendingProductUpdates()` fires → approval modal with per-change checkboxes
- Owner accepts → `applyProdUpdate()` merges into `DEFAULT_PRODUCTS` or `customProducts` → saves → re-renders

### Product Name Display (2-row format)
- `parseProdName(name)` in `app.html`
- Row 1 (bold): base name + flavor (before parens)
- Row 2 (muted): parens content — size/qty

---

## Inventory Tab
- **Go to Order button:** Visible in toolbar, full-width row on mobile (CSS order:4, width:100%)
- Toolbar order: All | Need | Snapshot picker | ✕ Clear | 📸 Snapshot | Go to Order →

---

## Order Tab — Full Feature State

### Toolbar
- **Load a saved plan** (dropdown) | **💾 Save Plan** | **✎ Rename** | **🗑** | **+ New Plan**
- Save Plan: hidden until a plan is active; saves at any point (partial or complete); prompts for name; overwrites if already saved
- Rename: only visible when plan has been saved to Supabase (`_orderPlanActive.id` exists)
- Delete (🗑): same — only visible on saved plans
- **+ New Plan:** now shows confirmation dialog if current plan has any assignments ("Starting a new plan will clear your N assignments. Continue?")

### Assignment buttons
- **Per-row:** Single tap cycles through operators → unassigned. Fixed: `orderAssignCycle()` now correctly reads `_orderPlanActive.assignments[sku]` for current state (was referencing undefined `current` variable)
- **Per-category:** Each category header has an "Assign All" button on the right. Tap cycles all non-OOS items in that category to the next operator. Shows dominant operator name/color when assigned. Cycles through all operators then back to unassigned.
- `orderAssign()` called for each item — updates row button, DV subtotal cell, summary cards, cat totals

### Operator summary cards
- Fixed: `renderOrderSummaryCards()` was missing `const opTotals={}` and `const opCounts={}` declarations — variables were undefined, silently zeroing all DV totals
- Now correctly reflects assignments in real time

### Save/Archive flow
- `saveOrderPlan()`: saves at any completion level. If plan already has an ID, updates existing record. If new, inserts and sets `_orderPlanActive.id`.
- `archiveOrderPlan()`: still exists (triggered by "Save & Archive" bar when all items assigned) — uses same save logic
- Plans stored in `inventory` table with `data._type = 'order_plan'`

---

## Payouts Tab — Full Feature State

### Preset chips (both Operator and Hourly sections)
Order: `This Week` | `Last Week` | `Wk Before Last` | `Last 2 Wks` | `This Month` | `Last Month` | ✕
- `Wk Before Last` = `getSunWeekRange(2)` — the full Sun–Sat week two weeks ago, standalone
- Chip IDs: `ppc-range-weekbeforelast` (operator), `hppc-weekbeforelast` (hourly)
- Label-init: `initPresetChipLabels()` and `initHourlyPresetChipLabels()`

### Per-person Review & Post
- Each operator and hourly employee card has an individual **"Review & Post"** button inline right of their dollar amount
- Calls `openPayrollApproveForOne(payee, amount, type)` — opens payroll approve modal pre-populated for one person
- Check number computed fresh at tap time via `getNextCheckNumForAccount()` reading live from `SETTINGS.paymentLog` — always correct sequencing
- Bulk "Approve & Post to Register" button removed from both sections
- `openPayrollApproveModal()` and `openHourlyApproveModal()` still exist but are not called from UI

### Daily totals below Total Payouts card
- Total Payouts card now expands to show each day in the selected range with its raw payout pool amount
- Days with $0 payouts are skipped
- Formatted as: date label on left, dollar amount on right, separated by thin border rows

### Missing operator banner
- `renderPayouts()` checks for any day in range with non-zero payouts but no operators assigned
- If found: amber warning banner at top of results with tap-to-fix date links
- Tapping calls `jumpToDateForOp(dateStr)` → switches to Enter tab, loads that day

### Credit Card Ledger
- Collapsed section below Payment Register, toggled by `toggleCCLedger()`
- Header always shows current card balance (even collapsed)
- **Summary card:** Grand total balance (large), Products bucket, Overhead bucket — each with purchase/payment subtotals
- **Table columns:** Date | Description | Amount (green=payment, red=purchase) | Type badge | Running Balance
- Running balance computed chronologically over full dataset regardless of current filter
- **Filter chips:** All / Products / Overhead / Purchases / Payments
- **Sort:** Date ↓ (default) / Date ↑ / Amount ↓ / Amount ↑ / Description A–Z / Type
- **Add/Edit modal:** Owner/admin only. Date, Description, Amount (positive=purchase, negative=payment), Type
- Data in `purchases` Supabase table (run `purchases_table.sql` then `cc_import.sql`)
- 478 historical rows imported (July 2024 – April 2026, Empower location)

---

## History Tab — Full Feature State

### Unallocated Balance widget
- Now **fully collapsed by default** — entire widget hidden behind a thin toggle row
- Toggle row shows label "Unallocated Balance" + current balance value + chevron
- Controlled by `_reconOuterOpen` (default false) and `toggleReconOuter()`
- `renderReconWidget()` now shows/hides `recon-widget-outer` (not `recon-widget` directly) and updates the collapsed header balance value
- The inner body (bank input, date picker, etc.) still requires a second tap via `toggleReconWidget()`

### Daily detail modal
- DV row added to Breakdown section between Total Sales and Tax
- Populated from `d.dv` using `fmtVP()` — shows `--` if no DV entered for that day

---

## Google Calendar Integration — Silent Refresh
- **Root cause was:** `refresh_token` never stored — `gcal-refresh` had nothing to use, fell back to consent popup every session
- **Fix:** `gcal_tokens` Supabase table stores refresh token server-side (service role only, no RLS access from browser)
- `gcal-exchange` Edge Function: stores `refresh_token` to `gcal_tokens` after code exchange, returns only `access_token` to client
- `gcal-refresh` Edge Function: looks up `refresh_token` by `location_id`, calls Google silently for new `access_token`
- On `invalid_grant`, deletes stale token so next request re-prompts cleanly
- Users connected before this fix must disconnect and reconnect once to seed their token
- Edge Function secrets required: `GCAL_CLIENT_ID`, `GCAL_CLIENT_SECRET`

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
  amount      NUMERIC(10,2) NOT NULL,  -- positive=purchase, negative=payment
  type        TEXT NOT NULL CHECK (type IN ('Products','Overhead')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS purchases_location_date ON public.purchases(location_id, date DESC);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
-- RLS: owners read/write own location, admins read/write all
```

---

## Payment Register — Color System
- `getOpColor(name)` uses two-pass matching: exact → word-contains fallback
- All roles (Owner, Operator, Hourly) get color shading in register rows

---

## app.html Architecture Notes
- Does NOT load `nav.js` or `nav.css` — all logic inline
- Never apostrophes in single-quoted JS strings — use `data-*` attributes
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

### Known past syntax pitfalls
- Broken color ternary in template strings: `'var(--text-faint))+'";>` instead of `'var(--text-faint)')+'">'` — silently kills script
- Using undeclared variables in functions (e.g. `current`, `opTotals`) — silently zeroes values
- Missing `function` keyword after `str_replace` eats the declaration line
- Template literal nested backticks inside `onclick` attributes
- `JSON.stringify()` in inline HTML attributes breaks onclick parsing

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
3. Profile photos in owner's operator list view
4. Mobile-friendly improvements sitewide (Order tab product name truncation on mobile identified)

---

## Completed This Session (April 9–10, 2026)
- ✅ **Wk Before Last preset** — added to both Operator and Hourly sections on Payouts tab
- ✅ **Google Calendar silent refresh** — `gcal_tokens` table + updated `gcal-exchange` and `gcal-refresh` Edge Functions; refresh token stored server-side only
- ✅ **Credit Card Ledger** — collapsed section on Payouts tab below Payment Register; summary card, filter/sort, running balance, add/edit/delete (owner only); 478 historical rows imported
- ✅ **Missing operator banner** — amber warning in operator payout results when any day in range has sales but no operators assigned; tap links jump to Enter tab
- ✅ **Per-person Review & Post** — individual button per operator/employee card; check number sequenced live at tap time; bulk buttons removed
- ✅ **App load fix** — broken color ternary in hourly employee card (`var(--text-faint))+'";>`) was killing script block on load
- ✅ **Unallocated Balance collapsed by default** — outer wrapper toggle added; `_reconOuterOpen` state; balance shown in collapsed header
- ✅ **History modal DV** — DV row added to daily detail breakdown popup
- ✅ **Order tab assign buttons fixed** — `orderAssignCycle()` was referencing undefined `current`; fixed to read from `_orderPlanActive.assignments[sku]`
- ✅ **Order tab operator DV cards fixed** — `renderOrderSummaryCards()` was missing local `opTotals`/`opCounts` declarations; cards now update correctly on assignment
- ✅ **Payouts daily totals** — Total Payouts card now shows day-by-day payout pool amounts for the selected range
- ✅ **+ New Plan confirmation guard** — warns before clearing assignments; shows count of affected assignments
- ✅ **💾 Save Plan button** — saves at any completion level; overwrites existing or creates new; Rename/Delete only visible on saved plans
- ✅ **Category Assign All button** — each category header has a cycle button; assigns all non-OOS items in category to next operator; same cycle logic as per-row
- ✅ **Go to Order button restored** — was missing from inventory toolbar HTML; restored as full-width row on mobile
- ✅ **SESSION_SUMMARY.md** — added to repo root; updated each session

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
- **Always run `node --check` on app.html JS before delivering** — no exceptions
- Always update `CACHE BUST` timestamp before delivering `app.html`
- `app.html` does not load `nav.js` or `nav.css`
- `saveSettings()` does not exist
- Template literal nested quotes silently kill script blocks
- When chaining file edits across a session, always build on the latest working file — never the original ZIP
- **Always output an updated `SESSION_SUMMARY.md` at end of session**
