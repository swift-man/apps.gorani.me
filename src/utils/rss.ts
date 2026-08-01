import rss from '@astrojs/rss';
import type { Locale } from '~/config/site';
import { siteConfig } from '~/config/site';
import { localeLabels } from '~/data/i18n';
import { getPublishedPosts } from '~/data/posts';
import { localizedPath } from '~/utils/site';

const rssLanguage: Record<Locale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
};

export const createLocaleRss = async (locale: Locale) => {
  const posts = await getPublishedPosts(locale);

  return rss({
    title: `${siteConfig.siteName} Blog — ${localeLabels[locale]}`,
    description: siteConfig.siteDescription,
    site: siteConfig.siteUrl,
    customData: `<language>${rssLanguage[locale]}</language>`,
    items: posts.map((post) => ({
      link: localizedPath(locale, `blog/${post.data.permalink}`),
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.publishDate,
    })),
  });
};
