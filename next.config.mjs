/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ['cmdk'],
	images: {
		remotePatterns: [
			// CoinGecko coin images
			{
				protocol: 'https',
				hostname: 'coin-images.coingecko.com',
				pathname: '/**'
			},
			{
				protocol: 'https',
				hostname: 'assets.coingecko.com',
				pathname: '/**'
			},
			// GitHub OAuth avatars
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
				pathname: '/**'
			},
			// Google OAuth avatars
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				pathname: '/**'
			},
			// Vercel Blob storage (user uploaded avatars)
			{
				protocol: 'https',
				hostname: '*.public.blob.vercel-storage.com',
				pathname: '/**'
			},
			// Cointelegraph blog images
			{
				protocol: 'https',
				hostname: 'images.cointelegraph.com',
				pathname: '/**'
			}
		]
	}
};

export default nextConfig;
