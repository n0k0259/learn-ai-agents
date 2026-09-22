// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

export default defineConfig({
	site: 'https://n0k0259.github.io',
	base: '/learn-ai-agents',
	integrations: [
		starlight({
			title: 'Learn AI Agents',
			description: 'An engineer-focused guided tutorial of AI Agent Book by Bojie Li.',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/n0k0259/learn-ai-agents' }],
			plugins: [starlightLinksValidator()],
			sidebar: [{ label: 'About & credits', slug: 'about' }],
		}),
	],
});
