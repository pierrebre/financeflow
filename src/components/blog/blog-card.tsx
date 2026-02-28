import Image from 'next/image';
import { Card, CardContent } from '../ui/card';
import { Clock } from 'lucide-react';
import { ShareButtons } from './share-buttons';
import { Badge } from '../ui/badge';

interface ContentCardPropsType {
	readonly img: string;
	readonly title: string;
	readonly link?: string;
	readonly readingTime?: number;
	readonly pubDate?: Date | null;
	readonly categories?: string[];
}

export function BlogCard({ img, title, link, readingTime, pubDate, categories }: ContentCardPropsType) {
	const articleUrl = link ?? '/';
	const formattedDate = pubDate
		? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(pubDate)
		: null;

	return (
		<Card className="relative grid min-h-[30rem] items-end overflow-hidden rounded-xl group" color="transparent">
			<a href={articleUrl} target="_blank" rel="noopener noreferrer">
				<Image
					src={img}
					alt={title}
					fill
					className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-500 group-hover:from-black/80" />
				<CardContent className="relative flex flex-col justify-end gap-2 transform transition-transform duration-500 group-hover:translate-y-[-8px]">
					{categories && categories.length > 0 && (
						<div className="flex flex-wrap gap-1">
							{categories.slice(0, 2).map((cat) => (
								<Badge key={cat} variant="secondary" className="text-xs bg-white/20 text-white border-0 backdrop-blur-sm">
									{cat}
								</Badge>
							))}
						</div>
					)}
					<h4 className="text-white text-2xl font-bold leading-tight">{title}</h4>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3 text-white/70 text-xs">
							{readingTime && (
								<span className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									{readingTime} min read
								</span>
							)}
							{formattedDate && <span>{formattedDate}</span>}
						</div>
						<ShareButtons title={title} url={articleUrl} />
					</div>
				</CardContent>
			</a>
		</Card>
	);
}
