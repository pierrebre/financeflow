import Image from 'next/image';
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
					<Image src="/avataaars.png" alt="Github" className="" width={48} height={48} />
				</Link>
			</div>
		</nav>
	);
}
