import Image from 'next/image';
import { Card, CardContent } from '../ui/card';

interface ContentCardPropsType {
	readonly img: string;
	readonly title: string;
	readonly link?: string;
}

export function BlogCard({ img, title, link }: ContentCardPropsType) {
	return (
		<Card className="relative grid min-h-[30rem] items-end overflow-hidden rounded-xl group" color="transparent">
			<a href={link ?? '/'} target="_blank" rel="noopener noreferrer">
				<Image src={img} alt={title} fill className="object-cover object-center transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
				<div className="absolute inset-0 bg-black/70 transition-opacity duration-500 group-hover:bg-black/60" />
				<CardContent className="relative flex flex-col justify-end transform transition-transform duration-500 group-hover:translate-y-[-8px]">
					<h4 className="text-white text-3xl font-bold">{title}</h4>
				</CardContent>
			</a>
		</Card>
	);
}
