import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '~/config/site';

export const getPublishedPosts = async (locale?: Locale): Promise<CollectionEntry<'post'>[]> => {
  const posts = await getCollection(
    'post',
    ({ data }) => data.draft !== true && (locale === undefined || data.locale === locale)
  );

  return posts.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
};

export const getBlogRouteDefinitions = async (locale: Locale): Promise<string[]> => {
  const posts = await getPublishedPosts(locale);
  return [...new Set(posts.map((post) => `blog/${post.data.permalink}`))];
};
