'use server';

import { fetchRSSFeed } from '@/lib/rss';

export async function getRSSFeed(url: string) {
	try {
		const feed = await fetchRSSFeed(url);
		return { success: true, data: feed };
	} catch (error) {
		return { success: false, error: error };
	}
}
