# Project Hub deployment

## Shape of the system

- This is a separate Next.js app in `project-hub/`, served at `project.nischay.tech`.
- The existing portfolio at `nischay.tech` remains at the repository root and is not changed by this app.
- The project hub admin uses Neon Postgres for project metadata.
- Project thumbnails and uploaded `.pptx` decks are stored as public Vercel Blob files. Project docs, PDFs, and architecture diagrams can be linked by URL.
- The project hub admin is served on the same domain at `/login`, `/dashboard`, and `/dashboard/projects`; `src/proxy.ts` maps these paths to the internal admin routes.
- MotionSense stays in its existing Streamlit repository and runs as a Streamlit app. This site embeds its URL on the project page and provides an open-in-new-tab link. It does not call MotionSense as an API.
- UniMonitor stays in its existing GitHub repository. The `demo-service` Docker image fetches a pinned source archive at build time and runs only the selected, allowlisted CLI operations.

The embedded MotionSense app can be blocked by the Streamlit host's frame policy. If a browser refuses the iframe, visitors still have the full-page link on the project detail page.

## Database

Create the Neon project, add its pooled Postgres connection string to the **separate project-hub Vercel project** as `DATABASE_URL`, then run these files in Neon SQL Editor in order:

1. `database/schema.sql`
2. `database/seed.sql`

The seed inserts the existing portfolio projects plus MotionSense and UniMonitor. It is safe to rerun because it skips existing slugs. Draft projects remain private: public queries filter on `status = 'published'`, and unpublished detail URLs return not found.

## Project files and presentations

The admin editor uploads thumbnails up to 5 MB and PowerPoint `.pptx` files up to 100 MB directly from the browser to the connected public Blob store. This avoids sending large files through a serverless function. Because the store is public, any uploaded presentation is publicly viewable by its URL; upload only decks you want to share. Uploaded `.pptx` files use Microsoft's Office web viewer on the project page, with a separate open/download link. For a presentation stored in OneDrive, paste the official PowerPoint for the web embed URL instead. The web viewer plays supported animations, but some advanced effects, transitions, embedded audio/video, or 3D features can differ from desktop PowerPoint.

## Administrator credentials

From the `project-hub/` directory, use Node.js in a terminal to run:

```powershell
node scripts/generate-admin-secrets.mjs
```

The script asks for a username and a hidden password, hashes the password with bcrypt, and prints `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `SESSION_SECRET`. Paste those into Vercel's environment settings yourself and keep the original password somewhere private. Never commit these values or put them in a `NEXT_PUBLIC_` variable.

Required Vercel environment variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled Neon Postgres URL |
| `ADMIN_USERNAME` | Single administrator username |
| `ADMIN_PASSWORD_HASH` | bcrypt password hash |
| `SESSION_SECRET` | 32+ character session signing secret |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob server upload access |
| `MOTIONSENSE_STREAMLIT_URL` | Public Streamlit app URL |
| `UNIMONITOR_DEMO_URL` | Render service URL |
| `UNIMONITOR_REPO_URL` | Optional UniMonitor repository override |

Connect a Vercel Blob store to the separate project-hub Vercel project so it supplies `BLOB_READ_WRITE_TOKEN`. Configure production and preview environments. Do not change the root portfolio project's root directory, domains, or settings.

Login uses an HTTP-only, Secure-in-production, SameSite Strict cookie signed with `SESSION_SECRET`, a seven-day expiry, same-origin mutation checks, and a persistent database-backed attempt limit. There is no public registration.

## Domain and Vercel project

Create a second Vercel project from `godnix7/godnix7` and set **Root Directory** to `project-hub`. Add `project.nischay.tech` to that second project. Use the exact DNS record Vercel displays at Namify; do not edit or delete any existing DNS record. Leave the original Vercel project serving `nischay.tech` unchanged.

## MotionSense

Keep the existing repository and its Streamlit application. Set `MOTIONSENSE_STREAMLIT_URL` to the deployed app URL (including `?embed=true` if you want Streamlit's embedded presentation). The project page loads the iframe only when this URL is configured and also shows an external link. Use the Streamlit app's video upload workflow; the cloud instance, not a visitor's laptop, runs PyTorch inference.

The Streamlit repository currently includes a CPU-only PyTorch requirements file. Its demo flow is video upload; cloud webcam capture should be treated as unavailable unless the app is changed to use the visitor's browser camera.

## UniMonitor isolated service

The service is in `demo-service/` and uses Python's standard library for its small HTTP layer. Render settings:

- Repository: `godnix7/godnix7`
- Root directory: `project-hub/demo-service`
- Runtime: Docker
- Health check path: `/healthz`
- Start: `python server.py` (already set in the image)
- Environment secrets: none

The image downloads UniMonitor commit `1c3f0121ca33cf851512e997cb227b7b1b9218f2` during its build. It runs `--help`, `--version`, or `--report` as the unprivileged container user, in a fresh temporary working copy. It does not expose the interactive menu, process termination, settings changes, or user-supplied shell input. Each request has a timeout, output/file limits, a small concurrency cap, and an in-memory per-client rate limit. The report contains actual Linux container readings; it does not have access to the Render host or the visitor's device.

After deployment, set `UNIMONITOR_DEMO_URL` to the Render service URL. The project detail page embeds it and keeps a full-screen link available.

## Local development

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Without `DATABASE_URL`, the public site uses the curated project seed data. Admin sign-in and project writes require the database, schema, administrator variables, and Blob token to be configured.
