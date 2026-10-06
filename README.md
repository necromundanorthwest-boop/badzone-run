# Badzone Run

**Race. Wreck. Upgrade. Repeat.** A standalone, turn-based browser racing game by Necromunda Northwest. Choose one of four chassis, race three AI rivals across three seeded sections, survive hazards, shoot, ram and improve your next run in the garage. Includes standardized UTC Daily Runs and local saves. No account is required.

## Render deployment

This project is a **Static Site**. There is no production Node server, Docker container, database or persistent disk. Once deployed, judges open the Render URL and play directly; no Terminal or downloads are required.

Push the contents of this folder to the root of a GitHub repository. `package.json`, `render.yaml`, `public/`, `scripts/` and `tests/` must be at repository root, not wrapped inside another Badzone_Run_Render folder.

Choose **New → Static Site** in Render and connect the repository:

| Setting | Value |
|---|---|
| Name | badzone-run |
| Branch | main |
| Root Directory | Leave blank |
| Build Command | `npm test && npm run build` |
| Publish Directory | `public` |
| Environment variable | `SKIP_INSTALL_DEPS=true` |

`.node-version` selects Node 22 for build/test tooling. The app has no npm dependencies. No Start Command is used for a Static Site.

The optional `render.yaml` defines the same static deployment for a Blueprint workflow and adds response headers. Use either direct Static Site creation or the Blueprint, not both. If the name is unavailable, choose `badzone-run-nw`; use the actual URL Render returns, not an assumed URL.

## Local preview

Node 22 or later is required only for local preview/build/tests.

On macOS, extract this ZIP into Downloads. In Terminal:

```sh
cd "$HOME/Downloads/Badzone_Run_Render"
npm start
```

Open http://localhost:4173/ . If the old NecroNW preview is still running, press Control+C in its Terminal first. Leave the new Terminal running while playing locally. No `npm install` is necessary.

## Tests

```sh
npm test
npm run build
```

The build validates native JavaScript modules and their local assets. There is no transpilation step. The authoritative game engine and persistence module are byte-identical to the integrated 0.1.0 candidate. Root mounting, branding links, base styling and deployment configuration are specific to this standalone distribution.

## Persistence

Progress lives in this browser's localStorage under `necronw.badzone.v1`. The existing localhost profile will not appear automatically on the Render domain. Daily loadouts ignore upgrades; the Daily changes at UTC midnight. Scores are local and unverified. If storage is unavailable, the UI explains that progress cannot survive closing the page.

## Submission handoff

- `SUBMISSION.md`: title, description and judge-facing instructions.
- `DEPLOYMENT_STATUS.md`: executed checks, remaining gates and connection requirements.
- `docs/BADZONE_RUN_RULES.md`: complete original digital rules.
- `docs/TEST_RESULTS.txt` and `docs/BUILD_RESULTS.txt`: validation output.

The package is prepared for deployment. A public Render URL and browser acceptance must be verified before submitting that URL to the contest. No contest submission has been sent and no specific contest eligibility requirements have been verified.

Original digital rules and CSS/SVG visuals. Unofficial fan project; not affiliated with Games Workshop. Included display font licensing is provided in `public/assets/font-license.txt`.
