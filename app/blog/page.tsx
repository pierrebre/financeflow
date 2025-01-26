import { getRSSFeed } from '@/actions/rss';
import { BlogCard } from '@/components/blog/blog-card';

export default async function Page() {
	const data = await getRSSFeed('https://cointelegraph.com/rss/tag/altcoin').then((response) => {
		return response;
	});

	return (
		<main className="flex flex-col items-center">
			<h1>Blog</h1>
			<div className="my-10 grid grid-cols-1 gap-10 lg:grid-cols-3">{data?.data?.items.map((item, key) => <BlogCard key={key} img={item.imageUrl} title={item.title || ''} desc={item.description} />)}</div>
		</main>
	);
}
