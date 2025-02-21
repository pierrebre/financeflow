// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

// Définition de `role` dans `User`
declare module 'next-auth' {
	interface Session {
		user: {
			role?: string;
			isTwoFactorAuthenticated?: boolean;
			isOAuth?: boolean;
		} & DefaultSession['user'];
	}

	interface User extends DefaultUser {
		role?: string;
		isTwoFactorAuthenticated?: boolean;
		isOAuth?: boolean;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		role?: string;
		isTwoFactorAuthenticated?: boolean;
		isOAuth?: boolean;
	}
}
