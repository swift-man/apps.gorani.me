import rss from '@astrojs/rss';
import type { Locale } from '~/config/site';
import { siteConfig } from '~/config/site';
import { getUI, localeLabels } from '~/data/i18n';
import { getPublishedPosts } from '~/data/posts';
import { absoluteUrl, localizedPath } from '~/utils/site';

const rssLanguage: Record<Locale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
};

export const createLocaleRss = async (locale: Locale) => {
  const posts = await getPublishedPosts(locale);
  const t = getUI(locale);

  return rss({
    title: `${siteConfig.siteName} Blog — ${localeLabels[locale]}`,
    description: t.blogPageDescription,
    site: absoluteUrl(siteConfig.siteUrl, localizedPath(locale)),
    customData: `<language>${rssLanguage[locale]}</language>`,
    items: posts.map((post) => ({
      link: localizedPath(locale, `blog/${post.data.permalink}`),
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.publishDate,
    })),
  });
};
