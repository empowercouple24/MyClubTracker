# MyClubTracker — Session Summary
**Last updated:** April 16, 2026
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
| `favicon.ico` | Favicon — green bolt |
| `icon-16.png` | 16×16 bolt favicon PNG |
| `icon-32.png` | 32×32 bolt favicon PNG |
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

- **Testing is done as Mary** (`bestlifeever247@gmail.com`) at owner level — not as Jeffrey admin
- **Jeffrey's admin account** (`empowercouple24@gmail.com`) is detached from Empower
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

---

## Pending To-Dos
1. End-to-end onboarding testing with clean email
2. Mobile-friendly improvements sitewide (ongoing)
3. Test partial product update approval flow end-to-end
4. Order tab — full single-row product layout redesign (approved mockup with SKU/Need priority, not yet built — Option A CSS workaround currently live)

---

## Completed This Session (April 16, 2026)

### CC Ledger — Purchase / Payment toggle
- ✅ **Root-cause diagnosed** — the banking-style dollar input (`initBankInput`) blocks every non-digit keystroke; typing `-` is silently dropped. `_bankRender` also mangles negative buffers (`Math.floor(-12345/100)` → `-124.-45`). So negative entry was hard-locked.
- ✅ **Purchase / Payment toggle added** to CC Ledger modal — two-segment pill above the Amount row. Purchase (default) tinted red (`--r0` / `--r5`); Payment tinted green (`--g0` / `--g5`), matching the existing row colors in the ledger. Bank-input stays positive-only; sign is carried by the toggle.
- ✅ **Sign prefix reacts to toggle** — `$` shown in muted when Purchase is active; `−$` shown in green when Payment is active (`cc-amt-sign` span).
- ✅ **`setCCKind(kind)`** — new function; flips button active state, swaps sign prefix and its color, stores kind on `overlay.dataset.kind`.
- ✅ **`openCCModal` detects sign on edit** — for existing entries, reads `entry.amount`, puts `Math.abs` in the input, seeds `_buf` correctly, and calls `setCCKind('payment')` if the stored amount is negative, else Purchase. For new entries, defaults to Purchase.
- ✅ **`saveCCEntry` applies sign from toggle** — `(kind === 'payment' ? -1 : 1) * Math.abs(parsed)`; also now rejects zero as invalid (previously `isNaN` only).
- ✅ **`handleCCAmountPaste` auto-flips toggle** — pasting a negative value (e.g. `-326.61`, `-$1,044.55`) sets absolute value in the field and calls `setCCKind('payment')`. Positive pastes don't touch the toggle (so a user who has manually picked Payment keeps their choice).
- ✅ **Latent `_buf` bug fixed** — `openCCModal` now resets `amtEl._buf = ''` at the top and re-seeds it from `entry.amount`. Previously, re-opening the modal for a different entry could carry a stale `_buf` value that garbled subsequent typing.
- ✅ **Helper text simplified** — was "Positive amount = purchase. Negative amount = payment to card." Now just "Payment reduces the card balance." (toggle makes the rest self-explanatory.)
- ✅ **New CSS class `.cc-kind-toggle` / `.cc-kind-btn`** — added after `.cc-type-badge` rules. Matches the pill-toggle pattern used elsewhere in the app (Projections mode switch, History view switcher).

### Enter Tab — Compact Daily Summary (mobile)
- ✅ **All summary elements compressed** — within `@media (max-width: 480px)`:
  - Total Sales Deposits font: 38px → 26px
  - Summary card val: 22px → 17px
  - Summary card padding: 10px 12px → 6px 10px
  - Card gap: 7px → 4px
  - Labels, rates, subs all reduced 1–2px
  - Radio dots: 18px → 15px
  - Balance check + Square deposit rows tightened
- ✅ **Net effect:** full Daily Summary fits in ~half of iPhone screen height

### Enter Tab — Sticky + Collapsing Daily Summary (mobile)
- ✅ **Sticky on scroll** — `.summary-box` gets `position: sticky; top: 0; z-index: 25` on mobile
- ✅ **Sentinel element** — `#summary-sentinel` (zero-height div) placed above summary box; IntersectionObserver watches it
- ✅ **Collapsed slim bar** — when sentinel scrolls off screen, `summary-box` gets `.collapsed` class:
  - `.summary-box-full` (all detail rows) hidden
  - `.summary-box-slim` shown: single row with Total Sales amount + 4 allocation dots (Tax/OH/HL/Pay) + Square deposit amount
  - Collapsed bar has bottom-only border-radius and subtle shadow for visual separation
