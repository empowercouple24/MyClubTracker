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
1. Location comparison filtered by org
2. End-to-end onboarding testing with clean email
3. Mobile-friendly improvements sitewide
4. Co-owners (low priority)
5. Test partial product update approval flow end-to-end

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

**Not changed this session** — Payment Register, Operator Payouts, and Hourly Employees bank-inputs are unchanged (they remain positive-only, since negatives there would be refunds/clawbacks and Jeffrey only asked for this fix in CC Ledger).

---

## CC Ledger Architecture Notes (new)

### Modal kind toggle
- Kind state lives on `document.getElementById('cc-modal-overlay').dataset.kind` — either `'purchase'` or `'payment'`
- Always read via `overlay.dataset.kind || 'purchase'` (default purchase)
- `setCCKind(kind)` is the single source of truth for updating the buttons + sign prefix + dataset
- The bank-input (`#cc-f-amount`) never stores a sign; always a positive dollar value. Sign is applied only at save time.
- On edit: `rawAmt = parseFloat(entry.amount)`; `absAmt = Math.abs(rawAmt)`; input displays `absAmt.toFixed(2)`; `_buf = String(Math.round(absAmt*100))`; kind set from `rawAmt < 0`.

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
