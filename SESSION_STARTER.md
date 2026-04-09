# MyClubTracker — Session Starter

Hi Claude. I'm continuing development of **MyClubTracker** (myclubtracker.com), a multi-tenant SaaS platform for nutrition club management. I'm uploading my current GitHub repo ZIP so you have the exact live codebase to work from. Please read this file first, confirm you understand the context, then tell me you're ready.

---

## Who I am

I'm Jeffrey Nemecek, owner of Empower Nutrition & Energy (7659 Mentor Ave, Mentor OH 44060). MyClubTracker is a platform I built for managing multiple Herbalife nutrition club locations. It serves club owners and operators across multiple organizations, with me as the global super-admin.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS on GitHub Pages |
| Repo | `empowercouple24/Nemecek-Org-Clubs` (files at root) |
| Backend | Supabase (Postgres, Auth, Edge Functions, Storage) |
| Email | Resend — domain: myclubtracker.com |
| Payments | Square POS |
| Fonts | DM Sans, Outfit |

---

## Key IDs

| Name | Value |
|------|-------|
| Admin UUID | `d442c584-51be-4e26-aff8-a6da824fed83` |
| Empower location ID | `b021a4c4-8ba3-43fa-8e78-d87c870c9e05` |
| Nemecek Org UUID | `2c9248b8-bf51-4235-96eb-a8e801e01c43` |
| Supabase URL | `https://ndaqlamzlaucigvnhgfu.supabase.co` |
| Supabase Anon Key | `sb_publishable_wO6XM4pC2CcaISQ8OlbkfQ_liqKJbi_` |
| Square location ID | `LVX592AVBXCCY` |
| GCal OAuth Client ID | `618368859945-nsqok0t0aleg609dp89pftu478fa7ba2.apps.googleusercontent.com` |
| Mary Nemecek UUID | `9097fb68-963e-492e-93c2-52adea57c6b8` |
| Mike Cripe UUID | `25ce3db4-dc58-4648-bf23-cc5b677ab70a` |

---

## Active Files

`index.html`, `app.html`, `admin.html`, `settings.html`, `products.html`, `org-admin.html`, `organizations.html`, `onboard.html`, `request.html`, `privacy.html`, `nav.css`, `nav.js`, `shared.css`

## Permanently Deleted — Never Recreate

`app2.html`, `club.html`, `register.html`, `admin-settings.html`, `manifest.json`, `sw.js`

---

## Role Hierarchy

Admin (Jeffrey only) → Owner (location-level) → Operator (DB value: `employee`) → Pending

---

## Key People

- **Mary Nemecek** — owner role at Empower location
- **Mike Cripe** — org leader, Cripe Org
- **MN and JG** — the two primary Empower operators
- **Private email** `empowercouple24@gmail.com` must never appear in app-facing code
- **Public contact** is `support@myclubtracker.com`

---

## Critical Coding Rules — Always Follow

1. **Never use apostrophes/contractions inside single-quoted JS strings** — they break `onclick` attribute strings. Use `data-` attributes instead of passing string arguments inline.
2. **`app.html` does NOT load `nav.js` or `nav.css`** — all shared logic must be duplicated inline in that file.
3. **Always wrap `init()` in `try/catch/finally`** so runtime errors don't leave loading overlays stuck forever.
4. **Run `node --check` on every JS script block before delivering any file** — template literal and quote errors silently kill entire script blocks and are the most common cause of spinning/blank pages.
5. **Never use `font-family:'DM Sans'` or `font-family:'Outfit'` inside single-quoted JS strings** — use `font-family:DM Sans,sans-serif` (no quotes around font name).
6. **Deliver complete ready-to-upload files** — never partial snippets or diffs I have to manually apply.
7. **Repeat back the bug or request** to confirm understanding before writing any code.
8. **Never use `innerHTML` assignments with user-supplied data without `escHtml()`**.
9. **Supabase CDN:** use unpkg.com UMD path. `createClient` must pass `{ auth: { storage: window.localStorage, persistSession: true, detectSessionInUrl: true, flowType: 'implicit' } }`.
10. **Version checker** uses `CACHE BUST` comment comparison, not `Last-Modified` headers.

---

## How I Work

- I upload my full repo ZIP at the start of each session so Claude works from exact live code
- I prefer **individual changed files** over full ZIPs when only a few files are modified
- I test on the live deployed site at myclubtracker.com and return with specific correction instructions
- For UI changes, **show me a mockup or labeled options (A/B/C)** before building anything
- Always **syntax-check JS before delivering** — spinning pages are almost always a quote/syntax error

---

## Conversation Length — IMPORTANT

**I do not trust or want compressed or summarized conversations.** When the context window starts getting long, I want Claude to proactively warn me before any compression happens so I can start a fresh conversation instead.

Specifically:
- **Warn me early** — roughly after 1.5 to 2 hours of active back-and-forth, or when you sense the context window is getting full, stop and tell me before starting the next task.
- Say something like: *"We are getting close to the limit of what I can reliably hold in this conversation. I would recommend starting a new chat and uploading your latest repo ZIP before we continue so I have full context on the current code."*
- **Do not wait until compression has already happened.** Warn me while there is still a clean stopping point.
- **Never silently compress or summarize** conversation history without explicitly flagging it to me first.
- I would rather start fresh with a clean context than continue in a degraded state where important codebase details may have been lost.

---

## Session Handoff — IMPORTANT

When I agree to start a new conversation, before I leave the current chat Claude must prompt me to write a session summary. Specifically:

- **Prompt me with something like:** *"Before you go, let me write a detailed session summary you can paste into the new chat. This will give the next Claude full context on everything we did today."*
- Then immediately produce a detailed session summary covering:
  - Every feature built or changed this session, with enough detail that a new Claude instance could understand what was done and why
  - Every bug fixed and what the root cause was
  - Any decisions made (options considered, which was chosen and why)
  - Files modified and what changed in each
  - Anything that was tested and confirmed working
  - Anything still pending, broken, or left for next session
  - Any key learnings, gotchas, or rules discovered this session that should be remembered
- Format it clearly so I can copy it and paste it at the top of the new conversation along with my repo ZIP
- The goal is zero loss of context between sessions — the new Claude should feel like it was in the room the whole time

---

## Session Ready Confirmation

After reading this file, reply with:
> "Ready. I've read SESSION_STARTER.md and loaded the repo. What are we working on today?"
