'use server';

import { fetchRSSFeed } from '@/lib/rss';

export async function getRSSFeed(maxItems: number = Infinity) {
	const url = 'https://cointelegraph.com/rss/tag';

	try {
		const feed = await fetchRSSFeed(url, maxItems);
		return { success: true, data: feed };
	} catch (error) {
		return { success: false, error: error };
	}
}
