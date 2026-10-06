# Badzone Run — digital rules 0.1.0

These are original browser-game rules, inspired by segmented hazardous racing. They are not the complete Necromunda vehicle rules.

## Objective and structure

Survive and cross the north edge of section 3. Each section is an 8-column by 12-row board. All four racers start together. Each round activates player P, then rivals 1, 2 and 3, skipping wrecked and already-exited racers. Turns are untimed.

After at least half of surviving racers exit an intermediate section, finish the current round and replace the track. Leaders start one row ahead, plus one additional row if they waited at least a round (maximum two). Stragglers start on the back row. Leaders rank by crossing order; stragglers rank by forward progress, then racer ID. Each racer is placed in a distinct lane. Track setup clears fire and refreshes gyro steering. Hull damage and speed persist.

A section times out after 18 rounds. Intermediate timeouts advance to the next section with the same leader/straggler rules. The final section ends when the player crosses, at that round's end, or after 18 rounds. A player wreck ends the run immediately. Player finish position uses crossing order. DNF position is provisional: exited vehicles first, surviving racers by progress, wrecks last. Equal-progress ties use racer ID.

## Chassis

| Chassis | Top speed | Handling | Hull | Gun damage | Crew | Mass |
|---|---:|---:|---:|---:|---:|---:|
| Scrap Runner | 3 | 3+ | 8 | 1 | 2 | 2 |
| Road Knife | 4 | 2+ | 6 | 1 | 1 | 1 |
| Iron Bruiser | 2 | 4+ | 12 | 1 | 3 | 3 |
| Gun Wagon | 3 | 4+ | 9 | 2 | 3 | 2 |

Iron Bruiser receives +1 ram damage. Crew is a descriptive chassis statistic in this MVP; there are no individual crew activations or injuries. All four chassis are initially unlocked. Progression consists of workshop upgrades and personal scores.

## Maneuvers

Choose throttle −1, 0 or +1, then relative steering −1, 0 or +1. Speed cannot fall below 1 or exceed the chassis limit. Active vehicles cannot park. Speed 0 is reserved for wrecks.

Facing uses NW, N and NE only. Steering rotates one step among those three headings; no reversing or southward driving. Each speed point moves one row north and, for diagonal headings, one column sideways. A Drift additionally shifts one column in the chosen steering direction before forward movement. This deliberately compact abstraction avoids eight-direction vehicle physics.

An activation combines that movement with one tactic: Drive, Drift, Shoot, Ram or Recover. Recover cannot accelerate; it clears existing fire and reduces the handling target by 1, minimum 2+. Hull is not repaired mid-race. Every new race starts with full Hull.

The dotted path and outlined destination show the intended maneuver. Collisions and handling failures can change the outcome. A dangerous line is legal to attempt; the preview identifies its risks. Terrain ends movement before the occupied cell; leaving the north boundary clears the section.

## Handling and loss of control

A test is required when steering, drifting, at redline, crossing a planned slick, driving with critical Hull (2 or less), or using an overcharged engine at maximum speed. Roll D6 at or above the target.

Start at the chassis handling value. Add 1 for a turn at speed 3+, 1 for speed 4, 1 for Drift, 1 for critical Hull, 1 for a crossed slick and 1 for an overcharged engine at top speed. Steering alone requires the base test but adds no modifier. Recover subtracts 1. Final target is bounded from 2+ to 6+. Modifiers and results appear in the event log.

A failed test rolls another D6: 1 skid west; 2 skid east; 3 spin NW; 4 spin NE; 5 surge one extra cell; 6 crash (lose 1 Hull and move at crawl). Skids resolve the sideways displacement before renewed forward movement. A spin redirects compulsory movement; the racer remains northbound. Gyro steering automatically rerolls the first failed handling test per section.

Handling is tested once per activation from the intended reachable path. Unexpected hazard entry still resolves mine, fire and debris effects; a secondary slick does not recursively trigger another loss-of-control test.

## Terrain, edges and hazards

Each section independently rolls Open, Light or Dense terrain (5, 10 or 16 obstacles), an edge type and one of six hazards. Starting rows are clear. Column 3 is reserved as a completely clear speed-1 route; column 6 remains free of terrain but may contain hazards. Generation validates a traversable straight route. These protected lanes guarantee viability but can also create a dominant route; human balance testing remains needed.

