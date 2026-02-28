import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/src/lib/utils';
import Providers from './providers';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from "@/src/components/ui/toaster"

import './globals.css';
import Navbar from '@/src/components/navbar';
import Footer from '@/src/components/footer';
import { PriceTicker } from '@/src/components/price-ticker';
import { CommandPalette } from '@/src/components/command-palette';

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans'
});

export const metadata: Metadata = {
	title: {
		default: 'FinanceFlow',
		template: '%s | FinanceFlow'
	},
	description: 'FinanceFlow is a web application that provides a platform for tracking and analyzing cryptocurrency data.',
	manifest: '/manifest.json',
	openGraph: {
		title: 'FinanceFlow',
		description: 'Track and analyze cryptocurrency data with FinanceFlow.',
		type: 'website',
		locale: 'en_US'
	},
	twitter: {
		card: 'summary_large_image',
		title: 'FinanceFlow',
		description: 'Track and analyze cryptocurrency data with FinanceFlow.'
	}
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body className={cn('bg-background font-sans antialiased min-h-screen flex flex-col', fontSans.variable)}>
				<Providers>
					<SessionProvider>
						<Toaster />
						<CommandPalette />
						<PriceTicker />
						<div className="container mx-auto mt-4 flex-grow">
							<Navbar />
							{children}
						</div>
						<Footer />
					</SessionProvider>
				</Providers>
			</body>
		</html>
	);
}
