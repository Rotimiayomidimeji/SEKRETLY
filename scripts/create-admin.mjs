// Creates the admin account (or gives it a fresh password) and prints the password once.
//   node scripts/create-admin.mjs                     → @sekretly_hq with a new random password
//   node scripts/create-admin.mjs --email you@x.com   → also sets the recovery email (for reset-by-code)
// Sign in at /login with that username and password; admins land on /admin.
// Change the password later in Settings › Account (or /admin/account); forgot it? /forgot-password sends a code.
import { randomBytes, randomInt, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";

import { PrismaClient } from "@prisma/client";

const scrypt = promisify(scryptCb);
const args = process.argv.slice(2);
const email = args.includes("--email") ? args[args.indexOf("--email") + 1] : null;
const username = "sekretly_hq";

// 20 characters with every kind of character, no look-alikes (0/O, 1/l/I)
const SETS = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789", "!@#$%^&*-_+=?"];
const chars = SETS.map((s) => s[randomInt(s.length)]);
while (chars.length < 20) { const set = SETS[randomInt(SETS.length)]; chars.push(set[randomInt(set.length)]); }
for (let i = chars.length - 1; i > 0; i--) { const j = randomInt(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
const password = chars.join("");

// same format as lib/password.ts
const salt = randomBytes(16).toString("hex");
const passwordHash = ["scrypt-v1", salt, (await scrypt(password, salt, 64)).toString("hex")].join("$");

const db = new PrismaClient();
const data = { passwordHash, role: "ADMIN", status: "ACTIVE", ...(email ? { recoveryEmail: email.toLowerCase(), emailVerifiedAt: new Date() } : {}) };
const user = await db.user.upsert({
  where: { username },
  create: { username, ...data, avatar: "koala", linkKey: randomBytes(4).toString("hex").slice(0, 6), ageConfirmedAt: new Date(), onboardedAt: new Date() },
  update: data,
});
// a fresh password logs out anywhere the old one was used
await db.session.deleteMany({ where: { userId: user.id } });
await db.$disconnect();
console.log("Admin account: @" + username);
console.log("Password:      " + password);
console.log(email ? "Recovery email: " + email : "No recovery email yet: set one in Settings › Account to reset by code.");
