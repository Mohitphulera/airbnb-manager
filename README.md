# StayDesk — Airbnb / rental property manager

Multi-tenant property management for independent hosts: bookings, guest requests,
calendar, expenses, invoices, guest CRM, feedback, inventory, staff tasks and a
public direct-booking page per host at `/<your-slug>`.

Built with Next.js 16 (App Router), Prisma 7 + PostgreSQL (Neon in production),
NextAuth v5 (credentials) and Cloudinary for image uploads.

## Local development

Requirements: Node 20+, a local PostgreSQL.

```bash
npm install
createdb airbnb_manager_dev
```

Create `.env` (git-ignored):

```bash
DATABASE_URL="postgresql://<user>@localhost:5432/airbnb_manager_dev"
AUTH_SECRET="<output of: npx auth secret>"
# Optional — only needed for image uploads
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

```bash
npx prisma db push   # create tables
npm run seed         # demo data: demo@staydesk.dev / demo1234
npm run dev
```

`src/lib/prisma.ts` uses the Neon HTTP adapter when `DATABASE_URL` points at
`neon.tech`, and the standard `pg` driver for any other Postgres. The seed script
refuses to run against a Neon URL unless `ALLOW_SEED_REMOTE=1` is set.

The seed creates two hosts (`demo@…` and `other@…`) so you can check that one
host never sees another host's data.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Production (Vercel)

Required environment variables: `DATABASE_URL`, `AUTH_SECRET` (the app refuses to
start in production without it), and the three Cloudinary variables above.
