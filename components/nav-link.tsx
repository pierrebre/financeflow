'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
	const pathname = usePathname();
	const isActive = pathname === href;

	return (
		<Link
			href={href}
			className={`
        relative mx-4 py-2
        before:content-[''] 
        before:absolute 
        before:block 
        before:w-full 
        before:h-[2px] 
        before:bottom-0 
        before:left-0 
        before:bg-primary 
        before:transform 
        before:scale-x-0 
        before:origin-left
        before:transition-transform 
        before:duration-300
        hover:before:scale-x-100
        ${isActive ? 'before:scale-x-100' : ''}
      `}
		>
			{children}
		</Link>
	);
};

export default NavLink;
