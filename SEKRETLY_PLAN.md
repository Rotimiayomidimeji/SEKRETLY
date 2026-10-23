# Sekretly — Product & Build Plan (v1)

> Anonymous messaging + disappearing chats + live party games.
> NGL's anonymity, Snapchat's disappearing messages, and games no one else has.

**Status:** Draft v1 · 18 Oct 2026
**Owners:** You (product) + Claude (build)
**Target:** Class-group beta by **31 Oct 2026**, public launch after retention check

Items marked **[ASSUMED]** are my defaults where you haven't answered yet. Change any of them by telling me the section number.

---

## Contents

1. Product summary
2. Users, accounts & profiles
3. Anonymous links (the core loop)
4. Inbox, chats & disappearing messages
5. Games (Never Have I Ever, Truth or Dare, game listing)
6. Safety & moderation
7. Hints & premium (planned, not in first release)
8. Look & feel
9. Notifications
10. Settings
11. Admin dashboard & analytics
12. Ads (AdSense-ready, switched off)
13. Tech stack & architecture
14. Data model
15. Build timeline
16. Risks & legal
17. Open questions
18. Appendix: draft screen list

---

## 1. Product summary

|                                   |                                                                                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Name**                    | Sekretly (logo coming from your friend; a logo slot is reserved everywhere)                                                                                                    |
| **Platform**                | Web app, designed for phones first. Installable as a PWA (add to home screen). Native apps later.                                                                              |
| **Audience**                | 16+, Nigeria first, open to all countries                                                                                                                                      |
| **Business model**          | Free core + Google AdSense (built in, off at launch) + Premium hints later                                                                                                     |
| **What makes it different** | 1. Themed topic links with ready-made words and sentences · 2. Anonymous two-way chat between registered users · 3. Disappearing messages · 4. Live multiplayer party games |

**Core loop:**

1. Create a link
2. Share it to WhatsApp, Instagram or Snapchat
3. Friends send anonymous messages
4. The owner gets a notification and reads the message
5. The owner shares the reply to their story
6. New people see the story, visit, and create their own link

---

## 2. Users, accounts & profiles

### 2.1 Who can do what

| Action                                    | Visitor (no account) | Registered user |
| ----------------------------------------- | -------------------- | --------------- |
| Open a link and send an anonymous message | ✅                   | ✅              |
| Chat back and forth (two-sided)           | ❌ one message only  | ✅              |
| Create links                              | ❌                   | ✅              |
| Join or create games                      | ❌ asked to sign up  | ✅              |
| Receive notifications                     | ❌                   | ✅              |

### 2.2 Sign up / log in

- Sign-up fields:
  - **Username**: unique, 3–20 characters, letters, numbers and `_`
  - **Password**: at least 8 characters
  - **Date of birth**: must be 16 or older
  - **Accept terms**: checkbox
- **[RECOMMENDED]** Optional recovery email, used only to reset a forgotten password. Without it, anyone who forgets their password loses the account for good.
- Rate limits on login and sign-up to stop bots and password guessing.

### 2.3 Profile

- Fields: username, avatar, bio (up to 150 characters).
- **Private by default.** The user can switch it to public in Settings.
- **Default avatar:** a colourful, gender-neutral 3D animal on a gradient background. Chosen at random at sign-up, and the user can change it. It's never plain grey.
- Public profiles show the avatar, bio and active links. They never show message history.

---

## 3. Anonymous links (the core loop)

### 3.1 Creating a link (registered user)

1. Tap **Create Link**.
2. **Pick a theme**: the 🎨 paint button opens the theme picker. 5 themes at launch, plus a default theme.
3. **Pick a topic card**, for example:

   - "What do you think of me?"
   - "Describe me in 3 words"
   - "Confess something"
   - "Rate me 1–10"
   - "Ask me anything"

   Or pick **Custom topic** and type your own question. A custom topic gets a theme only, with no ready-made suggestions.
4. Optional **link limits**:

   - stop after X messages, or (undecided)
   - stop after X hours or days
5. Tap **Create**. The app shows the shareable link, plus a share card image for stories.

### 3.2 Link address structure

