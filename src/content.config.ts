import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { SUPPORTED_LOCALES } from './config/site';

const blogPermalink = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Blog permalink must be a lowercase, hyphen-separated URL slug without path separators'
  );

const blogImage = z
  .string()
  .regex(/^(?:\/(?!\/)|https:\/\/)/, 'Blog image must be a public path beginning with / or an absolute HTTPS URL');

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: z.object({
    publishDate: z.date(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: blogImage.optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
    locale: z.enum(SUPPORTED_LOCALES),
    permalink: blogPermalink,
    relatedApp: z.string(),
  }),
});

export const collections = {
  post: postCollection,
};
