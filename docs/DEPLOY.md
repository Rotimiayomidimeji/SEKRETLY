# Running Sekretly on Vercel

Your code already deploys from GitHub. This guide connects the four things that make it work: a database,
storage for photos and videos, the secret keys, and the admin account. Do the steps in order. The first
time takes about 30 minutes.

Each build runs `prisma generate && prisma migrate deploy && next build` (see `package.json`). Once the
database is connected, every deploy creates or updates the tables for you. You never run migrations by hand.

---

## Step 1: Check the project settings

Vercel dashboard → your **sekretly** project → **Settings**.

1. **Build and Deployment**
   - Framework Preset: **Next.js**
   - Build Command: leave it **empty or default**. If you typed a custom command earlier, remove it, or the migrations won't run.
   - Install Command and Output Directory: leave them on default.
   - Node.js Version: **22.x** (or newer).
2. **Functions** → **Function Region** → pick **London, UK (lhr1)**. Vercel's default is Washington, USA. London is much closer to Nigeria, and the database in Step 2 will be in London too. Save.

## Step 2: Create the database (Neon Postgres, free)

1. Open the project → **Storage** tab → **Create Database**.
2. Choose **Neon** (Serverless Postgres) → **Continue**. Accept the Neon terms if asked; it uses your Vercel login.
3. Settings:
   - Region: **AWS Europe West 2 (London)**. It must be the same area as the Function Region.
   - Plan: **Free**
   - Name: `sekretly-db`
4. **Create**. When it asks which project and environments to connect:
   - Project: **sekretly**
   - Environments: tick **Development, Preview and Production**
   - **Environment variable prefix: leave it empty.** The code expects the exact names `DATABASE_URL` and `DATABASE_URL_UNPOOLED`. A prefix breaks the build.
5. **Connect**.

Check it: **Settings → Environment Variables**. You should now see `DATABASE_URL` and `DATABASE_URL_UNPOOLED` (plus a few `PG…` and `POSTGRES_…` ones, which you can ignore).

> `DATABASE_URL` is the pooled address the app uses. `DATABASE_URL_UNPOOLED` is the direct address migrations need.
> Leave both exactly as Neon created them.

## Step 3: Create the media storage (Vercel Blob)

Without this step, photo and video uploads fail on Vercel.

1. Project → **Storage** → **Create Database** → **Blob** → **Continue**.
2. Name: `sekretly-media`. Region: **London** if offered. **Create**.
3. Connect it to **sekretly**, with all three environments ticked and **no prefix**.

Check it: Environment Variables now shows `BLOB_READ_WRITE_TOKEN`.

Photos up to 4 MB go through the app. Anything bigger (photos up to 8 MB, videos up to 25 MB) goes straight
from the phone to Blob and is checked afterwards. That's automatic, so there's nothing to set up.

## Step 4: Add the secret keys

Project → **Settings → Environment Variables**. For each variable, type the **Key** and the **Value** and tick
**Production, Preview and Development**, then click **Save**.

| Key | Value | Where it comes from |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://sekretlyy.vercel.app` | your domain, with no slash at the end |
| `AUTH_SECRET` | a long random string | generator below |
| `CRON_SECRET` | a different long random string | generator below |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | push public key | copy from your `.env.local` |
| `VAPID_PRIVATE_KEY` | push private key | copy from your `.env.local`. **Mark it Sensitive** |
| `VAPID_SUBJECT` | `mailto:` + your email | copy from your `.env.local` |
| `RESEND_API_KEY` | optional, see Step 7 | resend.com |
| `NEXT_PUBLIC_POSTHOG_KEY` | optional, product analytics | posthog.com → Project settings |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://eu.i.posthog.com` | only if you use PostHog |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-…` | later, once AdSense approves the site |

**Making random strings.** In a terminal in the project folder, run this twice and use one result for each secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Push keys.** Open `.env.local` in VS Code and copy the three VAPID values exactly. Using the same keys
locally and live is fine. If you'd rather have new ones, run `npx web-push generate-vapid-keys`. Never
share the private key, and don't change it after launch: changing it silently cuts everyone off from push.

> Anything starting with `NEXT_PUBLIC_` is built into the page. After adding or changing one, you **must redeploy** (Step 5).

## Step 5: Deploy

1. Project → **Deployments** → the newest one → **⋯** → **Redeploy** → **Redeploy**. Or just push a commit.
2. Open the build log while it runs. Near the top you should see:
   ```
   10 migrations found in prisma/migrations
   Applying migration `20261022152831_accounts`
   …
   All migrations have been successfully applied.
   ```
   then `✓ Compiled successfully` and, at the end, **Ready**.

If it fails, see **Troubleshooting** at the bottom.

## Step 6: Create your admin account on the live database

The `sekretly_hq` account you've used so far lives only in your local database. The live database starts
empty, so create the admin there once.

1. Copy the live direct database address: Vercel → **Settings → Environment Variables** → `DATABASE_URL_UNPOOLED` → click the eye icon → copy.
   (Or Vercel → **Storage** → `sekretly-db` → **Open in Neon** → **Connect** → turn off "Connection pooling" → copy.)
