import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';

import './globals.css';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans'
});
export const metadata: Metadata = {
	title: 'FinanceFlow',
	description: 'FinanceFlow is a web application that provides a platform for tracking and analyzing cryptocurrency data.'
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={cn(' bg-background font-sans antialiased', fontSans.variable)}>
				<div className="container mx-auto mt-4">
					<Navbar />
					{children}
				</div>
				<Footer />
			</body>
		</html>
	);
}
