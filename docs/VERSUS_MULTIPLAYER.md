# Badzone Versus — live multiplayer architecture

The static frontend remains at https://badzone-run.onrender.com. One Node authority at https://badzone-run-api.onrender.com owns rooms and game state. The browser polls authenticated snapshots every two seconds and sends revision-checked commands. No client submits a resolved state or dice value. Unconfirmed previews stay local.

## Rules boundary

Movement, handling, chassis stats, AI scoring, hazards, damage and section generation are unchanged. Solo saves and Solo endings are unchanged. Versus supplies stock P1/P2 chassis and symmetric victory: a wrecked human loses to the surviving human, both wrecked is a draw. In the final section, once a human exits, finish the current round and compare exit order. At the section's existing 18-round limit use exit order then track progress; an exact unresolved progress tie goes to P1. AI racers are ranked but cannot win the human contest. This ending replaces the Solo-only P1 termination logic for `mode: versus`.

## Authority and recovery

Six-character cryptographically random room codes; separate 192-bit seat secrets stored in tab session storage. Tokens travel in Authorization headers and are never included in opponent snapshots. Server dice state is randomly initialized independently from the public map seed and excluded from snapshots. All command bodies are validated. A room revision rejects stale operations. Request IDs make retries idempotent and reject reuse with different content. Server work is synchronous per command, so concurrent requests cannot interleave a race mutation. Only the seated current human can act; AI resolves server-side until the next human.

Both players ready to start. Both request rematch to reopen a fresh stock lobby. Closing or losing the connection preserves the seat; refreshing the same tab reconnects. Disconnect is shown after 15 seconds without a request. Leaving a race explicitly forfeits. No automatic timed forfeits. Opening a different browser requires the other available seat; there is no spectator access.

## Hosting limits

Free single-instance API, no external dependencies or paid resources. Rooms live in process memory, expire after 24 hours idle, and are cleared on restart/redeploy. Refresh/offline recovery works while the server retains the room. The interface explains an expired room and permits creating another. The first request after the free service idles may take a minute. Polling keeps an active match connected. No claim of durable saved online matches, high-availability failover, matchmaking, or tournament-grade abuse prevention.

## Verification

Run `npm test`, `npm run build`, and `BADZONE_PLAYWRIGHT=/path/to/playwright node scripts/check-multiplayer.mjs`. Browser test creates two isolated browser contexts, readies both, confirms a real move, reloads P2, disconnects/reconnects P2, finishes a shared race and mutually rematches. It checks 320/390/768/1280 widths. API tests cover authentication, third-seat denial, private state, stale commands, duplicate retries, malformed/forged actions, CORS and complete races.
