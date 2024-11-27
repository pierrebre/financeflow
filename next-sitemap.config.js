/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: process.env.BASE_URL,
	generateRobotsTxt: true,
	exclude: ['/api/*', '/auth/*', '/dashboard/*'],
	robotsTxtOptions: {
		policies: [
			{
				userAgent: '*',
				allow: '/'
			}
		]
	}
};
