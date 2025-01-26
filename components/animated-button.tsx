'use client';

import { useState } from 'react';

export default function AnimatedHamburger({ className = '' }: { className?: string }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className={`w-6 h-6 relative ${className}`} onClick={() => setIsOpen(!isOpen)}>
			<div className="absolute w-6 h-6 flex flex-col justify-center items-center">
				<span
					className={`
            block h-0.5 w-5 bg-current transform transition duration-300 ease-in-out
            ${isOpen ? 'rotate-45 translate-y-1' : '-translate-y-1.5'}
          `}
				/>
				<span
					className={`
            block h-0.5 w-5 bg-current transform transition duration-300 ease-in-out
            ${isOpen ? 'opacity-0' : 'opacity-100'}
          `}
				/>
				<span
					className={`
            block h-0.5 w-5 bg-current transform transition duration-300 ease-in-out
            ${isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1.5'}
          `}
				/>
			</div>
		</div>
	);
}
