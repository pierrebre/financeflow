import NextAuth from 'next-auth';

import authConfig from './auth-config';
import { apiAuthPrefix, publicRoutes, authRoutes, DEFAULT_LOGIN_REDIRECT } from './routes';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;

	const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
	const isPublicRoute = publicRoutes.some((route) => {
		if (route.includes('[id]')) {
			const dynamicRoute = route.replace('[id]', '');
			return nextUrl.pathname.startsWith(dynamicRoute);
		}
		return route === nextUrl.pathname;
	});
	const isAuthRoutes = authRoutes.includes(nextUrl.pathname);

	if (isApiAuthRoute) {
		return;
	}

	if (isAuthRoutes) {
		if (isLoggedIn) {
			console.log('redirecting to dashboard');
			return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
		}
		return;
	}

	if (!isLoggedIn && !isPublicRoute) {
		return Response.redirect(new URL('/auth/login', nextUrl));
	}
});

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
