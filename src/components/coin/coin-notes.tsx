'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/src/components/ui/textarea';
import { Button } from '@/src/components/ui/button';
import { Save, Trash2, NotebookPen } from 'lucide-react';

interface CoinNotesProps {
	coinId: string;
}

export function CoinNotes({ coinId }: CoinNotesProps) {
	const storageKey = `coin-notes-${coinId}`;
	const [text, setText] = useState('');
	const [saved, setSaved] = useState(true);
	const [hasNote, setHasNote] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem(storageKey) ?? '';
		setText(stored);
		setHasNote(stored.length > 0);
	}, [storageKey]);

	const handleChange = (value: string) => {
		setText(value);
		setSaved(false);
	};

	const handleSave = () => {
		localStorage.setItem(storageKey, text);
		setSaved(true);
		setHasNote(text.length > 0);
	};

	const handleDelete = () => {
		localStorage.removeItem(storageKey);
		setText('');
		setSaved(true);
		setHasNote(false);
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
				<NotebookPen size={15} />
				<span>Personal Notes</span>
				{hasNote && !saved && <span className="text-amber-500 text-xs">(unsaved changes)</span>}
				{saved && hasNote && <span className="text-emerald-500 text-xs">Saved</span>}
			</div>
			<Textarea
				value={text}
				onChange={(e) => handleChange(e.target.value)}
				placeholder={`Write your thoughts about this asset...`}
				rows={5}
				className="resize-none text-sm"
			/>
			<div className="flex gap-2">
				<Button size="sm" onClick={handleSave} disabled={saved} className="gap-1.5">
					<Save size={13} /> Save
				</Button>
				{hasNote && (
					<Button size="sm" variant="outline" onClick={handleDelete} className="gap-1.5 text-red-500 hover:text-red-500">
						<Trash2 size={13} /> Clear
					</Button>
				)}
			</div>
		</div>
	);
}
