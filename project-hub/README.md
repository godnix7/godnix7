# Nischay Project Hub

An independent project showcase and private project dashboard for [project.nischay.tech](https://project.nischay.tech). It lives in this repository's `project-hub/` directory and deploys as a separate Vercel project. The existing portfolio at `nischay.tech` stays at the repository root and is not part of this app.

## Included

- Animated portfolio-style project index and interactive 3D hero.
- Public project detail pages with links, hosted demos, and PowerPoint presentation embeds.
- Private administrator login, dashboard, project editor, draft/publish workflow, and direct image/PPTX uploads.
- MotionSense embedded from its existing Streamlit deployment.
- UniMonitor demo service in `demo-service/`, isolated from the visitor's machine.

## Deploy separately

Create a second Vercel project from `godnix7/godnix7`, set **Root Directory** to `project-hub`, then add `project.nischay.tech` to that project. Add only the DNS record Vercel specifies at the domain's DNS provider. Do not change the root portfolio Vercel project's root directory or domains.

Apply `database/schema.sql` and `database/seed.sql` to Neon. Configure the variables in `.env.example` in this second Vercel project. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full sequence. The admin routes are `/login`, `/dashboard`, and `/dashboard/projects` on the project hub domain.

## Local development

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

The public showcase uses seed data when Neon is not configured. Admin sign-in and edits require the database and admin environment variables.
