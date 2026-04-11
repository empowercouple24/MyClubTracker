# MyClubTracker — Session Summary
**Last updated:** April 11, 2026 (overnight session continued)
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

- **Jeffrey's admin account** (`empowercouple24@gmail.com`) is detached from Empower (`location_id = NULL`, `role = admin`). Accesses clubs via admin drill-in only.
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

---

## Product System

### DEFAULT_PRODUCTS
- Hardcoded array in both `app.html` and `products.html`
- 19 categories (in order): PDM, F1, Tea, Aloe, Liftoff, Add-Ins, Coffee, 24 Line, Health, Drink Mixes 4.4 oz, Drink Mixes 2 lb, Creamy Mixes, Extras, Tea Kits, Drink Mix Packets, Retail, Tablets, Other, Gram Zero Drink Mixes
- **Gram Zero Drink Mixes** is explicitly last — appended via `DEFAULT_PRODUCTS.push(..._GRAM_ZERO)`
- **Creamy Mixes** — all 7 products: VP = 23.57, PAR = 1
- To revert a location: `UPDATE locations SET settings = settings - 'customProducts' WHERE id = '...';`

### Recent Product Changes
- **CR7** (24 Line): SKU `416K`
- **Drink Mix - Strawberry (30 pkt)**: SKU `363K`, VP `9.30`, PAR `2`
- **Gram Zero Drink Mixes** moved to last category

### Product Push Flow
- Admin edits global list → Save → push modal → inserts `product_updates` rows per location
- Owner logs in → `checkPendingProductUpdates()` fires → approval modal
- **Partial approve** now supported; **"Skip for now"** stays pending
- **Pending Updates badge** in Settings → Products

---

## Order Tab — Full Feature State

### Sticky Header Layout (top → bottom)
1. **Order Planning card** — `inv-header` block containing:
   - Title: "Order Planning"
   - Data widgets (4 across): Total DV Need | Orderable DV | Items to Order | Assigned (X/Y)
   - **Operator DV summary chips** (`order-summary-card-wrap`) — colored chips per operator showing their assigned DV and product count; Unassigned chip when items remain
2. **Volume tracker** (`order-vol-tracker`) — remaining DV + assigned/ordered progress bars; shown only when plan active
3. **Toolbar** — plan picker dropdown | Save Plan | Rename | Delete | + New Plan | Unload

### Toolbar
- **Save Plan (unsaved):** prompts name → inserts new record
- **Save Plan (already saved):** confirm — OK = overwrite, Cancel = save as new copy with new name
- **Rename:** renames in place only

### Saved Plan Data Structure (`inventory` table, `data._type='order_plan'`)
- `name`, `assignments` `{sku:opName}`, `skipped` `[sku,...]`
- `items` `[{cat,sku,name,need,vp,par,assignedTo}]` — full snapshot; `need` and `par` both required for accurate DV restore

### Loading a Saved Plan — _planNeedOverride
- `loadOrderPlan` populates `_planNeedOverride={sku:need}` directly from `plan.data.items`
- `renderOrderBody` checks `_planNeedOverride[sku]` first — if present, uses it verbatim instead of recomputing `par - invHave`
- This fixes the DV-shows-PAR bug: old plans without `par` field had `have` reconstruct to 0, making `need = par` (full PAR quantity). Now need is always taken directly from the saved value.
- `_planNeedOverride` cleared on: new plan, unload, start new plan

### Operator Summary Chips (top of page)
- Live-updated via `renderOrderSummaryCards()` on every assignment change
- Shows per-operator: name, DV total (VP × need, not VP × PAR), product count
- Unassigned chip shows remaining item count
- Chips use operator color with `cc` alpha overlay

### Operator Detail Cards (bottom of product list)
- Collapsible per-card via `orderToggleOpCard` — uses `max-height:2000px`
- Shows Product / SKU / Need / DV columns
- Mark ordered button; inline row edit (reassign/skip)
- "Operator Summary" section label removed (chips at top serve that role)

### Skip Product
- `—` button per row; `_orderSkipped` persisted via `skipped[]` array in saved plan

### Volume Tracker
- Remaining/assigned/ordered DV with dual progress bars; updates live

### Order Table Column Widths
- Product (auto) | Need 72px | DV 76px | Assign 150px | DV Subtotal 76px | Skip 36px

### State Variables
- `_orderPlanActive` — `{id, assignments:{sku:opName}, saved_at}`
- `_orderSkipped` — `{sku:true}` — persisted in saved plan
- `_orderOrdered` — `{opName:true}` — session-only
- `_planNeedOverride` — `{sku:need}` — from loaded plan, cleared on unload/new plan
- `ORDER_PLANS` — array of plan rows from DB

---

## Payouts Tab — Full Feature State

### Section Structure (top → bottom)
1. **Sticky top:** Operator preset chips + date range | Hourly preset chips + date range
2. **Operator Payouts** — collapsible (`togglePayoutsSection`, `_payoutsOpen=true`)
3. **Hourly Employees** — collapsible (`toggleHourlySection`, `_hourlyOpen=true`)
4. Snapshot save / saved snapshots
5. Payee Lookup
6. **Payment Register** — collapsible (`togglePaymentRegister`, `_pregOpen=true`)
7. **Credit Card Ledger** — collapsible (`toggleCCLedger`, `_ccOpen=false`)

### Operator Cards — per-card features
- **Posted indicator:** After Review & Post, card dims to 0.7 opacity; amount grey; "✓ Posted" badge. State in `_postedOps {'payee|from|to': true}`, session-only.
- **Running Bank Balance:** When `to < thisWeekSunday`, shows "This range + This week so far = Est. balance" per operator.

