# Badzone Versus visual audit — 8 October 2026

Scope: visual Stages 1–3 only. Baseline `62f8876358f3d8445720178a158d969f16853510` from current `origin/main`.

## Authority check

The brief says live multiplayer exists. The current repository and deployed title instead identify a Stage 2 local mock. There is no authority server, transport, token/reconnect implementation or multiplayer test suite. Preserve this fact; do not imply that visual work completes multiplayer. The original deterministic Solo engine and mock implementation are the available authorities. This pass adds an isolated `/visual-slice.html`, leaving both existing entry paths unchanged.

## Rendered baseline

Captured the unchanged local checkout in Chromium at 1280 × 720. See `visual-evidence/before-landing-1280.png` and `before-race-1280.png` (full-page captures). These render current repository code; they are not claimed as a remote multiplayer session. A live Chrome navigation also returned the deployed “Interface Preview” title but initially remained on its loading text.

| Area | Decision | Observation and treatment |
| --- | --- | --- |
| First impression | REFINE | Strong amber/bone identity; uniform flat surfaces read as prototype. Establish the race as the centerpiece. |
| Information architecture | KEEP | Track left, controls right, telemetry and radio are understandable. Retain those relationships. |
| Landing | REFINE later | Large recognisable title and clear Create/Join; cropped empty hero hides every racer. Defer rollout until race slice approval. |
| Board | REPLACE presentation | 96 high-contrast rounded tiles dominate; continuous worn road with a subordinate exact grid is higher impact. |
| Vehicles | REPLACE artwork | Same marker silhouette for all four chassis. Use four hand-authored top-down SVG silhouettes with shared lighting. |
| Hazards | REFINE | Symbols are clear but feel abstract. Prototype gunk and physical terrain; defer other hazards. |
| Typography | REFINE | Keep existing font family. Tighten race titles, enlarge the turn message, use explicit telemetry levels. |
| HUD | REFINE | Local stats readable; opponent identity/color inconsistent with suggested ownership language. Fixed P1 gold, P2 cyan, AI neutral. |
| Turn state | REFINE | Small rectangular note lacks hierarchy. Integrate ownership accent and status into the control panel header. |
| Race Radio | REFINE | Flat prose list. Add restrained event-type labels and distinguish confirmed dice/results. |
| Result | KEEP for this slice | Existing stats/result mock left intact; final-classification art direction deferred. |
| Responsive behavior | REFINE in slice | Baseline board width of 500 produces an ~810 px-tall SVG; the desktop first viewport hides the vehicles. Smaller mobile labels need deliberate sizing. |
| Accessibility | KEEP / verify | Native buttons, labels and focus are useful. Preserve text IDs, add persistent announcements and no-motion equivalents. |

## Highest-impact order

1. Continuous physical board, exact 8 × 12 cell geometry.
2. Distinct four-chassis silhouettes and legible ownership plates.
3. Board / control density and meaningful turn hierarchy.
4. Engine-derived handling, shot and damage feedback.
5. Inspect screenshots and keyboard/mobile behavior before broad rollout.

No rules, chassis statistics, RNG, AI, section progression, victory logic, persistence or network behavior may be edited for this pass.
