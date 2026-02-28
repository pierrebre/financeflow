import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn()
	}),
	usePathname: () => '/',
	useSearchParams: () => new URLSearchParams()
}));

// Mock next/cache for server action tests
vi.mock('next/cache', () => ({
	unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
	revalidateTag: vi.fn(),
	revalidatePath: vi.fn()
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
	useSession: () => ({ data: null, status: 'unauthenticated' }),
	SessionProvider: ({ children }: { children: React.ReactNode }) => children
}));
