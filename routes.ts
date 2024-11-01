/**
 * An aray of route that are accessible to the public
 * Authentificatio not required
 */
export const publicRoutes = ['/', '/coin', '/watchlist', '/auth/new-verification'];

/**
 * An array of routes used for authentification
 * Authentification required
 */
export const authRoutes = ['/auth/login', '/auth/register', '/auth/error'];

/**
 *  Prefix for API authentification routes
 */
export const apiAuthPrefix = '/api/auth';

/**
 * Default redirect path after loggin in
 */
export const DEFAULT_LOGIN_REDIRECT = '/dashboard';
