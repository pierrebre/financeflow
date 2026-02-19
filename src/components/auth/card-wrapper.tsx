'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/ui/card';
import { Header } from './header';
import { Social } from './social';
import { BackButton } from './back-button';

interface CardWrapperProps {
	children?: React.ReactNode;
	headerLabel: string;
	backButtonLabel: string;
	backButtonHref: string;
	showSocial?: boolean;
}

export function CardWrapper({ children, headerLabel, backButtonLabel, backButtonHref, showSocial }: CardWrapperProps) {
	return (
		<Card className="w-full lg:w-[400px] shadow-sm">
			<CardHeader>
				<Header label={headerLabel} />
			</CardHeader>
			<CardContent>{children}</CardContent>
			{showSocial && (
				<CardFooter>
					<Social />
				</CardFooter>
			)}
			<CardFooter>
				<BackButton href={backButtonHref} label={backButtonLabel} />
			</CardFooter>
		</Card>
	);
}