```
sekretly.com/{username}/{sessionId}/{themeId}/{topicId}
example: sekretly.com/peach/k7x2m9/sunset/describe-3
```

- `sessionId` is a random 6-character code. It's the "master key" for all of the user's links.
- `themeId` and `topicId` tell the page which design and topic to show.
- Custom topics use a short code, for example `/c-8fj2`.

### 3.3 What the visitor sees

1. The link opens in the owner's chosen theme with the topic card at the top, for example "Describe me in 3 words."
2. **Suggestion strip**: a sideways-scrolling row of words such as *Sweet · Gentle · Funny · Loyal…*
3. Tap a word and the app fills the box with a matching ready-made sentence, for example *"You're honestly the sweetest person I've ever met."*
   - Tap the same word again to cycle to the next sentence.
   - The visitor can edit the sentence or type their own. **[ASSUMED, see question a]**
4. **Send.** A short notice under the button says: *"Your message is anonymous. Approximate info (like country and device type) may be used for stats and hints."* This notice is legally required (see §16).
5. After sending: *"Sent! 🎉 Want your own link?"* with a sign-up button. This screen is the main source of new users.  can also see the send another message button 

### 3.4 Word and sentence bank

- Everything is written in advance and stored in the database. Nothing is generated live by AI, so it's fast and free to run.
- Structure: **topic → words → sentences**.
- Long-term goal: about 50 words per topic and about 50 sentences per word.
- **At launch:** 10 topics × 20 words × 5 sentences = **1,000 sentences**. Claude writes the first set; you review the tone and slang.
- Admins can add or edit words and sentences in the dashboard (§11), with no code change.
- To avoid repeats, the app shuffles the sentence order for each visitor.

### 3.5 Pause, resume and reset

| State                       | What visitors see                                                                                                      | How it happens                                                                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Active**            | The send page                                                                                                          | Default                                                                                                                                                             |
| **Paused / expired**  | A friendly page: *"This link is taking a nap 😴. Make your own Sekretly link while you wait!"* with a sign-up button | The time limit or message cap is reached, or the owner pauses it **[ASSUMED, see question c]**                                                                |
| **Resumed**           | Works again at the **same address**                                                                              | The owner taps **Resume links**                                                                                                                               |
| **Reset** (permanent) | *"This link no longer exists"* plus a sign-up button                                                                 | The owner taps **Reset all links**. The app makes a new `sessionId`, so every old link stops working for good. A confirmation step guards against mistakes. |

---

## 4. Inbox, chats & disappearing messages

### 4.1 Message types

- **One-way message:** from a visitor with no account. The owner can read it and share it as an image, but can't reply.
- **Two-way chat:** from a registered user. Either side can reply back and forth, and **both stay anonymous to each other forever.**

### 4.2 Anonymity rules

- Neither side ever sees a username, number, avatar or tag that identifies the other person.
- The system privately records which account or device sent each message. It uses this only to route replies and to handle reports and blocks.
- **[ASSUMED, see question f]** In the inbox, each anonymous chat appears as its own thread with a random emoji and colour, for example 🦊 or 🌙. It's changed for each thread and carries no identity. It only stops the owner from mixing up threads.

### 4.3 Inbox

- A list of new and unread messages and chats, grouped by link and topic.
- Tap a message to open it in its theme design.
- **Share as image:** creates a story-sized (9:16) image with the question, the answer and the Sekretly logo, for Instagram, Snapchat or WhatsApp Status.

### 4.4 Disappearing messages

- Users set two timers in Settings:
  - **Inbox messages** (one-way): how long they stay in the list.
  - **Chat messages** (inside two-way chats): how long each message stays after it's sent. **[ASSUMED, see question d]**
- **Default 1 day · minimum 1 day · maximum 3 weeks.**
- When a message expires it's deleted from the database by a job that runs every hour. Inside a chat, expired messages leave a blank placeholder that reads *"Message disappeared."*
- Reports keep a copy of the reported message for 30 days for moderation, even after it disappears for the user (see §6).

---

## 5. Games

### 5.1 Shared game system

**Creating a game**

