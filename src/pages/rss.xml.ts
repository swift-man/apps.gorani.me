import rss from '@astrojs/rss';
import { siteConfig } from '~/config/site';
import { getPublishedPosts } from '~/data/posts';
import { localizedPath } from '~/utils/site';

export const GET = async () => {
  const posts = await getPublishedPosts(siteConfig.defaultLocale);
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
