# Badzone Versus visual system — proposed in one race slice

## Direction

Painted salvage machinery on a scarred road deck. Keep Badzone's utilitarian structure; obtain material character from hand-authored vector edges, worn paint, weld seams, rivets and restrained surface marks. No generated raster background, new font, animation framework or external artwork.

| Role | Specification |
| --- | --- |
| Background | Ink #101b18 / deep green-black #0b1511 |
| Panels | Layered dark greens #202e29 and #17241f; thin metal edge #46564b |
| Main text | Bone #ebe6d5 |
| Secondary text | Muted sage #b3beae; retain readable contrast |
| P1 | Amber #edb75a plus P1 text, consistently on board, HUD and order |
| P2 | Cyan #67bec1 plus P2 text; stays cyan from either client perspective |
| AI | Bone #c2bea9 / grey-green #9aa997, explicit A1/A2 IDs |
| Danger | Rust #ca7d70, limited to actual damage/risk |

P1 and P2 colors are fixed seat identities. YOU/OPPONENT are separate local-perspective labels; colors must not invert when the client changes.

## Typography and spacing

Reuse BadzoneDisplay for primary headings, monospace for telemetry, Arial for descriptions. Desktop section heading 32–42 px, turn 26–30 px, stats 28 px, body 13–15 px. Mobile body remains 13 px or greater; tile ownership stays readable at 320 px. Use a 4/8/12/16/24 spacing scale. Buttons remain native, labelled, minimum 44 px tall and visibly focusable.

## Board and surfaces

Keep every cell at (x × 50, y × 50) in SVG space. Surface occupies a continuous road; grid lines remain at the same boundaries. Surface scratches are deterministic decoration independent of gameplay RNG. Thick physical edge hardware sits outside playable cells. Terrain has solid mass, directional highlights and striped corners. A path uses bright outlined diamonds and a dashed destination; it always renders above surface and hazard art. Vehicle art stays in its cell with a separate horizontal ownership plate.

## Chassis prototypes

- Scrap Runner: asymmetric utility bed, spare wheel and mismatched armor.
- Road Knife: narrow pointed nose, exposed rear engine, slim separated wheels.
- Iron Bruiser: broad armored deck, heavy front ram, four square wheel pods.
- Gun Wagon: medium heavy body, offset turret and projecting gun barrel.

Four prototypes form one coherent field. NW/N/NE are rigid rotations of the original top-down vector within each cell; no 12-file production asset set is created at this stage. Ownership tint is paint, not a change of shape. Wreck/fire remain overlays.

## Hazards

Slice: gunk uses irregular oil pools, thin reflected edges and tire streaks; terrain uses welded blocks. Later system proposal: mines = low detonation plates/triangles; inferno = scorched vents and discrete flame shapes; debris = angular scrap; turrets = edge housings plus warning zones; gloom = darker surfaces with illuminated edges. Full hazard rollout is deferred.

## Feedback vocabulary

All displayed dice/damage values come from existing engine events. The representative shot resolves unchanged engine action logic locally, not multiplayer. Show the actual handling die/target, shot die and Hull loss. 480–650 ms path/tracer/impact feedback, without delaying state update or gating input. A persistent event card and radio remain after motion ends. Reduced motion removes transitions, pulse and tracer animation while retaining the same results and symbols. View-only turn-state samples never change ownership or engine turn authority.

## Unchanged

Original landing, garage, Solo, mock rooms, ready/rematch/result flow, original board renderer, all engine and persistence code, race rules, chassis stats, track generation, action legality, RNG and AI. No deployment changes. New art and layout are confined to the visual-slice page pending review.