1. Registered user taps **Create Game**.
2. Picks a game.
3. Sets the options:
   - number of players, within that game's minimum and maximum
   - who can join: **link only**, **game listing only**, or **both**
   - game name, which is public. The creator's username is **never** shown.
4. A **temporary group (lobby)** is created with an expiry time (default 2 hours **[ASSUMED]**).
5. Everyone in the group gets a random **game nickname**, such as *MangoMoon* or *BlueFox*, plus a colour. Nicknames exist only inside that game.

**Joining**

- Through the shared link, or by tapping a game in the in-app **Game listing**.
- An account is required. Visitors without one go to sign-up, then straight back into the game.
- When a player joins, a pop-up shows the game rules and what kinds of questions are allowed.
- The lobby shows how many have joined against the number needed, for example **"2/4 joined, waiting…"**. The game starts once the minimum is reached and the creator taps Start, or on its own when the group is full.

**Game listing (in-app)**

- Shows open games that still have free places: game name, game type, players joined vs. maximum, and time left.
- No creator identity is shown.
- Games disappear from the list when they're full, started (unless they allow joining late), or expired.

### 5.2 Game 1: Never Have I Ever

| Setting               | Value                                                         |
| --------------------- | ------------------------------------------------------------- |
| Players               | Minimum 3, maximum 10 **[ASSUMED maximum]**             |
| Set up by the creator | The first statement, an optional house rule, and player count |
| Lives                 | 3 per player **[ASSUMED]**                              |

**How a round works**

1. The current player writes or picks a statement, for example *"Never have I ever lied to get out of class."* A question bank is offered for ideas.
2. Every other player taps **"I have 🙋"** or **"Never 🙅"** within 20 seconds.
3. Each player who taps "I have" loses a life. Results show by nickname.
4. The turn passes to the next player.
5. The last player with lives left wins, or the player with the most lives when the game timer ends.

Statements go through the banned-word filter (§6).

### 5.3 Game 2: Truth or Dare

| Setting           | Value                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| Players           | Minimum 2, maximum **4**                                                                   |
| Categories        | e.g. Chill, Funny, Spicy (no explicit content), Friends, Couples, Party **[ASSUMED list]** |
| Situation filters | Indoors / Outdoors · Day / Night. Only dares that make sense for the selection are drawn.       |
| Question bank     | 70–100 truths and 70–100 dares per category, all fun, none repeated within a game              |

**How a turn works**

1. It's a player's turn, shown by their colour or character. They pick **Truth** or **Dare**. The app draws one at random from the bank, filtered by category and situation.
2. They have **20 seconds** to tap **Accept**. If they don't:

   - a **5-second "Skipping…"** countdown runs, then
   - the turn passes to the next player, and
   - a player who doesn't respond for 2 turns in a row is removed.
3. After accepting, the evidence timer runs: 60–120 seconds depending on the task.

   - **Truth:** a typed answer.
   - **Dare:** a photo or a short video, up to 15 seconds.

   The player taps **Done**.
4. The other players **vote**: ✅ Done / ❌ Fake. The majority decides.
5. **If the majority votes Fake:**

   - one retry with **60 seconds**
   - if that's voted Fake again, or there's no evidence, the turn is skipped and the player gets a **strike**
   - a second strike brings a **warning**
   - a third strike **removes them from the game**
6. Evidence photos and videos are deleted when the game ends.

**Ties:** with 4 players, 3 vote. With 2 players, 1 votes, so that vote decides. With an even number of voters, a tie counts as **pass** (benefit of the doubt).

### 5.4 Future games (built for, not in the first release)

The game system is designed so new games plug in without rebuilding it. Ideas:

- Would You Rather
- Most Likely To
- Hot Takes
- Anonymous Polls

---

## 6. Safety & moderation

