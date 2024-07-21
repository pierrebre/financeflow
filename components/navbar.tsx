import { CircleUserIcon } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
	return (
		<nav className="flex items-center justify-between lg:mb-16 mb-8">
			<div className="flex items-center">
				<Link href="/" className="text-xl font-bold">
					FinanceFlow
				</Link>
			</div>
			<div className="flex items-center gap-4">
{/* 				<Link href="/" className="font-medium text-primary">
					Home
				</Link>
				<Link href="/blog" className="font-medium text-primary">
					Blog
				</Link> */}
			</div>
			<div className="flex items-center">
				<Link href="#" className="font-medium text-primary">
					<CircleUserIcon className="h-10 w-10" strokeWidth={1.5} />
				</Link>
			</div>
		</nav>
	);
}
