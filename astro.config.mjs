// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	site: 'https://n0k0259.github.io',
	base: '/learn-ai-agents',
	integrations: [
		// Registered before Starlight so it skips its own sitemap; the style guide is internal.
		sitemap({ filter: (page) => !page.includes('/style-guide/') }),
		starlight({
			title: 'Learn AI Agents',
			description: 'An engineer-focused guided tutorial of AI Agent Book by Bojie Li.',
			// No og:image exists, so use the small card.
			head: [{ tag: 'meta', attrs: { name: 'twitter:card', content: 'summary' } }],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/n0k0259/learn-ai-agents' }],
			plugins: [starlightLinksValidator()],
			customCss: ['./src/styles/custom.css', './src/styles/diagrams.css'],
			sidebar: [
				{ label: 'Chapter 1: Getting Started with AI Agents', items: [{ autogenerate: { directory: 'chapter-1' } }] },
				{ label: 'Chapter 2: Context Engineering', items: [{ autogenerate: { directory: 'chapter-2' } }] },
				{ label: 'About & credits', slug: 'about' },
			],
		}),
	],
});