| Feature                         | How it works                                                                                                                                                                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Global banned list**    | Admin-managed list (§11). If a message contains a banned word, it **won't send**, and the box shows *"This message breaks our rules"* next to the word. Catches common tricks: l33t letters, spaces between letters, repeated letters. |
| **Personal hidden words** | Each user adds their own words in Settings. Messages containing them still arrive but are **hidden behind a "Hidden message — tap to reveal" cover**.                                                                                    |
| **Reporting**             | Report button on every message, chat and game player. Reasons: harassment, hate, sexual content, threats, spam, self-harm.                                                                                                                      |
| **Automatic strikes**     | Each confirmed report is one strike against the sender's account or device. **3 strikes = blocked.** Strikes expire after 90 days **[ASSUMED]**.                                                                                    |
| **Silent block**          | A blocked sender sees messages as "sent", but they never arrive.                                                                                                                                                                                |
| **Self-harm safety**      | Messages mentioning self-harm show a support resource line (Nigeria help-line) to the receiver.                                                                                                                                                 |
| **Image and video check** | **[ASSUMED, see question h]** Automatic nudity check on every upload in Truth or Dare. Uploads that fail are blocked and count as a strike.                                                                                               |
| **Age gate**              | Date of birth required at sign-up; under-16s are blocked.                                                                                                                                                                                       |
| **Rate limits**           | e.g. no more than 10 messages a minute per visitor to any one link, to stop spam floods.                                                                                                                                                        |

**Note on fully automatic reporting:** false reports can be used to get innocent people blocked. To make that harder:

- only reports from **different** accounts count toward the 3 strikes
- an admin review queue in the dashboard lets you undo wrong blocks

---

## 7. Hints & premium (planned, not in the first release)

The data is collected from the first day so stats work immediately. The paid hint menu comes after the first release.

**The 7 hint types:**

| # | Hint                          | Example                      |
| - | ----------------------------- | ---------------------------- |
| 1 | Country                       | Nigeria 🇳🇬                 |
| 2 | State or region (approximate) | Lagos                        |
| 3 | Device type                   | Mobile / Tablet / Desktop    |
| 4 | Phone system                  | Android / iPhone             |
| 5 | Browser                       | Chrome / Safari / Opera Mini |
| 6 | Mobile network                | MTN / Airtel / Glo / 9mobile |
| 7 | Time sent (their local time)  | Late night, 11:42 pm         |

**Plans (to be finalised later):**

- **Free:** no hints.
- **Premium:** pick 2 of the 7 per message.
- **Exclusive Premium:** pick 6 of the 7.

**Rules:**

- Hints must be **real and never invented**. NGL paid a $5M settlement in 2024 over fake hints.
- Never show a precise location.
- State or region shows only when the location lookup is confident, and is always labelled "approximate". Nigerian mobile traffic often routes through Lagos or Abuja.
- Payments (Paystack or Flutterwave) come with the premium phase.

---

## 8. Look & feel

- **Feel:** Snapchat's disappearing messages + NGL's anonymity and fun + game energy.
- **Phone-first.** Designed at 360–430px wide. On desktop it shows as a centred phone-width column.
- **Light and dark mode.** Follows the phone's setting, with a manual switch.
- **3D emojis and avatars:** Microsoft **Fluent Emoji 3D** (free to use, MIT licence) as the main set, plus Google **Noto animated emoji** for animations. **Apple emoji images can't legally be bundled into an app** (Apple's licence), but Fluent 3D looks very similar. Three.js for animated 3D avatars later.
- **Themes at launch (5 + default):** e.g. Default (Sekretly brand), Sunset, Midnight, Bubblegum, Neon, Ocean. Each theme sets:
  - background gradient
  - card style
  - font accent
  - emoji set
- **Animations:** confetti on send, a fade effect when a message disappears, a countdown ring in games.
- **Logo:** placeholder until your friend delivers. It sits in a single file, so swapping it updates everywhere.

---

## 9. Notifications

- **In-app:** a bell with an unread count, plus a notifications page. Tapping a notification goes straight to the message or game.
- **Push:** browser web push.
  - Works on Android Chrome.
  - On iPhone it only works after the user adds Sekretly to their home screen (iOS 16.4+). We'll show an "Add to Home Screen" prompt.

