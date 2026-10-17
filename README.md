# Nischay Kademane — Portfolio

Backend & AI engineer from Bengaluru. This is the source of my portfolio: **[godnix7.vercel.app](https://godnix7.vercel.app/)**

A professional, case-study style site with interactive 3D (a terrain that ripples around the cursor, a 3D hero object and tilting project panels). Project data is kept in sync with my GitHub account.

## Highlights

- **Interactive 3D:** a fixed GLSL point-terrain that ripples under the cursor and rotates on scroll, plus a React Three Fiber hero object that follows the pointer.
- **Live GitHub data:** repo stars, languages, last-push times, follower and repo counts are fetched from the GitHub API at build time and revalidated hourly (falls back gracefully if the API is unreachable).
- **Considered motion:** Lenis smooth scrolling, Framer Motion reveals, 3D-tilting case-study panels and a clean, responsive layout.
- **Contact form** via Web3Forms, no backend required.

## Featured projects

| Project | What it is | Stack |
| :-- | :-- | :-- |
| [MediLocker](https://github.com/godnix7/MediLocker) · [live](https://medilocker-main.vercel.app/) | Zero-trust medical vault & hospital system | FastAPI, PostgreSQL, S3, Redis |
| [Lynxis](https://github.com/godnix7/Lynxis) · [live](https://lynxis.vercel.app) | Multi-agent code intelligence | Node.js, Prisma, Three.js, Anthropic |
| [EventByte](https://github.com/godnix7/EventByte) · [live](https://event-byte.vercel.app) | Real-time hackathon judging | Django, TypeScript, Socket.io |
| [Deepfake-detection](https://github.com/godnix7/Deepfake-detection) | AI-generated video detection | Python |
| [RestoOps](https://github.com/godnix7/RestoOPs) | AI platform for restaurants | JavaScript |
| [LocalMusic](https://github.com/godnix7/LocalMusic) · [live](https://localmusic-three.vercel.app) | Music streaming platform | Fastify, Elasticsearch, Redis |
| [Althea](https://github.com/godnix7/Althea) · [live](https://althea-gamma.vercel.app) | Mental-health chatbot | Python, NLP |
| [Harvest Club](https://github.com/godnix7/harvest-club) · [live](https://harvestclub.vercel.app) | Community platform | TypeScript |
| [SIH Internal](https://github.com/godnix7/SIH-Internal) · [live](https://sih-internal-two.vercel.app) | Smart India Hackathon build | TypeScript |

## Tech

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Three.js / React Three Fiber · Framer Motion · Lenis

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Next.js 16 has breaking changes vs. older versions; see `node_modules/next/dist/docs/` before changing framework-level code.

## Editing content

- Projects, copy and tech lists: `src/lib/data.ts`
- GitHub sync: `src/lib/github.ts`
- 3D scene: `src/components/Scene.tsx` (background) and `HeroObject.tsx`
- Page layout: `src/components/Experience.tsx`

## Connect

[GitHub](https://github.com/godnix7) · [LinkedIn](https://www.linkedin.com/in/nischaykademane/) · [X](https://x.com/NISCHAYKADEMANE) · [Email](mailto:nischaykademane2006@gmail.com)
