import { QueryClient, isServer } from '@tanstack/react-query';
import { cache } from 'react';

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000
			}
		}
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

export const getQueryClient = cache(() => {
	if (isServer) {
		return makeQueryClient();
	} else {
		if (!browserQueryClient) {
			browserQueryClient = makeQueryClient();
		}
		return browserQueryClient;
	}
});
