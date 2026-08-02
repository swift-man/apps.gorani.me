import { DEFAULT_LOCALE, LOCALE_METADATA, SUPPORTED_LOCALES, type Locale } from '~/config/site';
import { apps } from '~/data/apps';

const dateFormatters = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [
    locale,
    new Intl.DateTimeFormat(LOCALE_METADATA[locale].dateLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }),
  ])
) as Record<Locale, Intl.DateTimeFormat>;

export const isLocale = (value: string | undefined): value is Locale =>
  Boolean(value && SUPPORTED_LOCALES.includes(value as Locale));
export const localizedPath = (locale: Locale, path = '') => {
  const normalized = path.replace(/^\/+|\/+$/g, '');
  if (locale === DEFAULT_LOCALE) return normalized ? `/${normalized}` : '/';
  return `/${locale}${normalized ? `/${normalized}` : ''}`;
};
export const appPath = (slug: string) => slug;
export const routeDefinitions = [
  '',
  'apps',
  'updates',
  'blog',
  'support',
  'privacy',
  ...apps.flatMap((app) => [
    app.slug,
    `support/${app.slug}`,
    ...(app.privacyStatus === 'published' ? [`privacy/${app.slug}`] : []),
  ]),
] as const;
export const formatDate = (date: string, locale: Locale) =>
  dateFormatters[locale].format(new Date(`${date}T00:00:00Z`));
export const absoluteUrl = (siteUrl: string, path: string) => new URL(path, siteUrl).toString();
