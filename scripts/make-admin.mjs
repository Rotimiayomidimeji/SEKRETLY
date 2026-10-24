// Gives an account the ADMIN role (or takes it away with --remove). Admin pages live at /admin.
//   node scripts/make-admin.mjs timi
//   node scripts/make-admin.mjs timi --remove
import { PrismaClient } from "@prisma/client";

const [username, flag] = process.argv.slice(2);
if (!username) {
  console.error("Usage: node scripts/make-admin.mjs <username> [--remove]");
  process.exit(1);
}
const db = new PrismaClient();
const user = await db.user.update({ where: { username: username.toLowerCase() }, data: { role: flag === "--remove" ? "MEMBER" : "ADMIN" } }).catch(() => null);
console.log(user ? "@" + user.username + " is now " + user.role : "No account called @" + username);
await db.$disconnect();
