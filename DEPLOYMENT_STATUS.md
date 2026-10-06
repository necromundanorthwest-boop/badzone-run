# Deployment status

**Deployment source prepared. Check Render for live status.** Rules version 0.1.0; standalone distribution revision 1.

## Completed

- Extracted only Badzone Run from the full NecroNW site package.
- Direct root entry, standalone document metadata, local display font and favicon.
- Garage home control now returns to the game garage rather than relying on the NecroNW hash router.
- Original engine and persistence code unchanged; CSS remains scoped to the game.
- Added Render Static Site configuration, build checks and local-server instructions.
- Prepared submission description and public-play instructions.
- Automated engine, persistence, combat and standalone-entry regression checks: PASS (16 tests).
- Static build/assets/syntax validation: PASS.
- 100 simulated races terminate; 600 generated sections pass route validation.

## Deployment source and account

Repository: https://github.com/necromundanorthwest-boop/badzone-run

The user authorized deployment to the connected Render account's My Workspace. The standalone source is prepared for that repository; no other Render service is modified. Live deployment status and the actual public URL must be read from the Render service dashboard rather than inferred from this preparation document.

Render CLI was not installed. The optional Blueprint was parsed locally and checked against official Render documentation, but not validated by Render CLI/API. Direct Static Site creation uses equivalent build and publish settings.

The included display font is losslessly packaged as WOFF; the unused body font is omitted. The same display font and original license are retained.

## Remaining verification

- Push the prepared source, create one Static Site and wait for a successful deploy.
- Verify the actual HTTPS root URL, local asset loading and release.json.
- Complete a fresh-browser game, purchase/refresh/Daily test, keyboard test and mobile checks at 320/390/768/1280 px.
- Inspect browser console for errors, check direct root refresh, and record the real human session duration.
- Use the actual deployed URL for the contest. Eligibility, submission form and any contest-specific requirements are not verified.

The supplied desktop screenshot confirms the earlier integrated build was running and displaying round 4 on the user's computer. It is not evidence of a completed race or a deployed standalone build. The supported browser-control capability remains unavailable in this environment; no new browser QA results are claimed.

## Official references consulted

- https://render.com/docs/static-sites
- https://render.com/docs/blueprint-spec
