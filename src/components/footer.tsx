import Link from 'next/link';
import Image from 'next/image';
import { Github } from 'lucide-react';

export default function Footer() {
	return (
		<footer className="relative p-6 mt-4 bg-foreground">
			<div className="flex items-center gap-4 justify-center">
				<Link href="https://github.com/pierrebre/financeflow" className="text-background" target="_blank" prefetch={true} aria-label="Github link for project">
					<Github className="text-background" name="Github" />
				</Link>
			</div>
		</footer>
	);
}
