import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/tests/setup.ts'],
		include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
		exclude: ['node_modules', '.next', 'cypress'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
			include: ['src/**/*.ts', 'src/**/*.tsx'],
			exclude: ['src/tests/**', '**/*.d.ts']
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, '.'),
			'@/src': path.resolve(__dirname, 'src')
		}
	}
});
