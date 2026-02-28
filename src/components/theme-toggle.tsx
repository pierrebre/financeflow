'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <Button variant="ghost" size="icon" className="w-9 h-9" aria-label="Toggle theme" />;
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			className="w-9 h-9"
			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
			aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			{theme === 'dark' ? (
				<Sun className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100" />
			) : (
				<Moon className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100" />
			)}
		</Button>
	);
}
