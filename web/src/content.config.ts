import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const enChapters = defineCollection({
  loader: glob({ pattern: 'ch*.md', base: '../book' }),
});

const zhChapters = defineCollection({
  loader: glob({ pattern: 'ch*.md', base: '../book-zh' }),
});

export const collections = { enChapters, zhChapters };
