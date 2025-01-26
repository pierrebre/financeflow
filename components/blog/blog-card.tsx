import { Card, CardContent } from '../ui/card';

interface ContentCardPropsType {
	readonly img: string;
	readonly title: string;
	readonly link?: string;
}

export function BlogCard({ img, title, link }: ContentCardPropsType) {
	return (
		<Card className="relative grid min-h-[30rem] items-end overflow-hidden rounded-xl" color="transparent">
			<a href={link ?? '/'} target="_blank" rel="noopener noreferrer">
				<img src={img} alt="bg" className="absolute inset-0 h-full w-full object-cover object-center" />
				<div className="absolute inset-0 bg-black/70" />
				<CardContent className="relative flex flex-col justify-end">
					<h4 className="text-white text-3xl font-bold">{title}</h4>
					<p className="text-white text-sm">Published on 2023-01-01</p>
				</CardContent>
			</a>
		</Card>
	);
}
