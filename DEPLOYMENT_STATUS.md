# Deployment status — 8 October 2026

Public URL: https://badzone-run.onrender.com

Real multiplayer baseline `3981c07b457d1baf8c2a6908efcb067b79d412ce` is deployed and verified through two independent browser contexts. API deploy `dep-db3sj9cs728c7382stcg` and frontend deploy `dep-db3sk6tg1s2s73bmg8r0` reported live. Both clients shared the same race, survived refresh/offline recovery, completed a match, and mutually rematched.

## Services

- Existing frontend `srv-db28bn4s728c73bgbdu0`: Render Static Site, branch main, `public`.
- Authority `srv-db3sj94s728c7382ss7g`: free single Node instance, branch multiplayer-live, `node server/index.mjs`, host 0.0.0.0, Render PORT.
- Health: https://badzone-run-api.onrender.com/api/health.
- Workspace: user-authorized My Workspace. No unrelated service changed.

## Visual release

The full visual candidate passes 28 automated tests and the build gate. Five screens at 320/390/768/1280 widths were tested with keyboard confirmation and reduced motion. See `docs/VERSUS_RELEASE_REVIEW.md` and screenshot evidence. Final visual deployment status is recorded in the completion message and Render history.

## Operational limits

Free-service initial wake-up can take a minute. Rooms are memory-resident and reset when the API restarts/redeploys; refresh and network reconnect preserve the same tab's seat while the room exists. Solo saves remain local. The frontend-only visual deployment does not redeploy the authority.

This is a usable shared multiplayer release. Contest-specific eligibility and submission form requirements have not been audited; no contest submission has been sent.
