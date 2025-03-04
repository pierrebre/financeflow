import Parser from 'rss-parser';

export async function fetchRSSFeed(url: string, maxItems: number = Infinity, timeout: number = 5000) {
	try {
		const parser = new Parser({
			timeout,
			headers: {
				Accept: 'application/rss+xml, application/xml, text/xml',
				'User-Agent': 'RSS Feed Parser/1.0'
			}
		});

		const feed = await parser.parseURL(url);

		return {
			title: feed.title,
			description: feed.description,
			link: feed.link,
			lastBuildDate: feed.lastBuildDate ? new Date(feed.lastBuildDate) : null,
			image: feed.image?.url || null,
			items: feed.items.slice(0, maxItems).map((item) => ({
				title: item.title,
				link: item.link,
				pubDate: item.pubDate ? new Date(item.pubDate) : null,
				creator: item['dc:creator'] || null,
				categories: item.categories || [],
				description: item.description || item.content,
				imageUrl: item['media:content']?.url || item.enclosure?.url || null,
				guid: item.guid || null
			}))
		};
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === 'TimeoutError') {
				throw new Error(`Timeout après ${timeout}ms`);
			}
			throw error;
		} else {
			throw new Error('An unknown error occurred');
		}
	}
}
