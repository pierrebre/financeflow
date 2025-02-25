import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import Providers from './providers';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from "@/components/ui/toaster"


import './globals.css';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Session } from 'next-auth';

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans'
});

export const metadata: Metadata = {
	title: 'FinanceFlow',
	description: 'FinanceFlow is a web application that provides a platform for tracking and analyzing cryptocurrency data.'
};

export default function RootLayout({ children, session }: Readonly<{ children: React.ReactNode; session: Session }>) {
	return (
		<html lang="en">
			<body className={cn('bg-background font-sans antialiased min-h-screen flex flex-col', fontSans.variable)}>
				<Providers>
					<SessionProvider session={session}>
						<Toaster />
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
