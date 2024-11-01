// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// Définition de `role` dans `User`
declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
