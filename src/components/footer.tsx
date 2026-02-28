import Link from 'next/link';
import { TrendingUp, Github } from 'lucide-react';

export default function Footer() {
	return (
		<footer className="border-t bg-background mt-8">
			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
					{/* Brand */}
					<div className="flex items-center gap-2 font-semibold text-sm">
						<div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary">
							<TrendingUp size={13} className="text-primary-foreground" />
						</div>
						FinanceFlow
					</div>

					{/* Links */}
					<nav className="flex items-center gap-6 text-xs text-muted-foreground">
						<Link href="/" className="hover:text-foreground transition-colors">Markets</Link>
						<Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
						<Link href="/watchlist" className="hover:text-foreground transition-colors">Watchlist</Link>
						<Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
					</nav>

					{/* Social */}
					<div className="flex items-center gap-3">
						<Link
							href="https://github.com/pierrebre/financeflow"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="GitHub repository"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							<Github size={18} />
						</Link>
					</div>
				</div>

				<p className="text-center text-xs text-muted-foreground mt-6">
					© {new Date().getFullYear()} FinanceFlow. Data powered by CoinGecko.
				</p>
			</div>
		</footer>
	);
}
