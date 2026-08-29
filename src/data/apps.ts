import answerByChance from './apps/answer-by-chance.json';
import andromeda17K from './apps/andromeda-17k.json';
import assetScaler from './apps/assetscaler.json';
import wordRush from './apps/word-rush.json';
import { parseApp, type AppInfo } from './app-schema';
import { APP_SLUGS } from './app-slugs';

export type { AppInfo, AppPlatformGroup, AppStatus, AppTheme, LocalizedAppContent } from './app-schema';

const appSources = [
  ['assetscaler.json', assetScaler],
  ['andromeda-17k.json', andromeda17K],
  ['word-rush.json', wordRush],
  ['answer-by-chance.json', answerByChance],
] as const;

export const apps: AppInfo[] = appSources.map(([filename, app]) => parseApp(app, `src/data/apps/${filename}`));

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
