import { redirect } from 'next/navigation';
import { auth } from '../(auth)/auth';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function Page() {
	const session = await auth();
	if (!session) redirect('/api/auth/signin');

	return (
		<div className="flex min-h-screen w-full flex-col">
			<main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
				<div className="mx-auto grid w-full max-w-6xl gap-2">
					<h1 className="text-3xl font-semibold">Dashboard</h1>
				</div>
				<div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
					<nav className="grid gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0">
						<Link href="#" className="font-semibold text-primary">
							Profile
						</Link>
						<Link href="#">Portfolio</Link>
						<Link href="#">Watchlist</Link>
					</nav>
					<div className="grid gap-6">
						<Card x-chunk="dashboard-04-chunk-0">
							<CardHeader>
								<CardTitle>About Me</CardTitle>
								<CardDescription>Tell us about yourself.</CardDescription>
							</CardHeader>
							<CardContent>
								<form>
									<Avatar className="mt-2">
										<AvatarImage src={session?.user?.image ?? ''} />
										<AvatarFallback>CN</AvatarFallback>
									</Avatar>
									<Input placeholder="Username" className="mt-2" value={session?.user?.email?.split('@')[0] ?? ''} />
									<Input placeholder="Name" disabled className="mt-2" value={session?.user?.name ?? ''} />
									<Input placeholder="Email" disabled className="mt-2" value={session?.user?.email ?? ''} />
								</form>
							</CardContent>
							<CardFooter className="border-t px-6 py-4">
								<Button>Save</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
