import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { normalizeEmail, uniqueUsername } from "@/lib/auth-utils";

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Google({ allowDangerousEmailAccountLinking: false }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(input) {
        const parsed = credentialsSchema.safeParse(input);
        if (!parsed.success) return null;
        const user = await db.user.findUnique({ where: { email: normalizeEmail(parsed.data.email) } });
        if (!user?.passwordHash || !user.emailVerified) return null;
        if (!(await compare(parsed.data.password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      if (!account.providerAccountId || !user.email || !profile || (profile as { email_verified?: boolean }).email_verified !== true) return false;
      const email = normalizeEmail(user.email);
      // Do not silently link Google to an existing password account. Linking requires a verified, signed-in flow.
      const linked = await db.account.findUnique({ where: { provider_providerAccountId: { provider: "google", providerAccountId: account.providerAccountId } } });
      if (linked) { user.id = linked.userId; return true; }
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) return false;
      const created = await db.user.create({ data: {
        email, name: user.name ?? email.split("@")[0], image: user.image, emailVerified: new Date(),
        profile: { create: { username: uniqueUsername(email), displayName: user.name ?? email.split("@")[0] } },
        accounts: { create: { provider: "google", providerAccountId: account.providerAccountId } },
      } });
      user.id = created.id;
      return true;
    },
    async jwt({ token, user }) { if (user?.id) token.uid = user.id; return token; },
    async session({ session, token }) { if (session.user && typeof token.uid === "string") session.user.id = token.uid; return session; },
  },
});
