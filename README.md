# SJ Fresh Hub

Mobile-first vegetable and fruit delivery for approved residential buildings. Customers and admins sign in with a mobile number and password. Cash on Delivery only in v1.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL, Auth, Storage, Realtime), Zod, Zustand, Vitest, Playwright.

## Local setup

1. Copy `.env.example` to `.env.local` and add your Supabase URL, anon key, and **server-only** service role key.
2. Create a free Supabase project.
3. In the SQL editor, run the files in `supabase/migrations/` in timestamp order.
4. Run `supabase/seed.sql` for development buildings, categories, and products.
5. Provision the first admin using `supabase/provision_admin.sql` (never commit credentials).
6. Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests |
| `npm run test:e2e` | Playwright (install browsers first) |
| `npm run build` | Production build |

## Important

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` as `NEXT_PUBLIC_*`.
- Customers cannot assign their own role. Admin is provisioned in the database.
- Shop coordinates in `settings` are placeholders until the owner confirms the real location.
- Hosting must permit commercial use on the chosen plan. Vercel Hobby is not assumed.

Project requirements live in `docs/`.
