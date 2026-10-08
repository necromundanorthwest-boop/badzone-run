# Versus visual slice review

## Delivery and scope

Stages 1–2 and one Stage 3 race-screen candidate are complete. Open `BADZONE_VISUAL_SLICE_REVIEW.html` directly, or serve `/visual-slice.html`. The portable HTML embeds its modules, CSS, and font. No external asset service is required.

The continuous worn road, perimeter hardware, four original vehicle silhouettes, fixed gold P1/cyan P2 ownership, turn banner, action controls, route preview, and event feedback are implemented in an isolated page. The existing engine produces handling, movement, shot, and damage outcomes. Confirm resolves one local action and pauses; review controls provide presentation samples and reset.

The repository baseline is a local Versus interface mock, not a live multiplayer server. No server, network protocol, game rule, existing Solo module, main entry page, or production configuration was changed. This is a visual review candidate; wider rollout is deferred.

## Evidence

| Check | Result |
|---|---|
| Existing and new Node tests | 21/21 passed, including 100 simulated races |
| Existing build gate | Passed |
| Chromium through Playwright | 134.0.6998.35 |
| Viewports | 320×844, 390×844, 768×1024, 1280×720 |
| Horizontal overflow | None at all four widths |
| Browser console/page errors | None |
| Keyboard confirmation | Passed at all four widths |
| Local shot outcome | Actual handling D6 6 vs 3+, shot D6 6, P2 hull 12→11 |
| Waiting samples | Opponent/AI controls disabled; preview removed |
| Alternative maneuver | Recover resolved through existing engine |
| Reduced motion | Shot animation disabled; result text persists |
| Portable HTML | Loaded from file URL; engine outcome confirmed |

After confirmation keyboard focus moves to the visible result, with a persistent polite live-region announcement. Machine-readable browser results are in [browser-results.json](visual-evidence/browser-results.json). Reproduce with `npm test`, `npm run build`, and `BADZONE_PLAYWRIGHT=/path/to/playwright node scripts/check-visual-slice.mjs`; regenerate the portable page with `node scripts/build-visual-slice-review.mjs`.

## Screenshots

- [Before: landing](visual-evidence/before-landing-1280.png)
- [Before: race](visual-evidence/before-race-1280.png)
- [Race: 390×844](visual-evidence/slice-race-390.png)
- [Resolved shot: 768×1024](visual-evidence/slice-shot-768.png)
- [Race: 1280×720](visual-evidence/slice-race-1280.png)
- [Desktop first viewport](visual-evidence/slice-first-viewport.png)

Race/shot screenshots are full-page captures at the named viewport sizes. First-viewport evidence is separately labeled.

## Assessment and remaining limits

The board reads as one physical surface, and chassis can now be distinguished by shape as well as ownership plates. Mobile title wrapping and small ownership badges were corrected after the first screenshot pass. The candidate preserves exact grid coordinates and uses text for information otherwise conveyed by paint or animation.

The page still scrolls, particularly on phones; the board-first hierarchy puts controls below the board. Some secondary telemetry remains small. This is a tradeoff to assess during human review, not a claim that all controls fit in one screen.

Only the Gunk scene and solid terrain receive the full environmental treatment here. Other hazards, landing/lobby/results screens, full production asset variants, and broad rollout remain deferred. No real multiplayer, reconnect, latency, cross-browser, screen-reader, or performance benchmark is claimed. The automated browser is Chromium 134, not a claim of testing every current Chrome release. Aesthetic approval remains a human review decision.
