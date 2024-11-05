import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { currentUser } from '@/lib/utils';

export default async function Dashboard() {
	const user = await currentUser();

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
									<AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
								<Input placeholder="Name" disabled className="mt-2" value={user?.name ?? ''} />
								<Input placeholder="Email" disabled className="mt-2" value={user?.email ?? ''} />
								<Input placeholder="Password" disabled className="mt-2" value={user?.role ?? ''} />
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