2. In VS Code, open a **new** PowerShell terminal in the project folder and run, pasting your address between the quotes:
   ```powershell
   $env:DATABASE_URL = "postgresql://...paste here..."
   node scripts/create-admin.mjs --email you@example.com
   ```
   Use your real email after `--email`. That's where password-reset codes go.
3. It prints the username (`sekretly_hq`) and a new 20-character password **once**. Save it in a password manager.
4. **Close that terminal** (bin icon), so it can't touch the live database by accident. New terminals use your local database again.

Log in at `https://sekretlyy.vercel.app/login` with `sekretly_hq` and that password. It goes straight to **/admin**.
You can change the password at **/admin/account**.

To make another existing live account an admin, set the same `$env:DATABASE_URL` and run
`node scripts/make-admin.mjs <username>`.

## Step 7 (optional): Emails for password resets

Without `RESEND_API_KEY`, live password-reset codes go nowhere. On your computer they're printed in the terminal.

1. Sign up at **resend.com** with the same email you gave the admin account.
2. **API Keys** → **Create API Key** (Sending access) → copy → add it as `RESEND_API_KEY` in Vercel (Step 4) → redeploy.
3. Until you own a domain and verify it in Resend, Resend only delivers to **your own** signup email. That's enough
   to reset the admin password. Members' reset codes start arriving once you add a custom domain (e.g.
   `sekretly.ng`) in Resend → **Domains** and set `EMAIL_FROM` to `Sekretly <no-reply@sekretly.ng>`.

## Step 8: Check that everything works (10 minutes)

Use your phone and one other browser (or an incognito window).

- [ ] Open the site → **Sign up** → you land on onboarding, then Home.
- [ ] **Create a link** (Confessions) → copy it → open it in incognito → send a message → it appears in your inbox, and the inbox count goes up.
- [ ] From incognito, attach a **photo** and a **video bigger than 5 MB** → both send and play in your inbox.
- [ ] **Push:** on your phone, go to **Settings → Notifications** → turn on and allow → send yourself another anonymous message from the other browser → a notification arrives.
  - Android: Chrome works directly.
  - iPhone: push only works after **Share → Add to Home Screen** (iOS 16.4+), then opening Sekretly from that icon.
- [ ] **Games:** create a room on one device and join with the code on another → play one round.
- [ ] **Admin:** log in as `sekretly_hq` → Reports, Users, Traffic all load. Traffic now shows real countries, because Vercel supplies the location.
- [ ] **Crons:** Settings → **Cron Jobs** lists `streak`, `drop` and `wrap`. Click **Run** on `drop` → the log shows `{"job":"drop","sent":…}`.

## How the scheduled pushes run

The schedules are in `vercel.json` and use UTC times:

| Job | Schedule | Lagos time |
|---|---|---|
| streak reminder | `0 16 * * *` | 5pm daily |
| new drop | `0 18 * * *` | 7pm daily |
| weekly wrap | `0 17 * * 0` | 6pm Sundays |

On the free **Hobby** plan, each job runs once a day **sometime within that hour** (e.g. 5:00–5:59pm),
not on the dot. The Pro plan runs them on time.

## Plan notes

- **Hobby (free)** is fine for the beta. Vercel limits it to non-commercial use, so move to **Pro** before you switch on paid ads (Admin → Ads).
- The **Neon free** plan sleeps after a few minutes with no traffic, so the first visit after a quiet spell takes about a second longer. Nothing is lost.
- **Preview deployments** (branches other than `main`) use the same live database and run migrations on it. Keep all changes going through `main`, or turn on Neon's "Preview branching" in the Neon integration settings to give each preview its own copy.

## Local development afterwards

Nothing changes: `npm run dev` uses your local Postgres from `.env` / `.env.local`. Both files now have
`DATABASE_URL_UNPOOLED` set to the same local address, because the schema needs it. On a fresh copy of the
project, copy `.env.example` to `.env.local` and fill it in.

## Troubleshooting

| You see | Fix |
|---|---|
| Build: `Environment variable not found: DATABASE_URL_UNPOOLED` | The database isn't connected to that environment, or it was given a prefix. Storage → `sekretly-db` → Projects → reconnect with all environments and **no prefix**. Redeploy. |
| Build: `P1001: Can't reach database server` | Check the address wasn't edited. On the Neon dashboard, make sure the project isn't suspended or over the free limit. Redeploy. |
| Build: `P3009 migrate found failed migrations` | A deploy stopped halfway. Message me with the build log; it's fixable without losing data. |
| Site shows "Application error" after deploying | Vercel → **Logs**. It's almost always a missing environment variable from Step 4. |
| Uploads say "Uploads aren't set up" | Blob isn't connected (Step 3). Connect it, then redeploy. |
| Small photos send but big videos fail | Make sure `BLOB_READ_WRITE_TOKEN` is set for Production, and that a mobile data saver isn't blocking the upload. |
| No push notifications | The VAPID keys must be in **Production**, and you must have redeployed afterwards. On iPhone, add to Home Screen first. Check the phone isn't in quiet hours (11pm–7am Lagos). |
| Admin login says wrong password | You probably ran `create-admin` against your local database. Redo Step 6 with the **live** address. |
| Admin password lost | `/forgot-password` sends a code to the email from `--email` (needs Step 7). Or rerun Step 6, which sets a new password. |
