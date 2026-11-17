# Project Hub decisions and work log

Updated: 2026-11-17

## Existing implementation attributed to Claude

- Created the separate Next.js app in `project-hub/` within the existing `godnix7` repository.
- Added the initial landing page, project list and detail pages, admin login/project management, seed data, and a UniMonitor demo-service scaffold.
- Added MotionSense and UniMonitor project records. MotionSense is intended to embed a Streamlit URL when configured. The current source has no Auth0 integration.
- Added deployment guidance in `docs/DEPLOYMENT.md`.

## Codex work in this session

- Confirmed that the main portfolio app is at the repository root and the Project Hub is isolated under `project-hub/`.
- Replaced the Hub home page temporarily with a project-card index and added Hub-specific styles and this log. The production build passed.
- Pushed that change as commit `14ec764`.
- The user asked to stop that redesign. It was reverted in commit `a99c79c`; the Claude-era Hub implementation was preserved. This file remains at the user’s request.
- No changes were made to the main portfolio source in this session.

## Deployment observations

- Intended Hub host: `project.nischay.tech`; intended Vercel project: `nischay-project-hub`, rooted at `project-hub/`.
- The user’s latest browser screenshot showed `DNS_PROBE_FINISHED_NXDOMAIN` for `project.nischay.tech`.
- A later request to `https://nischay-project-hub.vercel.app` returned Vercel `DEPLOYMENT_NOT_FOUND`. Do not claim the Hub is currently live until Vercel and DNS are checked again.
- `/login` is not a Hub route. The admin login route in the existing app is `/admin/login`.
- Admin persistence requires production database and admin credentials to be configured. Do not store secrets in this file or the repository.

## Current clarified scope from the user

- Preserve the existing main portfolio exactly.
- Build a separate Project Hub that presents projects as cards, including MotionSense and UniMonitor. The user clarified that separate project demos do not need to be deployed just to show their cards.
- Keep the project hub and admin access separate from the portfolio. Confirm the exact host and deployment routing before changing DNS or Vercel assignments.
- The user also wants PPT upload and presentation from the Hub, with animations preserved. Verify actual browser playback capabilities before promising full PowerPoint animation fidelity.
