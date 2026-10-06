# Architecture

This standalone distribution uses public/index.html and public/app.js to mount the game at the root URL. The NecroNW site shell and tool routes are not included. Render Static Site serves public/ directly; the Node server is used only for local preview. No backend or database is required.

| File | Responsibility |
|---|---|
| public/badzone/engine.js | Chassis/upgrade data, RNG, track generator, authoritative state, action enumeration, preview, validation/resolution, AI, scoring, structured events |
| public/badzone/persistence.js | Save schema, defensive profile normalization, replay recovery, purchases and reward accounting |
| public/badzone/ui.js | Garage, race controls, contextual help, accessible SVG board, results and sharing |
| public/badzone/style.css | Game styling, responsive layout and minimal header wrapping for new navigation |

## Authority

UI submits a compact action `{throttle, steer, tactic, target?}`. The resolver requires correct field types, rejects unknown fields, checks the exact action against legal actions, clones state, resolves it and returns a new state. UI never writes vehicle fields. AI selects from the same legal action list and uses the same resolver. Movement previews consume no random values.

The state includes seed, mode, version, section, round, active racer, track, vehicles, exit order, section history, stats, RNG state, events, result and an action journal. Track tiles and temporary blast zones are distinct. Wreck and exit states remove racers from active turns. Guards cap section length and prevent an endless AI turn loop.

## Randomness

Separate seed-derived streams generate each section, opponent chassis and AI tie-breaking. Authoritative D6 results use a stored 32-bit LCG state. Section generation is independent of prior dice consumption. Seed strings allow 1–64 ASCII letters/digits/underscores/hyphens. Daily uses UTC midnight and ignores garage loadouts. Crypto randomness is used only to create an optional fresh Free Run seed/run ID, not for simulation resolution. No Math.random appears in the game modules.

## Persistence

`necronw.badzone.v1` stores saveVersion 1, normalized progression, settings and a run descriptor/action journal. It never shares a key with existing tools. Successful player and subsequent AI actions save as a single cycle. Reload reconstructs the race by replaying validated actions against the exact rules version. Unknown rules versions invalidate only the interrupted race while retaining valid profile fields. An unknown save schema safely returns a fresh garage.

Storage failures show an in-session warning. Bad JSON, oversized saves, invalid metadata or illegal journals do not reach rendering. Credits, owned upgrades, equipped upgrades, best score, last 20 runs, up to 60 loaded Daily entries and reduced-motion preference persist. Rewards mark the current record as settled in the same stored object; reload is idempotent. Storage remains user-editable and is not an anti-cheat system.

## Extension points

Chassis, upgrades and hazard labels are centralized data. Track generation is section-indexed. Resolvers and structured events have no DOM dependency. Rendering consumes state and previews. Future content can extend those boundaries without adding online features now. Multiplayer would still need server-side action authorization, transport and trusted persistence; this implementation does not claim to provide them.

## Performance and accessibility

One 96-cell SVG board is rendered. There are no timers, network gameplay calls, external art dependencies or animation requirements. The UI uses native labelled buttons, selects, details and inputs, visible focus, textual racer IDs and state alongside color. Responsive grids collapse below 600px; the shared header permits wrapping. Browser viewport and assistive-technology behavior remain unverified. NECROMUND:AI and the other NecroNW tools are not part of this standalone distribution.
