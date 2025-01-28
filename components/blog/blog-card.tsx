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
				<img src={img} alt="bg" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
				<div className="absolute inset-0 bg-black/70 transition-opacity duration-500 group-hover:bg-black/60" />
				<CardContent className="relative flex flex-col justify-end transform transition-transform duration-500 group-hover:translate-y-[-8px]">
					<h4 className="text-white text-3xl font-bold">{title}</h4>
				</CardContent>
			</a>
		</Card>
	);
}
