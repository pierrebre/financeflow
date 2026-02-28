'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/src/components/ui/command';
import { LayoutDashboard, Star, BookOpen, Home, Moon, Sun, TrendingUp } from 'lucide-react';
import { useTheme } from 'next-themes';

export function CommandPalette() {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};
		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

	const runCommand = useCallback((command: () => void) => {
		setOpen(false);
		command();
	}, []);

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput placeholder="Search pages, actions..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>

				<CommandGroup heading="Navigation">
					<CommandItem onSelect={() => runCommand(() => router.push('/'))}>
						<Home className="mr-2 h-4 w-4" />
						Home — Crypto Market
						<CommandShortcut>↵</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => runCommand(() => router.push('/watchlist'))}>
						<Star className="mr-2 h-4 w-4" />
						Watchlist
					</CommandItem>
					<CommandItem onSelect={() => runCommand(() => router.push('/blog'))}>
						<BookOpen className="mr-2 h-4 w-4" />
						Blog / News
					</CommandItem>
					<CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
						<LayoutDashboard className="mr-2 h-4 w-4" />
						Dashboard
					</CommandItem>
				</CommandGroup>

				<CommandSeparator />

				<CommandGroup heading="Popular Coins">
					{[
						{ id: 'bitcoin', label: 'Bitcoin (BTC)' },
						{ id: 'ethereum', label: 'Ethereum (ETH)' },
						{ id: 'solana', label: 'Solana (SOL)' }
					].map(({ id, label }) => (
						<CommandItem key={id} onSelect={() => runCommand(() => router.push(`/coin/${id}`))}>
							<TrendingUp className="mr-2 h-4 w-4" />
							{label}
						</CommandItem>
					))}
				</CommandGroup>

				<CommandSeparator />

				<CommandGroup heading="Settings">
					<CommandItem onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}>
						{theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
						Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
