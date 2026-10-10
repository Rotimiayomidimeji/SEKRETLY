

# SEKRETLY — Implementation Package 01: Authentication

## What this package changes

- Replaces the placeholder `/login` and `/signup` screens with responsive authentication pages.
- Adds Google OAuth and verified email/password login.
- Adds email verification, password reset, and protected `(app)` routes.
- Extends your EXISTING Prisma schema without removing interaction, message, report, or analytics models.
- Preserves the current public homepage and all its assets/styles.

## Important limitations

This is a **source integration package**, not a tested live deployment. Google OAuth, database migrations, and email delivery need your own credentials and a real database. There is no claim that the full app is complete. Rate limiting, account lockouts, session revocation, and abuse monitoring need hardening before public launch. Password reset does not invalidate already issued JWT sessions. Google accounts using an email already registered by password are intentionally not auto-linked; an explicit secure linking flow is future work. Email send failure may leave an unverified account: an operational resend workflow is needed. Do not enable public registration until these operational protections are added and tested.

## Install (Windows PowerShell)

1. Make a backup or create a local feature branch: `git checkout -b feature/sekretly-auth`.
2. Copy the folders from this ZIP into the root of your existing SEKRETLY project, preserving paths. Do **not** delete your existing folders. Replace only matching files.
3. Run `npm install bcryptjs` and `npm install -D @types/bcryptjs`.
4. Copy `.env.example` values into your local `.env.local` and fill them with real secrets. Keep `.env.local` out of Git.
5. Run `npx prisma migrate dev --name auth_accounts_email_tokens` against a **development database**, then `npx prisma generate`.
6. Run `npm run typecheck`, `npm run lint`, and `npm run build`. Resolve any environment or integration errors before proceeding.
7. Run `npm run dev` and open `/signup`, `/login`, `/forgot-password`.

## Google Cloud configuration

Create a Google OAuth **Web application** client. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs for local development, and `https://sekretlyy.vercel.app/api/auth/callback/google` for production. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`. The OAuth consent screen must be configured and test users added while in testing mode. Use `https://sekretlyy.vercel.app` as your production `NEXT_PUBLIC_APP_URL`.

## Email provider

Verify a sending domain with Resend and configure `RESEND_API_KEY` and `AUTH_EMAIL_FROM`. A test-only Resend sender may not deliver to arbitrary addresses. This package intentionally does not display verification or reset links in the browser or logs.

## Before public launch — required security work

- Distributed rate limits (e.g. Redis/Upstash) on register, login, forgot password, verification, and OAuth entry points.
- Bot and abuse controls, mail-send quotas, and alerting.
- Improve signup enumeration resistance and implement verification-email resend.
- Invalidate sessions after password reset and sensitive account changes.
- Secure account linking, email change, deletion, and support flows.
- Production migration review and rollback/backup strategy.
- Automated integration tests for Google, credentials, mail delivery, and token replay.

## Existing behavior intentionally unchanged

The marketing homepage, interactions, messages, Explore, Share Studio, and admin have not been implemented in this package. They remain the next milestones. The `(app)` layout now redirects unauthenticated visitors to `/login`.

## Push only after local verification

`git add .`
`git commit -m "Add SEKRETLY auth foundation"`
`git push -u origin feature/sekretly-auth`

Then open a pull request. Do not merge into `main` until your development database and authentication flows pass testing.
