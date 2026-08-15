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
      const siteUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://sor.hobitohum.com";
      if (url.includes("localhost")) {
        const path = url.replace(/^https?:\/\/localhost(:\d+)?/, "");
        return `${siteUrl}${path.startsWith("/") ? path : "/" + path}`;
      }
      if (url.startsWith("/")) return `${siteUrl}${url}`;
      return url.startsWith("http") ? url : siteUrl;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/giris") || nextUrl.pathname.startsWith("/kayit");
      const isProtected = nextUrl.pathname.startsWith("/profil") || nextUrl.pathname.startsWith("/soru/sor") || nextUrl.pathname.startsWith("/admin");

      const siteUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://sor.hobitohum.com";

      if (isProtected) {
        if (isLoggedIn) return true;
        const loginUrl = new URL("/giris", siteUrl);
        loginUrl.searchParams.set("callbackUrl", `${siteUrl}${nextUrl.pathname}${nextUrl.search}`);
        return Response.redirect(loginUrl);
      } else if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", siteUrl));
        }
        return true;
      }
      return true;
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
