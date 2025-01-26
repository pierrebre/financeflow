import { getRSSFeed } from '@/actions/rss';
import { BlogCard } from '@/components/blog/blog-card';

export default async function Page() {
	const data = await getRSSFeed(15);

	return (
		<main className="flex flex-col items-center">
			<h1 className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-2xl text-center pb-4">Blog</h1>
			<div className="my-10 grid grid-cols-1 gap-10 lg:grid-cols-3">{data?.data?.items.map((item, key) => <BlogCard link={item.link} key={key} img={item.imageUrl} title={item.title || ''} />)}</div>
		</main>
	);
}
