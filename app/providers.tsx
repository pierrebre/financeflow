'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from './get-query-client';

const Providers = ({ children }: { children: React.ReactNode }) => {
	if (typeof window === 'undefined') {
		return <>{children}</>;
	}

	const queryClient = getQueryClient();

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default Providers;
