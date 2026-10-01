# NexagrowthCRM

An all-in-one CRM workspace — pipeline, contacts, companies, tasks, activity
timeline, an integrations marketplace (Slack, WhatsApp, Stripe, Shopify,
Microsoft 365), inbound/outbound webhooks and a Stripe payments desk.
Currency is Nigerian Naira (₦) throughout.

**Stack:** Next.js 16 (App Router) · PostgreSQL + Drizzle ORM · Tailwind CSS v4 ·
Firebase Authentication · Vercel.

---

## Deploying to Vercel

### 1. Connect a Postgres database (required)

The deployed site needs its own hosted database — a local development
database is not reachable from Vercel. Without one, a production build is
refused with a clear message.

Easiest path: **Vercel → your project → Storage → Create Database → Neon**
(free tier), and connect it to the project. Vercel injects `DATABASE_URL` /
`POSTGRES_URL` automatically, and the app accepts either, so nothing needs
renaming. Supabase works too (use the pooled **Transaction** string).

Then **redeploy**. The build pushes the schema, so every table is created on
the first deploy.

### 2. Import the repo

```bash
npm i -g vercel
vercel link          # connect the local folder to a Vercel project
```

Or push to GitHub and click **Add New → Project** in the Vercel dashboard.
`vercel.json` already declares the framework, build command, region and
function limits, so no manual build settings are needed.

### 3. Add environment variables

In **Vercel → Settings → Environment Variables**, add the keys from
[`.env.example`](./.env.example) for *Production*, *Preview* and *Development*:

```
DATABASE_URL
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

Pull them locally any time with `vercel env pull .env.local`.

### 4. Deploy

```bash
vercel          # preview deployment
vercel --prod   # production deployment
```

The build runs `scripts/vercel-build.mjs`, which pushes the Drizzle schema to
`DATABASE_URL` and then runs `next build`. A schema-push failure is logged but
does not abort the deploy — check `/api/deploy/status` afterwards.

### 5. Authorise the domain in Firebase

**Firebase console → Authentication → Settings → Authorized domains** → add
your `*.vercel.app` domain and any custom domain. Then under **Sign-in method**
enable **Email/Password** and **Google**. Without this, sign-in fails with
`auth/unauthorized-domain` or `auth/operation-not-allowed`.

### 6. Verify the release

```bash
curl https://<your-domain>/api/health
curl https://<your-domain>/api/deploy/status
```

`/api/deploy/status` returns `200` when every environment variable is present,
the database is reachable and all expected tables exist — otherwise `503` with
the specific problem. The same report renders at **/app/crm/deployment**.

---

## What is configured for Vercel

- **Serverless connection pooling** — `src/db/index.ts` caches one pool per warm
  lambda (`max: 1` on Vercel), enables TLS for hosted providers, and initialises
  lazily so a missing `DATABASE_URL` never breaks the build.
- **`vercel.json`** — `cdg1` region (lowest latency to Lagos), 30 s / 1 GB API
  functions, security headers, `no-store` on `/api/*`, plus `/app` → `/app/crm`
  and `/sign-in` → `/login` redirects.
- **Vercel Analytics + Speed Insights** mounted in the root layout.
- **`robots.ts` / `sitemap.ts`** — preview deployments are `noindex`, production
  is indexable with `/app`, `/api` and `/pay` excluded.
- **`serverExternalPackages: ["pg"]`** keeps the native driver out of the bundle.

---

## Local development

```bash
npm install
cp .env.example .env.local     # adjust DATABASE_URL if needed
npx drizzle-kit push           # create the schema
npm run dev
```

Demo data (companies, contacts, deals, tasks, activities, Stripe records) seeds
itself on first request, so the workspace is never empty.

| Route                        | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| `/`                          | Marketing site                           |
| `/pricing` · `/integrations` | Plans and the integrations overview      |
| `/login` · `/signup`         | Firebase auth                            |
| `/app/crm`                   | Dashboard (auth required)                |
| `/app/crm/deployment`        | Deployment health                        |
| `/api/health`                | Liveness probe                           |
| `/api/deploy/status`         | Readiness probe                          |
