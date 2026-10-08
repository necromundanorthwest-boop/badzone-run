# Badzone Run: Versus

[Play Badzone Run](https://badzone-run.onrender.com)

Two human drivers, two AI rivals, three hazardous sections. Choose a stock chassis, create a room, share the six-character code, and both mark ready. Preview speed, steering, shooting or ramming; the server resolves each maneuver and its dice. Both drivers can request a rematch. No account required. Solo remains at `?mode=solo`.

## Run locally

Node 22 or later; no npm dependencies.

```sh
npm run start:multiplayer
```

Open http://localhost:4173 in two separate browser profiles or tabs, create/join the same room, and mark ready. `npm start` remains a static-only preview for Solo and historical review pages; use `start:multiplayer` to test online rooms locally.

## Hosting

- Frontend: existing Render Static Site `badzone-run`, branch `main`, publish `public`.
- Authority: one free Node Web Service `badzone-run-api`, branch `multiplayer-live`, start `node server/index.mjs`, binding `0.0.0.0:$PORT`.
- Build gate: `npm test && npm run build` on both services.
- API health: https://badzone-run-api.onrender.com/api/health.
- Allowed production browser origin: https://badzone-run.onrender.com.

The frontend uses the API origin above on the production hostname and same-origin APIs locally. A different hosting domain requires configuring both the client API URL and server allowed origins. The backend tracks a dedicated reviewed branch so presentation-only frontend deployments do not interrupt running rooms.

Rooms are in memory: refreshing/reconnecting the same tab restores a seat while the server retains it; server restarts or redeploys clear active rooms. Rooms also expire after 24 hours idle. The free service's initial connection after idle may take a minute. Solo saves and upgrades remain browser-local and separate from Versus.

## Tests and evidence

```sh
npm test
npm run build
BADZONE_PLAYWRIGHT=/path/to/playwright node scripts/check-multiplayer.mjs
BADZONE_PLAYWRIGHT=/path/to/playwright node scripts/check-polish.mjs
```

For live tests set `BADZONE_URL=https://badzone-run.onrender.com` and `BADZONE_API=https://badzone-run-api.onrender.com`. Playwright is test tooling, not a runtime dependency.

See [multiplayer architecture](docs/VERSUS_MULTIPLAYER.md), [live verification](docs/MULTIPLAYER_LIVE_VERIFICATION.json), and [visual release review](docs/VERSUS_RELEASE_REVIEW.md). Historical mock/visual-slice documents record earlier stages; the production entry loads `badzone/online.js`.

Original digital rules, SVG vehicles and environments. Four chassis rendered at NW/N/NE headings; six distinct hazard treatments. Independent fan project, not affiliated with Games Workshop. Display font license: `public/assets/font-license.txt`.