| Event                                   | Notification                                                  |
| --------------------------------------- | ------------------------------------------------------------- |
| New anonymous message                   | "📩 Someone sent you a message on *Describe me in 3 words*" |
| New chat reply                          | "💬 New reply in an anonymous chat"                           |
| Someone joined your game                | "🎮 BlueFox joined *Friday Night Dares* (3/4)"              |
| Game starting / your turn               | "⏰ Your turn!"                                               |
| Link paused (time or message limit hit) | "😴 Your link is paused. Tap to resume."                      |
| Warning received                        | "⚠️ Your account received a warning"                        |

---

## 10. Settings

**Account**

- Change username or password
- Recovery email
- Log out
- Delete account

**Profile**

- Avatar
- Bio
- Public / private profile

**Privacy**

- Who can start two-way chats with me: everyone / nobody
- Let visitors without an account message me: on / off

**Messages**

- Inbox disappear timer (1 day – 3 weeks)
- Chat disappear timer (1 day – 3 weeks)

**Safety**

- My hidden words list
- Blocked chats list

**Links**

- Pause all / Resume all / Reset all links

**Notifications**

- Switch each type of notification on or off
- Turn push notifications on or off

**Appearance**

- Light / Dark / System

**Games**

- Allow game invites: on / off
- Show me in the game listing: on / off

**Legal and help**

- Terms, Privacy Policy, Community Rules, Contact / Help

---

## 11. Admin dashboard & analytics

Admin-only area at `/admin`. Protected by role and a separate login.

### 11.1 Overview (the AdSense-readiness view)

- **Users:** total, new today / this week, daily / weekly / monthly active.
- **Retention:** Day 1, Day 7 and Day 30 (share of users who come back).
- **Funnel:** link visits → messages sent → visitors who sign up (conversion %).
- **Activity:** links created, messages sent, chats started, games created / completed / abandoned.
- **Where users are:** country and state breakdown, mobile network split.
- **Devices:** device type, phone system and browser split.
- **Traffic sources:** WhatsApp, Instagram, Snapchat, direct (from referrer and UTM tags).
- **Peak hours** heatmap.

### 11.2 Management

- **Users:** search, view strikes, warn, block or unblock, delete.
- **Reports queue:** reported content, reporter count, uphold or dismiss (undoes the strike).
- **Banned words:** add, remove, test.
- **Content library:** topics, words, sentences, themes, Truth or Dare questions, NHIE statement bank. Add, edit, hide.
- **Games:** live games, end a game, view game reports.
- **Settings:** ad slots on/off, timer limits, game defaults, maintenance mode.

### 11.3 AdSense checklist page

Tracks what AdSense requires before approval:

- Privacy Policy
- Terms
- About and Contact pages
- original content on public pages
- no policy-breaking content
- steady traffic

---

## 12. Ads (AdSense-ready, switched off)

- An `<AdSlot>` component with fixed, reserved sizes, so the layout doesn't jump when ads load.
- **Planned slots:**

  - inbox list (after every 5th message)
  - "Message sent" success page
  - paused-link page
  - game lobby while waiting
  - settings bottom

  **Never** inside chats, on the compose box, or during an active game turn.
- Switched by env: `NEXT_PUBLIC_ADS_ENABLED=false`. While off, the slot shows nothing and takes up no space, unless `ADS_DEBUG=true`, which shows grey placeholder boxes for layout testing.
- Apply for AdSense once the Day-7 retention and traffic targets look healthy.

---

## 13. Tech stack & architecture

| Layer                  | Choice                                                                       | Why                                                       |
| ---------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| Framework              | **Next.js 15 (App Router) + TypeScript**                               | Pages and backend API in one project; fast on phones      |
| Styling                | **Tailwind CSS** + Framer Motion                                       | Quick theming, dark mode, animations                      |
| Database               | **PostgreSQL (Supabase)**                                              | Free tier, real database, row-level security              |
| Realtime (games, chat) | **Supabase Realtime**                                                  | Live lobbies, turns, votes without running our own server |
| File storage           | Supabase Storage                                                             | Dare evidence and avatars (auto-deleted after games)      |
| Auth                   | Custom username + password (Argon2 hashing) with secure session cookies      | Matches the username-only sign-up                         |
| Scheduled jobs         | Supabase `pg_cron`                                                         | Expire messages, links and games; delete evidence         |
| Location data          | Vercel geo headers (country, region) + MaxMind GeoLite2 ASN (mobile network) | Free, no third-party calls per message                    |
| Device data            | `ua-parser-js`                                                             | Device type, phone system, browser                        |
| Push                   | Web Push (VAPID) + service worker (PWA)                                      | Free; no app store needed                                 |
| Image moderation       | `nsfwjs` in the browser at first, server check later (e.g. Sightengine)    | Cheap to start                                            |
| Hosting                | **Vercel**                                                             | Free tier, fast in Africa via its global network          |
| Analytics              | Our own events table + PostHog (free tier)                                   | Retention and funnels for the dashboard                   |

