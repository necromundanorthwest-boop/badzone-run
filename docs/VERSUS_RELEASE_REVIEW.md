# Versus multiplayer and visual release review — 8 October 2026

## Multiplayer release

Production was switched from a local interface mock to real server-authoritative rooms at the existing URL. The baseline multiplayer commit is `3981c07b457d1baf8c2a6908efcb067b79d412ce`. Render API service `srv-db3sj94s728c7382ss7g` and original static service `srv-db28bn4s728c73bgbdu0` reported live. Two independent browser contexts completed a live shared race, refresh reconnect, offline reconnect, and mutual rematch. Evidence: `MULTIPLAYER_LIVE_VERIFICATION.json`.

The only new rules scope is symmetric human race completion, documented in `VERSUS_MULTIPLAYER.md`; Solo behavior is retained. The subsequent visual rollout changes no server module or resolution rule. The API remains on the reviewed `multiplayer-live` branch.

## Completed visual stages 4–6

- Four original chassis with distinct silhouettes, NW/N/NE views and fixed P1 amber/P2 cyan/AI neutral identity. Wreck and fire overlays preserve IDs.
- Continuous worn road deck, welded terrain blocks, lane fragments, physical perimeter hardware and exact 8×12 cell positions.
- Oil pools, mine plates, flame vents, scrap piles, turret housings with danger zones, and darkened Gloom with readable vehicles.
- Vehicle artwork across landing, chassis selection, race HUD, board and results. Readable room status and copyable code in the ready lobby.
- Owner-colored turn banner, mobile turn/jump control, explicit opponent status, private route preview, persistent engine-derived handling/shot/damage feedback, and categorized Race Radio.
- Short movement/tracer/impact effects and a reduced-motion option plus operating-system preference support. Persistent text conveys the same outcomes.
- Consistent weathered panels, typography, focus states, native controls, and winner identity in results.

## Verification

28 Node tests pass, including original engine/save/mock tests and new authority/recovery tests. Existing build gate passes; browser module loading also validates the new art modules. Chromium 134 through Playwright verifies landing, lobby, race, resolved action and result at 320×844, 390×844, 768×1024 and 1280×720. No horizontal overflow after fonts load; keyboard confirmation and reduced motion pass. Six-hazard and 12-heading art sheet inspected. The polish screenshot harness uses labeled controlled server fixtures; it is separate from actual shared live-match evidence.

Evidence scripts: `scripts/check-polish.mjs`, `scripts/check-multiplayer.mjs`. Screenshot directories: `docs/polish-evidence/` and `docs/multiplayer-evidence/`. Local and live tests use the same production client and server modules. A testing-environment HTTPS proxy required accepting its certificate in the Playwright test context; production TLS settings were not modified.

## Limits

The race remains a scrolling interface, particularly on phones; an in-page turn shortcut reaches controls. Small peripheral board row numbers supplement larger text positions. Free-server wake-up and room-reset limits are documented in the UI and submission instructions. No claim of durable online saves, high availability, human aesthetic approval, exhaustive screen-reader coverage, or performance benchmarking. Earlier mock and slice documents remain historical records.

## Final deployed acceptance

Visual code commit `fd7531ab9a2dab3023e4c0cd219141c8047b7f63` deployed live as `dep-db412tss728c73fhutag`. A subsequent Chrome check at the public URL created a room, joined P2 in another tab, readied both, confirmed P1's real action, and observed synchronized positions plus P2's enabled controls. Screenshot: `polish-evidence/live-chrome.jpg`. Evidence-only commits after the visual deployment do not change production application bytes. The authority remains on `3981c07`.
