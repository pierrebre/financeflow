import { redirect } from 'next/navigation';
import { auth } from '../(auth)/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function Dashboard() {
	const session = await auth();
	if (!session) redirect('/');

	return (
		<div className="flex min-h-screen w-full flex-col">
			<Tabs defaultValue="profile" className="">
				<TabsList className="">
					<TabsTrigger value="profile">Profile</TabsTrigger>
					<TabsTrigger value="portfolio">Portfolio</TabsTrigger>
				</TabsList>
				<TabsContent value="profile">
					<Card>
						<CardHeader>
							<CardTitle>About Me</CardTitle>
							<CardDescription>Tell us about yourself.</CardDescription>
						</CardHeader>
						<CardContent>
							<form>
								<Avatar className="mt-2">
									<AvatarImage src={session?.user?.image ?? ''} alt={session?.user?.name ?? ''} />
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
								<Input placeholder="Name" disabled className="mt-2" value={session?.user?.name ?? ''} />
								<Input placeholder="Email" disabled className="mt-2" value={session?.user?.email ?? ''} />
							</form>
						</CardContent>
						<CardFooter className="border-t px-6 py-4">
							<Button>Save</Button>
						</CardFooter>
					</Card>
				</TabsContent>
				<TabsContent value="portfolio">
					<Card>
						<CardHeader>
							<CardTitle>Portfolio</CardTitle>
							<CardDescription>Manage your portfolio.</CardDescription>
						</CardHeader>
						<CardContent>
							<form>
								<h2>Portfolio content goes here...</h2>
							</form>
						</CardContent>
						<CardFooter className="border-t px-6 py-4">
							<Button>Save</Button>
						</CardFooter>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
