import { siteConfig } from '~/config/site';
import { createLocaleRss } from '~/utils/rss';

export const GET = () => createLocaleRss(siteConfig.defaultLocale);
