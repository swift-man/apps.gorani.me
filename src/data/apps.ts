import { parseApp, type AppInfo } from './app-schema';
import { APP_SLUGS } from './app-slugs';

export type { AppInfo, AppPlatformGroup, AppStatus, AppTheme, LocalizedAppContent } from './app-schema';

const appSources = import.meta.glob('./apps/*.json', { eager: true, import: 'default' });

export const apps: AppInfo[] = Object.entries(appSources)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([filename, app]) => parseApp(app, `src/data/${filename.replace(/^\.\//, '')}`));

const configuredAppSlugs = new Set(apps.map((app) => app.slug));
if (configuredAppSlugs.size !== apps.length) {
  throw new Error('Duplicate app slug found in the app catalog');
}
for (const slug of APP_SLUGS) {
  if (!configuredAppSlugs.has(slug)) {
    throw new Error(`Missing app configuration for slug "${slug}"`);
  }
}

export const getApp = (slug: string) => apps.find((app) => app.slug === slug);
