export const SUPPORTED_LOCALES = ['ko', 'en', 'ja'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const siteConfig = {
  siteName: 'Gorani Apps',
  siteDescription: 'Independent apps for Apple platforms.',
  siteUrl: import.meta.env.PUBLIC_SITE_URL || 'https://apps.gorani.me',
  developerName: 'Gorani Apps',
  supportEmail: 'jiniopening@gmail.com',
  githubUrl: 'https://github.com/swift-man/apps.gorani.me',
  defaultLocale: 'ko' as Locale,
  supportedLocales: SUPPORTED_LOCALES,
  socialLinks: { github: 'https://github.com/swift-man/apps.gorani.me' },
  privacyLastUpdated: '2026-08-02',
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
