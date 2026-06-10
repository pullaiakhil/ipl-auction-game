import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  ...authConfig,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.picture = session.image ?? token.picture;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        return true;
      }
      return true;
    },
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isProtected = ["/dashboard", "/auction", "/team", "/match", "/admin"].some(
        (p) => nextUrl.pathname.startsWith(p)
      );

      if (isProtected && !isLoggedIn) return false;
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      console.log(`🎉 New user created: ${user.email}`);
    },
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`👋 New user signed in: ${user.email}`);
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
  secret: process.env.AUTH_SECRET,
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
    };
  }
}
