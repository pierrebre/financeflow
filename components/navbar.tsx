import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { auth } from '../auth';
import { SignOut } from './auth/signout';
import { FaUser } from 'react-icons/fa';
import { UserRole } from '@prisma/client';
import { currentUser } from '@/lib/utils';

export default async function Navbar() {
	const user = await currentUser();

	return (
		<nav className="flex items-center justify-between lg:mb-16 mb-8">
			<div className="flex items-center">
				<Link href="/" className="text-xl font-bold">
					FinanceFlow
				</Link>
			</div>
			<div className="flex items-center">
				<DropdownMenu>
					<DropdownMenuTrigger name="user_icon" aria-label="User button dropdown">
						<Avatar className="items-center justify-center bg-muted">
							<AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} /> 
							<AvatarFallback>
								<FaUser className="h-5 w-5" />
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>Settings</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<Link href="/watchlist">Watchlist</Link>
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Link href="/dashboard">Dashboard</Link>
						</DropdownMenuItem>
						{user?.role === UserRole.ADMIN && (
							<DropdownMenuItem>
								<Link href="/admin">Admin</Link>
							</DropdownMenuItem>
						)}
						{user !== null && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<SignOut />
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</nav>
	);
}
