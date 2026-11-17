# Nischay Kademane — Portfolio + Project Desk

The main portfolio at [nischay.tech](https://nischay.tech) and its project CMS, built with Next.js 16, TypeScript, React Three Fiber, Neon Postgres, and Vercel Blob.

The site is an editorial project index with an interactive 3D hero, public case pages, external live-project links, and project demos. The private admin lives at `admin.nischay.tech` after the domain and environment setup is complete.

## Project demos

- **MotionSense** stays in the existing [Streamlit repository](https://github.com/godnix7/MotionSense---Deep-Learning-Project). The portfolio embeds its Streamlit inference app on the project detail page when `MOTIONSENSE_STREAMLIT_URL` is set.
- **UniMonitor** stays in the existing [Linux monitoring repository](https://github.com/godnix7/Unimonitor). `demo-service/` runs its real CLI with three fixed operations inside a restricted Docker service. It reports container-scoped measurements, not visitor or Render-host metrics.

## Local development

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

The public portfolio has curated server-side fallback data while Neon is not connected. Admin sign-in and project changes need `DATABASE_URL`, the SQL setup, administrator credentials, and the Blob store token.

## Data setup

Run `database/schema.sql` then `database/seed.sql` in Neon SQL Editor. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the Vercel environment variables, administrator setup, custom domain routing, and demo-service deployment steps.

## Checks

```powershell
npm run lint
npm run build
```