Terrain collisions cause 1 + floor(speed/3) Hull damage and reduce speed to 1. Wrecks are nonblocking.

| Edge | Consequence |
|---|---|
| Barrier | Lose 1 Hull |
| Drop | Lose 3 Hull |
| Open Edge | Fall back 2 rows, capped at the back row |

Each edge consequence resets facing north and speed to 1. Shoulder displacement preserves unique occupancy; a completely blocked shoulder wrecks the displaced racer as a safeguard.

| Hazard | Digital effect |
|---|---|
| Gunk slick | Planned crossing adds +1 handling difficulty; slick remains |
| Mines | Entering deals 2 Hull; mine disappears |
| Auto-turrets | End in outer two columns on either side: D6 4+ causes 1 Hull |
| Inferno | Enter a marked cell: on 4+, burn for 1 Hull at the end of the current and next activation; Recover extinguishes |
| Falling debris | Marked cell causes 1 Hull and becomes a blast zone; terrain impacts also generate zones and immediate nearby damage. Ending within 1 cell of a zone causes 1 Hull; zone persists through the following round |
| Gloom | Weapon range reduced to 2 cells |

Hazards survived count nonfatal marked-cell entries and nonfatal turret exposures, not distinct hazard types. Inferno can reignite after a Recover if the subsequent movement enters fire. Blast effects may cause both impact and lingering damage in the same activation.

## Shooting

Shoot is offered only with a target in the projected firing solution. It resolves after compulsory movement. If the actual position or facing makes the target illegal, the shot is lost and explained. No shots occur after exiting a section.

Range is Chebyshev distance (the larger of horizontal and vertical separation), maximum 5 normally. A forward cone follows facing: forward dot product must be nonnegative and lateral separation no more than forward separation +1. Intervening terrain supplies cover. Hit on 4+, or 5+ with cover; on a hit, deal weapon damage. There is no separate wound or save roll. No ammunition tracking.

## Ramming and collision

Ram is offered when the planned path encounters another active racer. Calculate damage as:

`clamp(1 + floor((attacker speed − defender speed + attacker mass) / 2) + Bruiser bonus + armoured ram bonus + oblique bonus, 1, 5)`

Matching headings count as rear contact; opposite diagonal headings count as crossing contact; other heading differences count as oblique (+1 damage). Attacker damage is max(0, defender mass − attacker mass), plus 1 for crossing contact. These angle categories are abstractions derived from heading, not continuous physics.

Push the defender one cell along attacker facing. Terrain or another vehicle blocks the push and causes 1 additional damage. Edge and hazard consequences still apply. A push can carry the defender across the finish. The attacker takes the vacated contact cell and stops at speed 1. An ordinary vehicle collision deals 1 Hull to each vehicle, with no deliberate push. At 0 Hull, a racer is wrecked and removed from active turn order.

## Workshop

Each chassis fits at most one upgrade. Purchases persist locally; switching between owned upgrades is free. Upgrades apply to the next Free Run and never the Daily. All races begin repaired.

| Upgrade | Scrap | Benefit and tradeoff |
|---|---:|---|
| Overcharged engine | 100 | +1 top speed, capped at 4; +1 handling difficulty at top speed |
| Armoured ram | 100 | +1 ram damage; acceleration only on alternate activations |
| Gyro steering | 120 | First failed handling test each section automatically rerolls |
| Reinforced plating | 100 | +2 Hull; −1 top speed, minimum 2 |
| Short barrel | 100 | +1 shot damage within 2 cells; maximum range 3 |

## Scores and Daily

Finish: 3,000; placement: (5 − position) × 750; efficiency: max(0, 2,000 − activations × 60); remaining Hull × 100; rivals wrecked by the player × 400; successful handling tests × 50; collisions −100 each. Total minimum 0. DNF receives no finish, placement or efficiency points. Wreck attribution requires direct player damage; later environmental damage is not credited to the earlier attacker.

Free Run reward: max(30, floor(score/40)) scrap. Daily gives no scrap. Rewards are applied once per completed run record. The UTC date determines BADZONE-YYYY-MM-DD; stock Scrap Runner, opponent generation and tracks are identical for the same version and date. Player choices alter the subsequent sequence of rolls. Retries are allowed, best score is retained. Share text includes seed, rules version, status, score, activations and Hull. These are local, editable, unverified scores without a server leaderboard.