- ✅ **Auto-expand** — scrolling back up makes sentinel visible again → `.collapsed` removed → full summary returns
- ✅ **Desktop-safe** — observer only applies `.collapsed` when `matchMedia('max-width:480px')` is true; also cleans up on resize
- ✅ **Slim bar values synced** — `recalc()` and `refreshSumCardAllocState()` both call `syncSlimDots()` to keep slim dot states matching the full allocation radio buttons
- ✅ **New CSS classes** — `.summary-box-slim`, `.summary-box-slim-total`, `.summary-box-slim-label`, `.summary-slim-dot`, `.summary-slim-dot.allocated`, `.summary-slim-dot-label`

### Order Tab — Mobile Optimization
- ✅ **Header stat cards compacted** — padding 10px→6px 8px, font 28px→18px, `flex-wrap:nowrap` + `overflow-x:auto` so all 4 cards visible without clipping
- ✅ **Operator chips + Unassigned on one row** — `flex-wrap:nowrap` on `.order-summary-card`, operator chips `flex:1 1 0`, unassigned chip inline as `flex:0 0 auto` — all fit on same row, saving an entire vertical row
- ✅ **Operator chip names/DV/sub all smaller** — name 10px→8px, DV 20px→16px, sub 11px→9px
- ✅ **Volume tracker compacted** — padding reduced, remaining DV font 22px→16px
- ✅ **Toolbar compacted** — gap 8px→4px, button/select font sizes reduced
- ✅ **Mark-as-ordered section** — tighter margin

### Order Tab — OOS Refresh Fix
- ✅ **Root cause** — `toggleOos()` and `saveOos()` called `renderInventory()` but never refreshed the Order tab. So after toggling OOS on a product from the Order tab, the row dimming, header widgets, volume tracker, operator chips, and unassigned count all stayed stale.
- ✅ **Fix** — after both `saveOos()` (marking OOS) and the OOS removal path in `toggleOos()` (clearing OOS), now calls `renderOrderBody()` + `renderOrderSummaryCards()` + `orderUpdateVolumeTracker()` + `renderOrderMarkSection()` when `_orderPlanActive` is truthy.
- ✅ **"Items to Order" header widget now excludes OOS** — was `!_orderSkipped` only, now `!_orderSkipped && !invOos[p.sku]`
- ✅ **Row dimming already existed** — `.inv-row-oos td{opacity:0.55}` + `text-decoration:line-through` were already in CSS; `renderOrderBody` already applied the class. Issue was just that the re-render wasn't triggered.

### Finances Tab — Missing DV Guard
- ✅ **"Review & Post" now blocked for BOTH operator and hourly** when any day in the date range has sales but missing DV. Shows toast: "Cannot post — X days have missing DV: [day list]. Fill DV on the Enter or History tab first."
- ✅ **Missing DV warning banner on Operator Payouts** — amber banner with clickable day links (same pattern as existing missing-operator banner). Shown above operator summary when a preset range includes days with sales but no DV.
- ✅ **Missing DV warning banner on Hourly Employees** — identical amber banner injected at top of hourly section output after shifts load.
- ✅ **Enter tab missing DV banner** — `#enter-missing-dv-banner` shown when viewing a day that has total sales > 0 but DV field is empty/zero. Message: "DV not entered for this day — Payout calculations require DV. Enter the DV value below." Automatically hides when DV is filled (via `recalc`).
- ✅ **Existing operator-only unallocated guard preserved** — the "no operators assigned" guard still fires for operator payouts only (before the new missing DV guard which fires for both types).

### Finances Tab — CC Ledger Open by Default
- ✅ **CC Ledger section expanded on load** — `_ccOpen = true`, `cc-ledger-body` starts with `display:block`. Summary, filters, search, "+ Add Entry" all visible immediately without clicking.
- ✅ **Transaction rows still behind chevron** — "Transaction History" toggle with chevron keeps actual rows collapsed by default.

