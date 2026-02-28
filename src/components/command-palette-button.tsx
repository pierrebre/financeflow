'use client';

import { Button } from '@/src/components/ui/button';
import { Search } from 'lucide-react';

export function CommandPaletteButton() {
	function trigger() {
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
	}

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={trigger}
			className="h-8 gap-2 text-muted-foreground text-xs hidden sm:flex px-3"
		>
			<Search size={13} />
			<span>Search</span>
			<kbd className="ml-1 text-[10px] bg-muted border border-border px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
		</Button>
	);
}
