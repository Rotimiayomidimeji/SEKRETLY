# SEKRETLY

Say it. Stay unknown.

SEKRETLY is a mobile-first anonymous social interaction platform foundation built with Next.js App Router, TypeScript, Tailwind CSS, Motion, Prisma, Auth.js architecture, Zod, React Hook Form, and optional React Three Fiber infrastructure.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Open http://localhost:3000.

## Environment

`DATABASE_URL` is the PostgreSQL connection string used by Prisma. `AUTH_SECRET` should be a long random value before authentication is enabled. `NEXT_PUBLIC_APP_URL` defaults to `http://localhost:3000`.

## Commands

```bash
npm run lint
npm run typecheck
npm run build
npx prisma generate
npx prisma migrate dev --name init
```

## Foundation map

- `app/`: public marketing routes, auth/app route boundaries, profile routes, and API resource boundaries.
- `components/`: homepage experience plus reusable UI, brand, layout, navigation, and ad surfaces.
- `config/`: site, navigation, and reusable interaction type configuration.
- `features/`: reserved feature-module boundary for domain services and actions as Phase 2 work begins.
- `lib/`: database, Auth.js, environment validation, rate limiting, analytics, and shared utilities.
- `prisma/`: initial PostgreSQL schema for users, profiles, interactions, messages, replies, moderation, notifications, and analytics.
- `types/`: shared interaction, profile, message, and analytics contracts.

## Phase 1.2

The public homepage at `/` is a mobile-first social experience with expressive typography, saturated interaction worlds, swipeable curiosity cards, an interactive anonymous message demo, a share-studio preview, reveal interaction, mixed explore feed, safety story, and responsive navigation.

Future screens are intentionally foundation surfaces until auth, persistence, moderation, and real content workflows are connected.

## Phase 2

Connect PostgreSQL and migrations, configure Auth.js providers, implement onboarding and the reusable interaction composer, persist anonymous messages without sender identities, add moderation/reporting actions, build the inbox and public discovery feeds, and connect typed analytics events to durable storage.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
