import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/src/components/ui/dropdown-menu';
import { SignOut } from './auth/signout';
import { FaUser } from 'react-icons/fa';
import { UserRole } from '@prisma/client';
import { currentUser } from '@/src/lib/utils';
import NavLink from './nav-link';
import MobileMenu from './mobile-menu';
import { ThemeToggle } from './theme-toggle';
import { TrendingUp } from 'lucide-react';
import { CommandPaletteButton } from './command-palette-button';

export default async function Navbar() {
	const user = await currentUser();

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
			<nav className="container mx-auto flex items-center justify-between h-14 px-4">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-2 font-bold text-base hover:opacity-80 transition-opacity shrink-0">
					<div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
						<TrendingUp size={15} className="text-primary-foreground" />
					</div>
					<span>FinanceFlow</span>
				</Link>

				{/* Desktop nav links */}
				<div className="hidden lg:flex items-center">
					<NavLink href="/">Markets</NavLink>
					<NavLink href="/dashboard">Dashboard</NavLink>
					<NavLink href="/watchlist">Watchlist</NavLink>
					<NavLink href="/blog">Blog</NavLink>
				</div>

				{/* Right actions */}
				<div className="flex items-center gap-1">
					<CommandPaletteButton />
					<ThemeToggle />

					{/* User avatar dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger name="user_icon" aria-label="User menu" className="focus:outline-none ml-1">
							<Avatar className="h-8 w-8 bg-muted hover:opacity-80 transition-opacity cursor-pointer">
								<AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
								<AvatarFallback>
									<FaUser className="h-4 w-4" />
								</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-52">
							{user?.name && (
								<>
									<DropdownMenuLabel className="font-normal pb-2">
										<p className="font-semibold text-sm leading-none">{user.name}</p>
										{user.email && (
											<p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
										)}
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
								</>
							)}
							<DropdownMenuItem asChild className="cursor-pointer">
								<Link href="/dashboard" className="w-full">Dashboard</Link>
							</DropdownMenuItem>
							{user?.role === UserRole.ADMIN && (
								<DropdownMenuItem asChild className="cursor-pointer">
									<Link href="/admin" className="w-full">Admin</Link>
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

					<MobileMenu />
				</div>
			</nav>
		</header>
	);
}
