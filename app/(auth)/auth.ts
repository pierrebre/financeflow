import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [Google, GitHub],
	callbacks: {
		session: ({ session, token }) => ({
		  ...session,
		  user: {
			...session.user,
			id: token.sub,
		  },
		}),
	  },
});
