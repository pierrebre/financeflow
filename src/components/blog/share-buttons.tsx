'use client';

import { Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/src/components/ui/button';

interface ShareButtonsProps {
	title: string;
	url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
	const [copied, setCopied] = useState(false);

	const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
	const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback for non-secure contexts
			const input = document.createElement('input');
			input.value = url;
			document.body.appendChild(input);
			input.select();
			document.execCommand('copy');
			document.body.removeChild(input);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
			<a
				href={twitterUrl}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Share on Twitter/X"
				className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
			>
				<Twitter className="h-3.5 w-3.5 text-white" />
			</a>
			<a
				href={linkedinUrl}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Share on LinkedIn"
				className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
			>
				<Linkedin className="h-3.5 w-3.5 text-white" />
			</a>
			<Button
				variant="ghost"
				size="icon"
				className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 p-0"
				onClick={copyLink}
				aria-label="Copy link"
			>
				{copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Link2 className="h-3.5 w-3.5 text-white" />}
			</Button>
		</div>
	);
}
