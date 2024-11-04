import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';

import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import authConfig from './auth-config';
import { getUserById } from './data/user';
import { getTwoFactorConfirmationByUserId } from './data/two-factor-confirmation';

export const { handlers, signIn, signOut, auth } = NextAuth({
	pages: {
		signIn: '/auth/login',
		error: '/auth/error'
	},
	events: {
		async linkAccount({ user, account }) {
			await prisma.user.update({
				where: { id: user.id },
				data: { emailVerified: new Date() }
			});
		}
	},
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider !== 'credentials') return true;

			// Deny login without email verification
			const userExists = await getUserById(user.id ?? '');

			if (!userExists?.emailVerified) return false;

			if (userExists.isTwoFactorAuthenticated) {
				const twofactorConfirmation = await getTwoFactorConfirmationByUserId(userExists.id);

				if (!twofactorConfirmation) return false;

				await prisma.twoFactorConfirmation.delete({
					where: {
						id: twofactorConfirmation.id
					}
				});
			}

			return true;
		},
		async session({ token, session }) {
			if (token.sub && session.user) {
				session.user.id = token.sub;
			}

			if (token.role && session.user) {
				session.user.role = token.role as UserRole | undefined;
			}

			return session;
		},
		async jwt({ token }) {
			if (!token.sub) return token;

			const user = await getUserById(token.sub);

			if (!user) return token;

			token.role = user.role;

			return token;
		}
	},
	adapter: PrismaAdapter(prisma),
	session: { strategy: 'jwt' },
	...authConfig
});