**Cost at launch: ~$0/month** (all free tiers), plus a domain (~$10–15/year).

---

## 14. Data model (main tables)

```
users            id, username, password_hash, dob, avatar, bio, is_public, role,
                 session_id (link key), strike_count, blocked_at, recovery_email, created_at
user_settings    user_id, inbox_ttl_hours, chat_ttl_hours, allow_chats, allow_visitors,
                 hidden_words[], notif_prefs, theme_mode
themes           id, slug, name, colors, assets, is_active
topics           id, slug, title, is_custom, owner_id?, is_active
topic_words      id, topic_id, word
word_sentences   id, word_id, sentence
links            id, owner_id, theme_id, topic_id, status(active|paused),
                 max_messages?, expires_at?, message_count, created_at
messages         id, link_id, recipient_id, sender_user_id?, sender_fingerprint,
                 thread_id?, body, is_hidden, expires_at, created_at
threads          id, owner_id, anon_user_id, emoji, color, created_at        (two-way chats)
sender_meta      message_id, country, region, isp, device_type, os, browser, local_time
reports          id, reporter_id, target_type, target_id, reason, status, created_at
strikes          id, user_id/fingerprint, report_id, created_at, expires_at
banned_words     id, word, pattern
games            id, type, creator_id, name, join_scope(link|listing|both), min_players,
                 max_players, settings(json), status(lobby|live|ended), expires_at
game_players     game_id, user_id, nickname, color, lives, strikes, joined_at
game_rounds      id, game_id, turn_user_id, prompt, kind(truth|dare|nhie), state, deadline
game_evidence    round_id, media_url/text, submitted_at
game_votes       round_id, voter_id, vote
tod_questions    id, kind(truth|dare), category, indoor, outdoor, day, night, text
nhie_statements  id, category, text
notifications    id, user_id, type, payload, read_at
push_subs        id, user_id, endpoint, keys
events           id, user_id?, anon_id, name, props(json), created_at   (analytics)
```

---

## 15. Build timeline

**Honest check:** 13 days to 31 Oct is tight for *everything*. Truth or Dare, with live evidence and voting, is the largest single feature. Plan: launch the class beta on 31 Oct with the core loop + chats + NHIE + basic admin. Truth or Dare, hints and polish follow in November.

### Phase 1: Foundation (18–20 Oct)

- [ ] Project setup, database, deploy pipeline, domain
- [ ] Design system: colours, themes, light/dark, logo slot, AdSlot (off)
- [ ] Sign up / log in / age gate / sessions

### Phase 2: Core loop (21–25 Oct)

- [ ] Create link: theme picker, topic cards, custom topic, limits
- [ ] Link page for visitors + suggestion strip + sentence bank
- [ ] Send message, sender data capture, banned-word filter, rate limits
- [ ] Inbox + message view + share-as-image
- [ ] Pause / resume / reset links, paused-link page
- [ ] Starter content: 10 topics × 20 words × 5 sentences

### Phase 3: Chats & safety (26–28 Oct)

- [ ] Two-way anonymous chats (threads, realtime)
- [ ] Disappearing timers + hourly cleanup job
- [ ] Report → strikes → silent block; personal hidden words
- [ ] Settings page; in-app notifications + web push

### Phase 4: First game + admin (29–31 Oct)

- [ ] Game system: create, lobby, nicknames, join by link, game listing
- [ ] Never Have I Ever, full game
- [ ] Admin dashboard: overview stats, users, reports, banned words
- [ ] Privacy Policy, Terms, Community Rules, About, Contact
- [ ] **🚀 Class-group beta: 31 Oct**

