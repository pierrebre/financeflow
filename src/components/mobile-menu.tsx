'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/src/components/ui/dropdown-menu';

function AnimatedHamburger({ className = '', isOpen }: { className?: string; isOpen: boolean }) {
	return (
		<div className={`w-6 h-6 relative ${className}`}>
			<div className="absolute w-6 h-6 flex flex-col justify-center items-center">
				<span
					className={`
            absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out
            ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}
          `}
				/>
				<span
					className={`
            absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-0 translate-x-3' : 'opacity-100 translate-x-0'}
          `}
				/>
				<span
					className={`
            absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out
            ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}
          `}
				/>
			</div>
		</div>
	);
}

export default function MobileMenu() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger className="lg:hidden ml-4 focus:outline-none" aria-label="Toggle menu">
				<AnimatedHamburger className="hover:text-primary transition-colors" isOpen={isOpen} />
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
	);
}
