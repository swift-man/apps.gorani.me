import { SUPPORTED_LOCALES, siteConfig, type Locale } from '~/config/site';
import { createLocaleRss } from '~/utils/rss';

export const getStaticPaths = () =>
  SUPPORTED_LOCALES.filter((locale) => locale !== siteConfig.defaultLocale).map((locale) => ({
    params: { locale },
    props: { locale },
  }));

export const GET = ({ props }: { props: { locale: Locale } }) => createLocaleRss(props.locale);
