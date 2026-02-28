'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/src/components/ui/dropdown-menu';
import { BarChart2, LayoutDashboard, Star, BookOpen } from 'lucide-react';

function AnimatedHamburger({ isOpen }: { isOpen: boolean }) {
	return (
		<div className="w-6 h-6 relative hover:text-primary transition-colors">
			<div className="absolute w-6 h-6 flex flex-col justify-center items-center">
				<span className={`absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}`} />
				<span className={`absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 translate-x-3' : 'opacity-100 translate-x-0'}`} />
				<span className={`absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}`} />
			</div>
		</div>
	);
}

const links = [
	{ href: '/', label: 'Markets', icon: BarChart2 },
	{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/watchlist', label: 'Watchlist', icon: Star },
	{ href: '/blog', label: 'Blog', icon: BookOpen }
];

export default function MobileMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger className="lg:hidden ml-2 focus:outline-none" aria-label="Toggle menu">
				<AnimatedHamburger isOpen={isOpen} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				{links.map(({ href, label, icon: Icon }) => (
					<DropdownMenuItem key={href} asChild className="cursor-pointer">
						<Link
							href={href}
							className={`flex items-center gap-3 w-full ${pathname === href ? 'text-primary font-medium' : ''}`}
							onClick={() => setIsOpen(false)}
						>
							<Icon size={15} />
							{label}
						</Link>
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-muted-foreground text-xs pointer-events-none">
					Press ⌘K to search
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
