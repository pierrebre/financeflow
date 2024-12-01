import { useEffect, useRef } from 'react';

interface UseIntersectionObserverProps {
	onIntersect: () => void;
	threshold?: number;
	root?: Element | null;
	rootMargin?: string;
}

export function useIntersectionObserver({ onIntersect, threshold = 0.1, root = null, rootMargin = '0px' }: UseIntersectionObserverProps) {
	const observerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					onIntersect();
				}
			},
			{ threshold, root, rootMargin }
		);

		if (observerRef.current) {
			observer.observe(observerRef.current);
		}

		return () => observer.disconnect();
	}, [onIntersect, threshold, root, rootMargin]);

	return { observerRef };
}
