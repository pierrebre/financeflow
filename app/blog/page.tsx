import type { Metadata } from 'next';
import { getRSSFeed } from '@/src/actions/external/rss';
import { BlogCard } from '@/src/components/blog/blog-card';

export const metadata: Metadata = {
	title: 'Blog',
	description: 'Latest crypto news and analysis from Cointelegraph.'
};

function estimateReadingTime(text: string | undefined | null): number {
	if (!text) return 2;
	const words = text.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 200));
}

export default async function Page() {
	const data = await getRSSFeed(15);

	return (
		<main className="flex flex-col items-center">
			<h1 className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-2xl text-center pb-4">
				Crypto News
			</h1>
			<div className="my-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
				{data?.data?.items.map((item, key) => (
					<BlogCard
						key={key}
						link={item.link}
						img={item.imageUrl ?? ''}
						title={item.title ?? ''}
						readingTime={estimateReadingTime(item.description)}
						pubDate={item.pubDate}
						categories={item.categories as string[] | undefined}
					/>
				))}
			</div>
		</main>
	);
}
