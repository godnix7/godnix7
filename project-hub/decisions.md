# Project Hub decisions and implementation log

Last updated: 2026-11-17

This log records who implemented each part and the choices made. “Claude” refers to the earlier implementation supplied in this workspace; “Codex” refers to changes made in the current Codex session. The main portfolio app at the repository root is out of scope and must stay unchanged.

## Implemented by Claude (existing work inherited)

- Added an isolated Next.js application in `project-hub/` inside the existing `godnix7` repository.
- Built the initial portfolio-style landing page, project index and project detail pages, admin login and project-management UI, project database access with seed fallback, and a UniMonitor demo-service scaffold.
- Added project records for MotionSense and UniMonitor. The MotionSense record expects a `MOTIONSENSE_STREAMLIT_URL`; its page is intended to embed that Streamlit URL and offer an open-in-new-tab link. It does not use an API integration or Auth0 code in this repository.
- Added deployment notes in `docs/DEPLOYMENT.md` and `README.md`.
- The initial landing page reused a personal portfolio presentation. This made the Hub look like the main portfolio and did not meet the requested distinction.

## Implemented by Codex (current session)

- Preserved the main portfolio application and confined changes to `project-hub/`.
- Replaced the Hub homepage presentation with a project-first index: project count and featured count, project cards with previews and stack tags, links to case-study pages, and an Admin link.
- Added a responsive, dark visual system specifically for the Project Hub.
- Added this `decisions.md` file to make implementation ownership and current deployment decisions explicit.
- Verified that the repo’s MotionSense demo URL is not configured in the current environment. No Auth0 integration is present in the source searched for this task.

## Deployment and domain decisions

- Repository: `godnix7/godnix7`, with the Hub isolated under `project-hub/`.
- Vercel project: `nischay-project-hub`, configured to use `project-hub/` as its root directory.
- Intended Hub domain: `project.nischay.tech`. The main portfolio remains on its existing domain and Vercel project.
- The DNS CNAME was configured for the Hub Vercel project. The workspace resolver returned the Vercel CNAME and the live page response had the title “Nischay Kademane — Project Hub.” The user’s Chrome screenshot still showed `DNS_PROBE_FINISHED_NXDOMAIN`, so browser DNS resolution is not confirmed everywhere.
- Vercel-hosted deployment route `/login` returned 404 because that is not an app route. The Hub’s login page is `/admin/login`; the admin area is `/admin`.
- Admin database and credential environment variables still need to be configured in Vercel before admin features can save data. Required values are documented on the login screen and in `.env.example`; never commit credentials here.

## Remaining configuration

- Configure the production database and admin secrets in Vercel; apply the SQL files under `database/`.
- Configure the MotionSense Streamlit deployment URL if a live demo should be embedded.
- Configure and deploy the UniMonitor demo service separately if its live demo is required.
- Confirm DNS from the user’s browser/network and verify the production Hub after the latest deployment.
- PowerPoint presentation support and faithful playback of every PowerPoint animation are not confirmed as implemented; do not promise animation parity without validating the actual presentation viewer.
