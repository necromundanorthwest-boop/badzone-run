# Versus recreation audit — Stage 1

Baseline: `3ca66054011a28dfd0ca37dfe0cc5c91216e28af`, branch `versus-ui-review`.
Scope: Stages 1–2 only. No multiplayer authority, deployment or gameplay changes.

## Before / after page map

| Existing region | Versus content | Treatment |
| --- | --- | --- |
| NWN / PLAY header | Same wordmark, Versus mode | Original top bar |
| Garage hero + tilted SVG track | Versus title, two-driver copy, Create / Join | Same grid, typeface, palette and art |
| Four chassis cards | Stock chassis selection | Original statistics, silhouettes and selected treatment |
| Seed / run panel | Room code, copy, ready | Original panel and labelled input |
| Workshop panel | Four-racer briefing, connections and ready states | Original panel; no upgrades in Versus |
| Race heading | Section, round, mock room code | Same title layout |
| SVG track | Text P1/P2 and AI labels | Same renderer, cells, vehicle shapes and hazards |
| Hull / speed / facing | Local driver HUD plus compact opponent line | Original status grid |
| Speed / steering / action / preview | Enabled on local turn; disabled on other turns | Original controls and preview presentation |
| Turn order | Ownership and active racer | Original four cards |
| Rules / Race radio | Versus copy and neutral mock events | Original details and log |
| Result score card | Win/loss, human placement, complete finishing order, rematch | Original result, metrics and actions |
| Footer | Existing fan-project credit | Preserved |

## Source and architecture

`public/index.html` loads `app.js`, `base.css`, and `badzone/style.css`. `ui.js` owns the garage, race, result, DOM events and persistence integration. Its exported `boardSVG` supplies the 8 × 12 track. `engine.js` is a pure deterministic rules module; `persistence.js` replays saved Solo actions and manages upgrades. `scripts/serve.mjs` is a loopback-only static preview server, not production authority. `render.yaml` currently describes a Static Site.

## Single-player assumptions to generalize in Stage 3

- `createRace`: racer zero gets selected chassis/upgrades and the name “You”; other slots generated as AI. State starts at turn zero and owns a single stats object.
- `damage`, `boundary`, `moveStep`, `enterHazard`, `resolveAction`: kills, collisions, hazards, activations and successful handling credited to racer zero.
- `finish`: reads vehicles[0], finds placement of id zero, calculates one score/reward/share string.
- `endRound`: racer-zero wreck or final exit ends the race. This requires an explicit multiplayer completion rule before Stage 3; the UI mock does not establish that rule.
- `resolveAction`: immediately ends on racer-zero wreck.
- `advanceAI`: runs until turn zero. Replace with controller-based stopping, not repeated 0/2 conditionals.
- `ui.js`: board accessibility description, P marker, local HUD, preview, order labels and recovery assume racer zero. Preview and legal actions must use authenticated local ownership.
- `persistence.js`: only free/daily modes, one run, one reward and Solo replay. Keep these separate from room sessions.

## Future server additions (not implemented)

One same-origin Node authority: opaque seat tokens, short room codes, two-seat capacity, ready/chassis state, HTTP commands + SSE, per-command receipts and state revisions, legal action validation, private local drafts, reconnect and room-scoped rematch. Server owns RNG and AI turns. Replace Static Site deployment with a single Web Service binding 0.0.0.0 and PORT, plus health endpoint. Room expiry, disconnect policy and process-restart behavior must be specified at that stage.

## Narrow visual budget

Keep both original CSS files, engine, persistence and Solo UI intact. Add a scoped Versus stylesheet for title suffix, wrapping room controls, turn banner, compact opponent summary, active-order outline and review controls. Reuse boardSVG with an optional label map and local racer id; default Solo output remains unchanged. Keep original chassis card markup, race-control layout and result classes. Mock review controls live in a standard expandable help block and are explicitly labelled local simulation.

## Render review

See VERSUS_UI_GATE.md for actual browser availability and validation evidence. Source inspection is not represented as rendered-page verification.
