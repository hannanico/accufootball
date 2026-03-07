import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
        password: { label: "Password", type: "password" },
        mode: { label: "Mode", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials.email as string;
        const name = credentials.name as string;
        const password = credentials.password as string;
        const mode = credentials.mode as string;

        if (!email || !password) return null;

        if (mode === "signup") {
          const existing = await db.select().from(users).where(eq(users.email, email));
          if (existing.length > 0) throw new Error("Email already registered.");

          const hashed = await bcrypt.hash(password, 10);
          const [newUser] = await db.insert(users).values({ name, email, password: hashed }).returning();
          return { id: newUser.id, name: newUser.name, email: newUser.email };
        } else {
          const [user] = await db.select().from(users).where(eq(users.email, email));
          if (!user) throw new Error("No account found with that email.");

          const valid = await bcrypt.compare(password, user.password);
          if (!valid) throw new Error("Incorrect password.");

          return { id: user.id, name: user.name, email: user.email };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
