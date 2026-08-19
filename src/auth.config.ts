import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "hobitohum_tarimsal_secret_key_2026",
  pages: {
    signIn: "/giris",
    error: "/giris",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith("http")) {
        try {
          const parsed = new URL(url);
          const base = new URL(baseUrl);
          if (parsed.origin === base.origin) {
            return url;
          }
        } catch {}
      }
      return baseUrl;
    },
    authorized({ auth, request: { nextUrl } }) {
      try {
        const isLoggedIn = !!auth?.user;
        const isAuthPage = nextUrl.pathname.startsWith("/giris") || nextUrl.pathname.startsWith("/kayit");
        const isProtected = nextUrl.pathname.startsWith("/profil") || nextUrl.pathname.startsWith("/soru/sor") || nextUrl.pathname.startsWith("/admin");

        if (isProtected) {
          if (isLoggedIn) return true;
          return false; // NextAuth handles redirecting to /giris safely
        } else if (isAuthPage) {
          if (isLoggedIn) {
            return Response.redirect(new URL("/", nextUrl.origin));
          }
          return true;
        }
        return true;
      } catch (error) {
        console.error("Middleware authorized error:", error);
        return true;
      }
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