### Finances Tab — Payout Balance Recon Widget (new feature)
- ✅ **New widget between Operator Payouts and Hourly Employees** — `#payout-recon-widget`, hidden by default, shown when a payout preset loads.
- ✅ **Light blue banner** (`var(--b2)`) matching History tab recon style. Shows: "Payout Account Balance", net owed amount, date range sub-label, Bank pill input, match/off badge, chevron.
- ✅ **Expandable body** — page background with daily breakdown: each day shows operator initials + amounts. Also shows total allocated payouts, payments already posted (from Payment Register), and net owed.
- ✅ **Match logic** — user enters bank balance, widget compares against net owed. Shows green "✓ Match" or amber "Off $X.XX" badge. Expanded result bar explains direction ("Bank is higher/lower than owed payouts").
- ✅ **`renderPayoutRecon()`** — called at end of `renderPayouts()`. Reads `payout-from`/`payout-to`, calculates daily payouts excluding owner reinvest, subtracts posted payments from Payment Register in the same range.
- ✅ **`updatePayoutReconMatch()`** — called on bank input change. Compares bank vs net owed with 2-cent tolerance.
- ✅ **`togglePayoutRecon()`** — expand/collapse body with chevron rotation.
- ✅ **Hidden on clear** — `clearPayouts()` hides the widget.

### Finances Tab — Segmented Control Presets + "This + Last Wk"
- ✅ **Segmented control redesign** — preset chips replaced with a connected segmented bar (`.payout-preset-seg`) + floating circle ✕ reset button (`.payout-reset-btn`). All 7 presets fit in a single row without wrapping.
- ✅ **Shorter labels** — "This Week" → "This Wk", "Last Week" → "Last Wk", "Wk Before Last" → "Wk Before", "Last 2 Wks" → "2 Wks", "This Month" → "This Mo", "Last Month" → "Last Mo". Sub-date ranges remain on each segment.
- ✅ **New preset "This+Last"** — key `thisandlast`, logic: `from = getSunWeekRange(1).from`, `to = getSunWeekRange(0).to`. Spans last week's Sunday through this week's current day. Added to both Operator Payouts and Hourly Employees.
- ✅ **Label init** — `initPresetChipLabels()` and `initHourlyPresetChipLabels()` both populate the new `ppc-range-thisandlast` / `hppc-thisandlast` sub-labels.
- ✅ **Active state** — operator active: `var(--b7)` background + white text; hourly active: `var(--g5)` background + white text. Matching existing color scheme.
- ✅ **Reset button** — floating 30px circle with ✕, hover turns red-tinted. Calls `resetPayouts()` / `resetHourlyPayouts()` as before.

### Enter Tab — 2×2 Widget Grid (mobile)
- ✅ **Layout changed from horizontal scroll to 2×2 grid** — `#dw-mobile-strip` now uses `display:grid; grid-template-columns:1fr 1fr` on mobile. All 4 widgets visible without scrolling.
- ✅ **Tight vertical padding** — card padding 5px 8px, emoji 14px, gaps 5px. Minimal vertical footprint.
- ✅ **Inventory freshness dot** — green dot (≤1 day old) or amber dot (2+ days) next to the relative date
- ✅ **Inventory sub-label restored** — shows full date + time (e.g. "Apr 16 11:03 AM") instead of being hidden on mobile
- ✅ **Colored left border accent** — inventory tile gets `border-left: 3px solid green/amber` matching freshness state
- ✅ **Old mobile hiding rules removed** — `#dw-m-inv-label`, `#dw-m-inv-sub`, `#dw-m-inv` no longer hidden

### History Tab — Weekly Calendar Averages
- ✅ **Daily averages added to weekly summary bars** — each week bar now shows "avg $825/day" and "avg 370/day" as sub-text under the Sales and DV totals (Option D style).
- ✅ **Averages computed from days with sales data only** — closed days and empty days excluded from the divisor.
- ✅ **Styling** — 10px, font-weight 600, 50% opacity white. Sits directly under each total with 1px top margin.

### History Tab — Recon Widget Color Flip
- ✅ **Banner = dark blue gradient** matching weekly summary bars — `linear-gradient(135deg, var(--b9), var(--b7))`. White text, white-on-dark bank pills, translucent buttons. Visually belongs with the calendar.
- ✅ **Expanded body = page background** (`var(--bg)`) with dark text — clean contrast against the dark banner. All breakdown rows, inputs, chips, day rows use standard dark-on-light styling with CSS variables.
- ✅ **"+ Today" and 🔍 buttons** — translucent white on dark banner.
- ✅ **Chevron** — translucent white on dark banner.
- ✅ **Match badge** — `.none` state: translucent white bg. `.ok` and `.off` stay green/amber.
- ✅ **Breakdown rows** — labels `var(--text-muted)`, incoming `var(--g5)`, outgoing `var(--a6)`.
- ✅ **Bulk mark section** — dark text on light bg, chips use `var(--surface)` + `var(--border)`, active `var(--b1)` + `var(--b7)`.
- ✅ **Day rows** — dark text, amber amounts, hover `var(--b0)`.
- ✅ **Date inputs / arrow buttons** — standard form styling on light bg.
- ✅ **Result bar** — green/amber on light bg, unchanged.

