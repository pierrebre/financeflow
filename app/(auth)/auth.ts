import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

import { hashString } from '@/lib/utils';

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [Google, GitHub],
	callbacks: {
		session: async ({ session, token }) => {
			const userId = await hashString(session.user?.email ?? '');
			return {
				...session,
				user: {
					...session.user,
					id: userId
				}
			};
		}
	}
});
