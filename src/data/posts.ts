import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '~/config/site';

const assertUniquePermalinks = (posts: CollectionEntry<'post'>[]) => {
  const entriesByRoute = new Map<string, CollectionEntry<'post'>>();

  for (const post of posts) {
    const routeKey = `${post.data.locale}:${post.data.permalink}`;
    const existingPost = entriesByRoute.get(routeKey);

    if (existingPost) {
      throw new Error(
        `Duplicate blog permalink "${post.data.permalink}" for locale "${post.data.locale}" ` +
          `in content entries "${existingPost.id}" and "${post.id}"`
      );
    }

    entriesByRoute.set(routeKey, post);
  }
};

export const getPublishedPosts = async (locale?: Locale): Promise<CollectionEntry<'post'>[]> => {
  const posts = await getCollection(
    'post',
    ({ data }) => data.draft !== true && (locale === undefined || data.locale === locale)
  );

  assertUniquePermalinks(posts);
  return posts.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
};

export const getBlogRouteDefinitions = async (locale: Locale): Promise<string[]> => {
  const posts = await getPublishedPosts(locale);
  return [...new Set(posts.map((post) => `blog/${post.data.permalink}`))];
};
