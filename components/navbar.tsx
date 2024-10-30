import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { auth } from '../auth';
import { SignOut } from './auth/signout';
import { LoginButton } from './auth/login-button';
export default async function Navbar() {
	const session = await auth();

	return (
		<nav className="flex items-center justify-between lg:mb-16 mb-8">
			<div className="flex items-center">
				<Link href="/" className="text-xl font-bold">
					FinanceFlow
				</Link>
			</div>
			<div className="flex items-center gap-4">
				{/* 				
				<Link href="/blog" className="font-medium text-primary">
					Blog
				</Link> */}
			</div>
			<div className="flex items-center">
				<DropdownMenu>
					<DropdownMenuTrigger name="user_icon" aria-label="User button dropdown">
						{' '}
						<Avatar>
							<AvatarImage src={session?.user?.image ?? 'https://github.com/shadcn.png'} alt={session?.user?.name ?? ''} />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<Link href="/watchlist">Watchlist</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<LoginButton>Sign In</LoginButton>
						</DropdownMenuItem>
						{session !== null && (
							<DropdownMenuItem>
								<SignOut />
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</nav>
	);
}
