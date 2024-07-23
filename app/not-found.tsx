import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center text-black">
			<h1>404 - Page Not Found</h1>
			<Button variant="outline" className="mt-10">
				<Link href="/">Go Home</Link>
			</Button>
		</main>
	);
}
