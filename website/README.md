# GTAMP Website

FiveM-style community website for GTAMP: live server browser, forums, marketplace,
docs, badges, upvotes, and the Keymaster.

## Run it (local)

```
cd website
npm install
npm start          # -> http://localhost:3000
```

## How the live server list syncs

- The **GTAMP launcher** POSTs its running session to `POST /api/servers/report`
  every 10s (configurable in launcher Settings via `websiteUrl`).
- The **website** serves the live list at `GET /api/servers/live`, and the launcher
  browser + website both consume it. Stale servers (no report for 5 min) drop off.
- Live updates are also pushed over WebSocket (`ws://...`, `{t:'servers',...}`).

Set `websiteUrl` in the launcher's `config.json` to your website URL (default `http://127.0.0.1:3000`).
Set `PORT`/`GTAMP_SECRET` env vars on the server.

## Pages / routes

| Route | Description |
|-------|-------------|
| `/` | Home — download, active player count, requirements, run-your-own-server, FAQ |
| `/servers` | Live server list (synced from launcher) |
| `/servers/:id` | Server detail + upvote + owner tags |
| `/forum` | Forums (announcements, general, GTAMP discussion, client support, server support, scripting, showcases, marketplace) |
| `/support` | Support hub |
| `/marketplace` | Buy assets |
| `/marketplace/:id` | Asset detail |
| `/docs` | Documentation (install, run server, artifacts, scripting, keymaster) |
| `/run-server` | Create your own server + artifact downloads |
| `/keymaster` | Your licenses + create/publish assets |
| `/login` `/register` | Accounts |
| `/admin/badges` | Grant/remove badges (staff) |

## Badges

- **Verified ✔**, Staff, Admin, Founder, Developer are staff badges (granted via `/admin/badges`).
- Achievement badges (Early Adopter, Author, Prolific Author, Server Host, etc.) are
  granted automatically as users complete the listed goals, or by staff.

## Marketplace / Keymaster

- Signed-in users create assets under their **Keymaster** and publish them.
- Buyers "Add to Keymaster" to use them. Payments/entitlements are a next-phase step.

## What's stubbed / next

- **Paid upvotes** (boost servers): current upvotes are free; a Stripe integration and
  boost tiers are the next step.
- **Automatic badge grant hooks** on events (currently staff-granted + early-adopter).
- **Real asset files / entitlements** on marketplace.
- Deploy to hosting (Render / Railway / VPS) — the app is standard Express.

## Deploy

The app is plain Node/Express + EJS with a JSON store (`website/data/`). On a server:
```
PORT=80 GTAMP_SECRET=<random> npm start
```
Use `GTAMP_SECRET` for sessions. For public play put the GTAMP launcher `.exe` at the
repo root so `/download/GTAMP-Launcher-v2.1.1.exe` works.
