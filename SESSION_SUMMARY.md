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
| `favicon.ico` | Favicon — green bolt (rebuilt this session) |
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
1. Location comparison filtered by org
2. End-to-end onboarding testing with clean email
3. Mobile-friendly improvements sitewide
4. Co-owners (low priority)
5. Test partial product update approval flow end-to-end

---

## Completed This Session (April 11, 2026)

### Club Team Section (Settings → Profile)
- ✅ **Unified Club Team section** — merged "Club Team" config list and "Team Members" Supabase list into one card-style section
- ✅ **Card layout** — each member: 44px avatar (photo if linked, else initials) · color dot · name/alias inputs · linked email or "Link to account" dropdown · role dropdown · active/inactive or hourly rate · unlink button
- ✅ **userId linking** — `SETTINGS.teamMembers` entries now carry `userId` field; owner links slots to Supabase accounts via dropdown; unlink button (non-destructive, keeps location access)
- ✅ **Sort order** — Owner → Operators A–Z → Hourly A–Z
- ✅ **`getUnlinkedLocationUsers`** — no longer excludes current user (Mary can link herself to her own slot)
- ✅ **Unlink replaces Remove** — "Unlink" button clears userId only; destructive remove is no longer on cards
- ✅ **"Not signed up yet"** label only shows when dropdown is empty

### Order Tab — Major Fixes
- ✅ **Loaded plan volume tracker** — `loadOrderPlan` now calls `renderOrderSummaryCards()` and `orderUpdateVolumeTracker()` immediately after render
- ✅ **DV Need showing PAR** — `renderOrderSummaryCards`, `orderUpdateVolumeTracker`, `orderRebuildOpCards`, `orderUpdateOpMeta` all use `_planNeedOverride` first
- ✅ **Operator card DV** — `orderRebuildOpCards` and `orderUpdateOpMeta` now use `_planNeedOverride`
- ✅ **Save plan prompt reworked** — same name = overwrite confirm; different name = auto save as new (no extra prompt)
- ✅ **Assign All button alias** — category header Assign All now shows operator alias on load (not full name)
- ✅ **Unsaved changes warning** — `_orderDirty` flag tracks changes to a saved plan; switching to a different plan prompts "You have unsaved changes"
- ✅ **Go to Order flow** — if saved plan loaded: prompt sends user to Order tab to save first; if unsaved plan with assignments: confirm discard
- ✅ **Unload button** clears operator chips, header widgets, and mark-as-ordered section
- ✅ **Category header restored** — was accidentally dropped; category name + Assign All + Skip All buttons all back
- ✅ **Skip All button** — white `—` button per category header; toggles all/none skipped for that category
- ✅ **Gram Zero skip bug** — all Gram Zero products had empty SKU `""` causing shared skip key; fixed with `sku||name` key throughout
- ✅ **Skipped items excluded from counts** — Items to Order, Assigned X/Y, Unassigned chip, operator chip counts all exclude skipped rows

### Order Tab — Mark as Ordered (redesigned)
- ✅ **Moved above toolbar** — "Mark as Ordered" section now sits between vol tracker and toolbar (non-sticky)
- ✅ **Gated** — only operators with ≥1 assigned item or DV > 0 appear
- ✅ **Expandable product list** — each operator row has ▼ chevron; tap to expand/collapse list of product name, SKU, need qty, VP, DV subtotal
- ✅ **Product row dimming** — `.order-row-ordered` CSS (opacity 0.45) applied live when operator marked ordered; rows stay editable
- ✅ **Mark ordered button removed from card heads** — cards now just show avatar + name + meta + chevron

### Payment Register
- ✅ **Show more → 10 increments** — was 20; now shows 10 at a time with Reset button
- ✅ **Payee chips colored** — each chip uses that team member's assigned color from SETTINGS
- ✅ **Payee chip sort order** — Owner → Operator → Hourly, alphabetical within each group

### CC Ledger
- ✅ **Amount paste fix** — pasting `326.61`, `1,044.55`, `$1,044.55` all work; `_buf` seeded correctly so bank input blur doesn't wipe the value
- ✅ **Description autocomplete** — datalist suggestions from existing entries as you type
- ✅ **Search bar** — filters ledger in real time; dropdown of up to 8 matching descriptions; click or Enter opens edit modal; arrow key navigation; ✕ clear button

### Finances / Payouts Tab
- ✅ **Clear button removed** — standalone Clear above Daily Breakdown removed (redundant)
- ✅ **Show more text** — CC Ledger and Payment Register both say "Show 20 more" / "Show 10 more" consistently

### Enter Tab
- ✅ **Allocation preservation on re-save** — `saveDay()` now preserves `data.transfers` from existing record; cash deposited / confirmed allocations survive entry edits

### Inventory Snapshot
- ✅ **Hourly employees in pills** — `getHourlyMembers()` now included alongside operators
- ✅ **Initials auto-fill, read-only** — selecting a pill fills initials field and makes it read-only; clicking field directly clears chip selection and restores editability
- ✅ **Snapshot name prefilled** — opens with "Inventory Count - [today's date]"; field focused + selected for easy overwrite

### Favicon
- ✅ **favicon.ico rebuilt** — from uploaded `MyClubTracker_Logo_Bolt.png` (1080×1080); resized to 16/32/48px and packed as ICO
- ✅ **icon-16.png and icon-32.png** — rebuilt from same source
- ✅ **Cache-bust strings** — `?v=3` added to all favicon `<link>` tags in app.html

---

## Order Tab Architecture Notes (updated)

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
