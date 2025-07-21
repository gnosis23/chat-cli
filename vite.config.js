import {defineConfig} from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: 'src/chat-cli.js',
			formats: ['es'],
			fileName: 'chat-cli',
		},
		outDir: 'dist',
		rollupOptions: {
			output: {
				banner: '#!/usr/bin/env node',
				format: 'es',
			},
		},
		target: 'node16',
    ssr: true,
		minify: true,
	},
	esbuild: {
		jsx: 'automatic',
		jsxImportSource: 'react',
	},
  ssr: {
    target: 'node16',
  },
	define: {
		'process.env.NODE_ENV': '"production"',
	},
});
