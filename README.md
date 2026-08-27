# Almalyani

The future of Moroccan architecture starts here. A modern platform designed
to simplify and improve the daily work of Moroccan architects.

This phase ships infrastructure only: a Coming Soon page, deployed to a free
`*.vercel.app` domain, with a Neon Postgres database wired up (unused for now)
for the next phase.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS)
- [Vercel](https://vercel.com) — hosting, CI/CD, preview deployments, HTTPS
- [Neon](https://neon.tech) — serverless Postgres (free tier)
- [Drizzle ORM](https://orm.drizzle.team) + drizzle-kit — schema & migrations

## Local development

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL from the Neon console
npm run dev
```

## Database

Schema lives in `db/schema.ts`. After changing it:

```bash
npm run db:generate   # generate a migration
npm run db:migrate     # apply it
```

## Deployment

Pushes to `main` deploy to production automatically via Vercel's GitHub
integration. Every other branch/PR gets its own preview deployment.

| Environment | Branch    | DATABASE_URL points at        |
| ----------- | --------- | ------------------------------ |
| Development | local     | your own `.env.local`          |
| Preview     | any PR    | Neon preview branch (per PR)   |
| Production  | `main`    | Neon production branch         |

## Not yet built

Authentication, dashboard, project/client management, billing, AI — this is
intentionally infrastructure-only. See the project roadmap for what's next.

&copy; 2026 Almalyani
