# Versus UI gate — Stage 2

Status: **mock implemented; visual gate pending**. No Stage 3 engine generalization or server implementation has begun.

## Review artifact

Open `BADZONE_VERSUS_REVIEW.html` in a modern browser. It embeds the actual source modules, original font and styles and works without a development server. Alternatively run `npm start`, then open http://localhost:4173/. The root route is the Versus mock; `?mode=solo` loads the original Solo game. Regenerate the portable file with `node scripts/build-versus-review.mjs` after changes.

1. Select a chassis, Create Room, then use the labelled **Stage 2 review controls** to simulate opponent joining and readying. Both-ready is deliberately held for review; **Preview race** advances the fixture. Real automatic start belongs to integration.
2. For the Player 2 view, Return to Badzone, Join Room, enter **BZ2026**, select a chassis and Mark Ready.
3. Race controls retain the original preview logic. Confirm changes to an AI-turn fixture; it does not resolve movement or dice.
4. Review controls show Your Turn, Opponent Turn, AI Turn, disconnect/reconnect, win/loss and rematch. They are explicit developer-review controls, not proposed production navigation.
5. Rematch keeps the mock code and returns both humans to unready states.

## Preserved presentation

Original `base.css` and `badzone/style.css` are unchanged. Original SVG geometry, vehicle art, hazards, chassis statistics, fonts, colors, cards, race-control grouping and result-card styling are reused. `versus.css` adds only scoped presentation for the title suffix, room code row, turn/connection information and review controls. The board renderer accepts optional labels and local-racer identity; its default Solo rendering is covered by the original regression test.

`engine.js`, `persistence.js`, Solo rules, save format and production Render configuration are unchanged. The mock does not read/write Solo persistence. There is no online connection or room token. Private-choice behavior is presentation only at this stage, not a security claim.

## Verified

- `npm test`: **19/19 passing** (16 existing + 3 new).
- Existing suite still simulates 100 races and validates generated sections.
- New non-browser event/markup tests exercise host flow, join-code error, P2 chassis/ownership, local preview, inactive-turn board, hidden path, connection states, win/loss and rematch.
- `npm run build`: **pass**, including syntax validation for the new module and linked stylesheet existence.
- Portable review HTML generated from current source; no external font/module requests required.

## Browser / visual verification — BLOCKED

No Chromium executable is installed in the environment. Playwright downloads for both full Chromium and headless shell returned HTML instead of valid ZIP archives. Thus **no rendered baseline inspection, screenshots, viewport observations, real keyboard test, accessibility-tree inspection or browser-flow pass is claimed**. The source audit and event/markup tests do not substitute for these checks.

| Viewport | Required inspection | Status |
| --- | --- | --- |
| 320 px | Code wrapping, chassis labels, controls, board, results | Pending browser review |
| 390 px | Garage, waiting/ready, local and opponent turn | Pending browser review |
| 768 px | Two-column layout, HUD, result cards | Pending browser review |
| 1280 px | Baseline visual comparison and all mock states | Pending browser review |

Use the production baseline commit `3ca66054011a28dfd0ca37dfe0cc5c91216e28af` for before screenshots. Review both perspectives, reduced motion, keyboard focus, screen-reader announcements and horizontal overflow at each width. Correct demonstrated defects before accepting the gate.

## Remaining scope / handoff

The source implementation covers the requested static states, but Stages 1–2 are **not fully accepted** until rendered fidelity and browser checks pass. Do not begin server work on the strength of the non-browser tests. Final-race completion and deterministic human ranking require an explicit engine decision at Stage 3; this fixture does not settle gameplay semantics.

This branch is a review candidate. Do not merge it into production or use it as a live multiplayer competition submission.
