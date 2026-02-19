import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';

import prisma from '@/src/lib/prisma';
import { UserRole } from '@prisma/client';
import authConfig from './auth-config';
import { getTwoFactorConfirmationByUserId } from '@/src/repositories/auth/twoFactorConfirmation';
import { getAccountByUserId, getUserById } from '@/src/repositories/user';

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

			if (session.user) {
				session.user.isTwoFactorAuthenticated = token.isTwoFactorAuthenticated as boolean;
			}

			if (session.user) {
				session.user.name = token.name as string;
				session.user.email = token.email as string;
				session.user.isOAuth = token.isOAuth as boolean;
				session.user.image = token.picture;
			}

			return session;
		},
		async jwt({ token }) {
			if (!token.sub) return token;

			const user = await getUserById(token.sub);

			if (!user) return token;

			const accountExisting = await getAccountByUserId(user.id);

			token.isOAuth = !!accountExisting;
			token.name = user.name;
			token.email = user.email;
			token.role = user.role;
			token.isTwoFactorAuthenticated = user.isTwoFactorAuthenticated;
			token.picture = user.image;

			return token;
		}
	},
	adapter: PrismaAdapter(prisma),
	session: { strategy: 'jwt' },
	...authConfig
});
