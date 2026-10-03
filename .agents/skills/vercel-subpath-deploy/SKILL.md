---
name: vercel-subpath-deploy
description: Guidelines for deploying Next.js applications on subpaths (e.g. /secretSanta) on Vercel with zero-cost architecture.
---

# Vercel Subpath & Zero-Cost Deployment Skill

## 1. Next.js Subpath Configuration
To serve the app specifically under `/secretSanta`:
- Configure `next.config.mjs` or `next.config.ts`:
  ```js
  const isProd = process.env.NODE_ENV === 'production';
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/secretSanta';

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    basePath: basePath === '/' ? '' : basePath,
    trailingSlash: false,
  };
  export default nextConfig;
  ```
- All client links (`next/link`) automatically respect `basePath`.
- All fetch calls in client components should prefix with `basePath` helper:
  `const getApiPath = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || '/secretSanta'}${path}`;`

## 2. Zero-Cost Free Hosting & DB Architecture
- **Vercel Hobby Tier**: Free unlimited static hosting + Serverless Functions.
- **Database**:
  - Local dev: SQLite file (`prisma/dev.db`).
  - Production free tier options:
    - **Turso (LibSQL)**: 9 GB free, 500 DBs, edge-ready, zero sleep.
    - **Neon Serverless Postgres**: 0.5 GB free storage, instant branching.
    - **Supabase**: 500 MB free Postgres.
- **Email Service**:
  - **Resend**: 100 emails/day free (3,000/month), zero credit card required.
  - Built-in Mock / Console fallback for immediate local testing without an API key.
