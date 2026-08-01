import { SUPPORTED_LOCALES, type Locale } from '~/config/site';

export const isLocale = (value: string | undefined): value is Locale =>
  Boolean(value && SUPPORTED_LOCALES.includes(value as Locale));
export const localizedPath = (locale: Locale, path = '') => {
  const normalized = path.replace(/^\/+|\/+$/g, '');
  if (locale === 'ko') return normalized ? `/${normalized}` : '/';
  return `/${locale}${normalized ? `/${normalized}` : ''}`;
};
export const appPath = (slug: string) => slug;
export const routeDefinitions = [
  '',
  'apps',
  'updates',
  'blog',
  'support',
  ...['assetscaler', 'andromeda-17k', 'word-rush', 'answer-by-chance'].flatMap((slug) => [
    slug,
    `support/${slug}`,
    `privacy/${slug}`,
  ]),
  ...['macos-app-icon-sizes', 'designing-apple-tv-wallpaper-apps', 'designing-multilingual-typing-game-difficulty'].map(
    (slug) => `blog/${slug}`
  ),
] as const;
export const formatDate = (date: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00Z`));
export const absoluteUrl = (siteUrl: string, path: string) => new URL(path, siteUrl).toString();
