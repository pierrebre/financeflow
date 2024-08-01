import Link from 'next/link';
import Image from 'next/image';
import { Github } from 'lucide-react';

export default function Footer() {
	return (
		<footer className="relative mt-6 p-6 bg-black">
			<div className="flex items-center gap-4 justify-center">
				<Link href="https://github.com/pierrebre/financeflow" className="text-white" target="_blank" prefetch={true} aria-label='Github link for project'>
					<Github className="text-white" name='Github'/>
				</Link>
			</div>
		</footer>
	);
}