### Phase 5: Truth or Dare + improvements (1–14 Nov)

- [ ] Truth or Dare: categories, filters, turns, evidence upload, voting, strikes
- [ ] ToD question bank (6 categories × 70–100 truths and dares)
- [ ] Image and video safety check
- [ ] Admin content library and game tools
- [ ] Bug fixes from beta feedback

### Phase 6: Growth (mid-Nov onward)

- [ ] Review Day-7 retention → apply for AdSense → switch ads on
- [ ] Premium plans + hints + payments (Paystack/Flutterwave)
- [ ] More games, more themes, 3D avatars (Three.js)
- [ ] Native apps

### Success targets for the beta

- Day-1 retention ≥ 40%, Day-7 retention ≥ 20%
- ≥ 30% of link visitors send a message
- ≥ 10% of message senders sign up

---

## 16. Risks & legal

| Risk                                                                | Plan                                                                                                                                                                   |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Collecting sender data (Nigeria Data Protection Act 2023)** | Notice on the send page + Privacy Policy explaining what's collected and why. Store only approximate location, never exact. Delete sender data along with the message. |
| **Fake or misleading hints** (NGL, $5M settlement, 2024)      | Hints are only ever real data, labelled "approximate". No fake "someone in your contacts" teasers.                                                                     |
| **Bullying on anonymous apps**                                | Banned list, hidden words, strikes, admin review, self-harm resources.                                                                                                 |
| **Under-18 users + AdSense**                                  | 16+ age gate; no adult content; ads kept away from chats and games.                                                                                                    |
| **Explicit dare evidence**                                    | Automatic nudity check + voting + reports; evidence deleted after the game.                                                                                            |
| **Apple emoji licensing**                                     | Use Fluent Emoji 3D / Noto instead.                                                                                                                                    |
| **iPhone push limits**                                        | Prompt to add to home screen; in-app notifications always work.                                                                                                        |
| **Tight deadline**                                            | Truth or Dare moved to the second phase; scope is fixed per phase.                                                                                                     |

---

## 17. Open questions (defaults used until you answer)

| # | Question                                                                                   | My default                                                         |
| - | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| a | Who picks the suggested words: the visitor or the owner? Can the visitor also type freely? | The visitor picks, and can edit or type freely                     |
| b | Word bank size at launch                                                                   | 10 topics × 20 words × 5 sentences; Claude writes it, you review |
| c | What pauses a link?                                                                        | Message cap, time limit, or owner pause, all three                 |
| d | Inbox timer vs chat timer                                                                  | Inbox = one-way messages; chat = two-way chat messages             |
| e | Can people without an account play any game?                                               | No, every game needs an account                                    |
| f | Anonymous chat threads labelled with a random emoji/colour (no identity)?                  | Yes                                                                |
| g | Approve the 7 hint types?                                                                  | Yes, as listed in §7                                              |
| h | "No nudity automatic checking": did you mean *yes, check automatically for nudity*?      | Yes, check automatically                                           |
| i | Never Have I Ever: lives system and max players                                            | 3 lives, max 10 players                                            |
| j | Game lobby expiry                                                                          | 2 hours                                                            |
| k | Truth or Dare category names                                                               | Chill, Funny, Spicy (no explicit content), Friends, Couples, Party |
| l | Optional recovery email?                                                                   | Yes, optional                                                      |
| m | Domain name                                                                                | sekretlyy.vercel.app                                               |

---

## 18. Appendix: draft screen list (to confirm later)

**Public**

- Landing
- Link page (send message)
- Message sent
- Paused / expired link
- Log in
- Sign up
- Terms / Privacy / Rules / About / Contact

**App**

- Home
- Create Link (theme → topic → limits → share)
- My Links
- Inbox
- Message view + share image
- Chat thread
- Games hub (create + listing)
- Create Game
- Game lobby
- NHIE game
- ToD game
- Notifications
- Profile
- Public profile
- Settings (8 sections)

**Admin**

- Overview
- Users
- Reports
- Banned words
- Content library
- Games
- Ads & settings
- AdSense checklist
