import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteConfig } from '~/config/site';
import { localizedPath } from '~/utils/site';

export const GET = async () => {
  const posts = (await getCollection('post')).filter((post) => post.data.locale === siteConfig.defaultLocale);
  return rss({
    title: `${siteConfig.siteName} Blog`,
    description: siteConfig.siteDescription,
    site: siteConfig.siteUrl,
    items: posts.map((post) => ({
      link: localizedPath(post.data.locale, `blog/${post.data.permalink}`),
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.publishDate,
    })),
  });
};
