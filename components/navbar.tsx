// Navbar.tsx
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SignOut } from './auth/signout';
import { FaUser } from 'react-icons/fa';
import { UserRole } from '@prisma/client';
import { currentUser } from '@/lib/utils';
import NavLink from './nav-link';
import AnimatedButton from './animated-button';

export default async function Navbar() {
	const user = await currentUser();

	return (
		<nav className="flex items-center justify-between lg:mb-16 mb-8 px-4 py-3">
			<div className="flex items-center">
				<Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
					FinanceFlow
				</Link>
			</div>

			<div className="flex items-center">
				<div className="lg:mx-4 hidden lg:block">
					<NavLink href="/watchlist">Watchlist</NavLink>
					<NavLink href="/blog">Blog</NavLink>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger name="user_icon" aria-label="User button dropdown" className="focus:outline-none">
						<Avatar className="items-center justify-center bg-muted hover:opacity-80 transition-opacity">
							<AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
							<AvatarFallback>
								<FaUser className="h-5 w-5" />
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-48">
						<DropdownMenuLabel>Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="cursor-pointer">
							<Link href="/dashboard" className="w-full">
								Dashboard
							</Link>
						</DropdownMenuItem>
						{user?.role === UserRole.ADMIN && (
							<DropdownMenuItem className="cursor-pointer">
								<Link href="/admin" className="w-full">
									Admin
								</Link>
							</DropdownMenuItem>
						)}
						{user && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="cursor-pointer">
									<SignOut />
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger className="lg:hidden ml-4 focus:outline-none" aria-label="Toggle menu">
						<AnimatedButton className="hover:text-primary transition-colors" />
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-48">
						<DropdownMenuItem className="cursor-pointer">
							<Link href="/watchlist" className="w-full">
								Watchlist
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem className="cursor-pointer">
							<Link href="/blog" className="w-full">
								Blog
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</nav>
	);
}
