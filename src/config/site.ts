import { DEFAULT_LOCALE, LOCALE_METADATA } from './locales.mjs';
import { assertIsoDate } from '../utils/iso-date.mjs';

export { DEFAULT_LOCALE, LOCALE_METADATA } from './locales.mjs';

export type Locale = keyof typeof LOCALE_METADATA;

export const SUPPORTED_LOCALES = Object.freeze(Object.keys(LOCALE_METADATA)) as readonly [Locale, ...Locale[]];

export const OPEN_GRAPH_LOCALES = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale, LOCALE_METADATA[locale].openGraphLocale])
) as Record<Locale, string>;

export const siteConfig = {
  siteName: 'Gorani Apps',
  siteDescription: 'Independent apps for Apple platforms.',
  siteUrl: import.meta.env.PUBLIC_SITE_URL || 'https://apps.gorani.me',
  developerName: 'Gorani Apps',
  supportEmail: 'jiniopening@gmail.com',
  githubUrl: 'https://github.com/swift-man/apps.gorani.me',
  defaultLocale: DEFAULT_LOCALE,
  supportedLocales: SUPPORTED_LOCALES,
  socialLinks: { github: 'https://github.com/swift-man/apps.gorani.me' },
  privacyLastUpdated: assertIsoDate('2026-08-02', 'siteConfig.privacyLastUpdated'),
  analyticsProvider: null,
  homeVideo: {
    enabled: false,
    src: '/videos/home-hero.mp4',
    poster: '/og-gorani.webp',
    autoplay: true,
    muted: true,
    loop: true,
    controls: true,
  },
} as const;
