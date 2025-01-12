import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'clover', 'lcov'],
		},
	},
	esbuild: {
		target: 'esnext',
	},
	plugins: [
		swc.vite({
			module: { type: 'es6' },
		}),
	],
});