### Payment Register
- Collapsible, open by default; "+ Add Payment" in header

### Credit Card Ledger
- "+ Add Entry" at top in controls row
- Amount strips commas: `parseFloat(amtRaw.replace(/,/g,''))`
- Filter: All / Products / Overhead / Purchases / Payments
- Sort: Date ↓ / ↑ / Amount ↓ / ↑ / Description A–Z / Type

### State Variables (Payouts)
- `_postedOps` — session-only posted tracking
- `_payoutsOpen`, `_hourlyOpen`, `_pregOpen` — section collapse state (all default true)
- `_ccOpen` — CC ledger (default false)

---

## History Tab
- Unallocated Balance widget collapsed by default
- DV row in daily detail modal

---

## Profile & Settings
- Profile photos in Team Members list
- Owner contact cache auto-syncs on profile save
- Profile modal re-fetches settings fresh on open

---

## Google Calendar Integration
- Silent refresh via `gcal-refresh` Edge Function + `gcal_tokens` table

---

## app.html Architecture Notes
- Does NOT load `nav.js` or `nav.css` — all logic inline
- Never apostrophes in single-quoted JS strings — use `data-*` attributes
- **Never `escAttr()` in app.html** — use `escHtml()` everywhere
- Always `try/catch/finally` around `init()`
- Edge Functions require JWT verification OFF
- Supabase CDN: unpkg.com UMD path with `flowType: 'implicit'`
- Version checker uses `CACHE BUST` comment comparison — always update on delivery
- Template literal nested quotes silently kill entire script blocks
- **Never `JSON.stringify()` in inline onclick/onchange** — use `data-*` + `addEventListener`
- `saveSettings()` does not exist — use `sb.from('locations').update({settings:SETTINGS}).eq('id',LOCATION_ID)`
- **max-height accordion: always use `2000px`, never `scrollHeight`**
- **Amount parsing: always `parseFloat(val.replace(/,/g,''))` — never bare `parseFloat`**
- **DV calculation: always `vp * need` (need qty from invHave or _planNeedOverride), never `vp * par`**

### CSS Variables / Theme
- Blues: `--b0`–`--b9` | Greens: `--g0`–`--g6` | Reds: `--r3`–`--r5` | Ambers: `--a0`–`--a6`

---

## Supabase Edge Functions (all JWT verification OFF)
| Function | Purpose |
|----------|---------| 
| `send-org-invite` | Send org leader invite email |
| `complete-onboarding` | Complete org onboarding |
| `gcal-exchange` | OAuth code → tokens |
| `gcal-refresh` | Silent access token renewal |

---

## Database Schema
```
locations         — id, name, address, owner_name, owner_phone, invite_code, settings (JSON), created_at
users             — id, email, location_id, role (admin|owner|employee), display_name, first_name, last_name, phone, avatar_url
days              — id, location_id, date, data (JSON), created_at
inventory         — id, location_id, data (JSON), saved_at  [also stores order plans: data._type='order_plan']
product_updates   — id, location_id, changes (JSON), status, pushed_at, reviewed_at, created_at
purchases         — id, location_id, date, description, amount, type, created_at
gcal_tokens       — location_id (PK), refresh_token, updated_at
organizations     — org table for multi-tenant SaaS
location_requests — id, ..., status, denial_reason, created_at
app_settings      — key (PK), value
```

---

## Pending To-Dos
1. Location comparison filtered by org
2. End-to-end onboarding testing with clean email
3. Profile photos in owner's operator list view — code shipped, needs live testing
4. Mobile-friendly improvements sitewide
5. Verify all Order + Payouts tab fixes end-to-end on live site
6. Test partial product update approval flow end-to-end
7. Co-owners (low priority)

---

## Completed This Session (April 11, 2026)

### Order Tab
- ✅ **Saved plan not loading** — `loadOrderPlan` restores `invHave` from saved items; items save `cat`+`par`
- ✅ **Skip button clipping** — DV Subtotal 88→76px, skip col 28→36px
- ✅ **Operator cards not expandable** — `max-height:2000px` replaces `scrollHeight`
- ✅ **Skipped state not persisting** — `skipped[]` array in all save payloads; restored on load
- ✅ **Can't save more than 1 plan** — confirm dialog: OK=overwrite, Cancel=save as new copy
- ✅ **DV total showing PAR instead of DV Need** — root cause: old saved plans have no `par` field, so `invHave` reconstructed to 0, making `need = par`. Fix: `_planNeedOverride={sku:need}` populated from `plan.data.items` on load; `renderOrderBody` uses this directly instead of recomputing.
- ✅ **Layout — operator chips moved to top** — now inside the Order Planning card, below the data widgets
- ✅ **New data widgets** — "Items to Order" and "Assigned (X/Y)" added to planning card header (4 widgets total)
- ✅ **Redundant "Operator Summary" label removed** from bottom of product list

### Payouts Tab
- ✅ **CC Ledger "+ Add Entry" moved to top**
- ✅ **CC amount saves $1 instead of $1,120** — commas stripped before `parseFloat`
- ✅ **Payment Register collapsible**
- ✅ **Running Bank Balance** — past-week presets show "This range + This week = Est. balance"
- ✅ **Posted indicator** — card dims + "✓ Posted" after Review & Post
- ✅ **Operator + Hourly sections collapsible**

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
- **max-height accordion: always use `2000px`, never `scrollHeight`**
- **Amount parsing: always `parseFloat(val.replace(/,/g,''))` — never bare `parseFloat`**
- **DV = VP × need qty — never VP × par**
- When chaining file edits across a session, always build on the latest working file — never the original ZIP
- **Always output an updated `SESSION_SUMMARY.md` at end of session**
