import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';

import './globals.css';

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
			<body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>{children}</body>
		</html>
	);
}
