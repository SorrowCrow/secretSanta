# 🎅 Secret Santa Web Application

A modern, privacy-first Secret Santa web application built with **Next.js 15**, **Tailwind CSS**, and **Prisma ORM**. Engineered for **100% zero-cost hosting** on **Vercel** with full subpath deployment support (e.g., `mydomain.com/secretSanta`).

---

## 🌟 Key Features

- **🌐 Subpath Ready (`/secretSanta`)**: Pre-configured to mount under `/secretSanta` with automatic root redirects (`mydomain.com/` → `mydomain.com/secretSanta`).
- **🔒 Strict Email Privacy**: Participant emails are strictly concealed from public API payloads and rosters. Only the assigned Secret Santa receives the reveal.
- **⚡ Cyclic Derangement Algorithm**: Fisher-Yates single Hamiltonian cycle guarantees zero self-pairings and balanced 1:1 secret circles with mathematical certainty.
- **🔐 Session Password & Host Security**:
  - Optional session password gates access to room details and participant submission forms.
  - Unique Host Admin Key (hashed with `bcryptjs`) gives only the room creator the power to trigger the draw.
- **🛑 Submission Locking**:
  - When the host clicks **"Start Secret Santa"**, the exchange locks immediately.
  - Participant form disappears, replaced with a prominent **"Submissions have ended"** festive banner.
  - Workshop roster remains visible showing all registered elves.
- **✨ Free Santa AI Assistant**:
  - Integrates with Google Gemini API (free tier) to compose personalized 4-line Christmas rhymes and 3 curated gift ideas based on wishlist, hobbies, and budget limit.
  - Deterministic holiday fallback works 100% offline if no API key is set.
- **💌 Zero-Cost Email Dispatch**:
  - Connects to Resend free tier (100 emails/day, 3,000/month).
  - Built-in mock mode prints festive ASCII terminal previews for zero-cost local testing.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Push Prisma database schema (creates local SQLite db)
npm run prisma:push

# 3. Run development server
npm run dev
```

Visit [http://localhost:3000/secretSanta](http://localhost:3000/secretSanta) in your browser!

---

## 🌐 How to Host on `mydomain.com/secretSanta` for Free

### Option A: You Own `mydomain.com` and Don't Have a Main Site Yet (Recommended)
1. Push this repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com) (free Hobby plan) and click **"Add New Project"** → Import your repository.
3. In your Vercel Project Settings → **Domains**:
   - Add `mydomain.com` (and `www.mydomain.com`).
   - Follow Vercel's DNS instructions to configure your domain registrar (A / CNAME record).
4. **Done!**
   - The app is mounted under `mydomain.com/secretSanta`.
   - Anyone visiting `mydomain.com/` is automatically redirected to `mydomain.com/secretSanta`.

### Option B: You Later Add a Main Site on `mydomain.com`
If you later launch a separate website at `mydomain.com`:
- Configure a reverse proxy / rewrite rule on your main site server or CDN (Cloudflare, Nginx, or Vercel rewrites):
  ```
  Route: /secretSanta/* -> proxy to https://your-secret-santa.vercel.app/secretSanta/*
  ```

---

## 🗄️ Database Setup (100% Free)

- **Local Dev**: Uses SQLite file (`prisma/dev.db`) automatically with zero configuration.
- **Vercel Production**: Vercel serverless functions have an ephemeral filesystem, so a hosted free database is recommended:
  - **[Turso](https://turso.tech)**: 9 GB free, 500 databases, edge-ready LibSQL.
  - **[Neon](https://neon.tech)**: 0.5 GB free serverless Postgres, instant setup.
  - **[Supabase](https://supabase.com)**: 500 MB free Postgres.

To use Postgres (Neon / Supabase):
1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
2. Add your database connection string to Vercel Environment Variables:
   ```env
   DATABASE_URL="postgresql://user:password@ep-host.neon.tech/neondb?sslmode=require"
   ```
3. Run `npx prisma db push` or let Vercel build run `prisma generate`.

---

## 🔑 Environment Variables Reference

Create a `.env` file locally (or add to Vercel Project Settings):

```env
# Database connection string (default: SQLite)
DATABASE_URL="file:./dev.db"

# Optional subpath base (default: /secretSanta)
NEXT_PUBLIC_BASE_PATH="/secretSanta"

# Optional: Resend API key for real email delivery (resend.com - 3000 free emails/mo)
# If omitted, emails are safely logged to the server console with festive ASCII art!
RESEND_API_KEY=""
RESEND_FROM_EMAIL="Secret Santa <onboarding@resend.dev>"

# Optional: Google Gemini API key for Santa AI rhymes and gift suggestions
# If omitted, intelligent offline holiday fallback templates are used automatically!
GEMINI_API_KEY=""
```

---

## 🧪 Testing & Verification

Run the full automated test suite (74 security, derangement, privacy, and state machine tests):

```bash
npm test
```

Run production build check:

```bash
npm run build
```
