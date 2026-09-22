import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// Where this page's content comes from in the original book (drives the attribution footer)
				source: z
					.object({
						url: z.string().url(),
						sections: z.array(z.string()),
					})
					.optional(),
			}),
		}),
	}),
};