---

## CC Ledger Architecture Notes (new)

### Modal kind toggle
- Kind state lives on `document.getElementById('cc-modal-overlay').dataset.kind` — either `'purchase'` or `'payment'`
- Always read via `overlay.dataset.kind || 'purchase'` (default purchase)
- `setCCKind(kind)` is the single source of truth for updating the buttons + sign prefix + dataset
- The bank-input (`#cc-f-amount`) never stores a sign; always a positive dollar value. Sign is applied only at save time.
- On edit: `rawAmt = parseFloat(entry.amount)`; `absAmt = Math.abs(rawAmt)`; input displays `absAmt.toFixed(2)`; `_buf = String(Math.round(absAmt*100))`; kind set from `rawAmt < 0`.

## Sticky Daily Summary Architecture Notes (new)

### Sentinel + IntersectionObserver pattern
- `#summary-sentinel` — zero-height div placed immediately above `#daily-summary-box`
- IntersectionObserver watches the sentinel; when it goes off-viewport, `.collapsed` class is added to `#daily-summary-box`
- Observer only fires collapse when `matchMedia('(max-width:480px)')` matches — desktop is unaffected
- `.summary-box-full` contains all existing summary rows (hero, cards, balance, sq deposit)
- `.summary-box-slim` is the collapsed bar (total + 4 allocation dots + sq deposit)

### Slim bar value sync
- `recalc()` calls `syncSlimDots()` and sets `#sum-sales-slim` / `#sum-sq-slim`
- `refreshSumCardAllocState()` calls `syncSlimDots()` to update dot allocated states
- `syncSlimDots()` reads `.sc-allocated` class from the full summary cards and mirrors to slim dots

### Sticky mechanics
- `position:sticky; top:0; z-index:25` on mobile only
- topnav and tabbar are `position:relative` (not sticky), so they scroll away — summary sticks to viewport top
- Collapsed state: `border-radius: 0 0 var(--radius) var(--radius)` + `box-shadow` for visual separation

---

## Order Tab Architecture Notes

### Mark as Ordered Section
- `renderOrderMarkSection()` — builds the section; called from `renderOrderBody`, `loadOrderPlan`, `orderAssign`, `unloadOrderPlan`
- `toggleMarkSection(opKey)` — expand/collapse product list per operator row
- `_orderDirty` — set true on any `orderAssign`, `orderSkipToggle`, `orderSkipAllCategory` when plan has a saved ID; reset on load/unload/save

### Skip Key
- All `_orderSkipped` reads/writes use `sku || name` as key to handle Gram Zero products (empty SKU)
- This applies in: `orderSkipToggle`, `orderSkipAllCategory`, `renderOrderBody`, `renderOrderSummaryCards`, `orderRebuildOpCards`, `orderUpdateOpMeta`, `orderUpdateVolumeTracker`

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
- **onclick with dynamic string values: always use `data-*` attributes, never inline string concatenation with quotes**
- **Bank-input (`.bank-input`) is positive-only by design.** To accept negatives, wrap the input with a kind toggle (see CC Ledger Purchase/Payment pattern); don't modify the bank-input helpers themselves.
- **Always reset `el._buf = ''` when opening a bank-input modal for edit**, then re-seed from the stored value. Otherwise a stale buffer from a prior open poisons subsequent typing.
- **Daily Summary has two child wrappers**: `.summary-box-full` (all detail rows) and `.summary-box-slim` (collapsed bar). Never put content between them or outside them within `#daily-summary-box`.
- **`#summary-sentinel`** must stay immediately before `#daily-summary-box` in the DOM — the IntersectionObserver depends on it.

---

## Critical Rules (never violate)
- Jeffrey prefers **complete ready-to-upload files** over snippets or diffs
- Testing is done logged in as **Mary** (`bestlifeever247@gmail.com`) — not Jeffrey admin
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
| Purchase | Positive CC Ledger amount — increases card balance |
| Payment | Negative CC Ledger amount — reduces card balance |
