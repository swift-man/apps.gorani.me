import { z } from 'astro/zod';

import { SUPPORTED_LOCALES, type Locale } from '~/config/site';
import { APP_SLUGS } from './app-slugs';

export const APP_STATUSES = ['released', 'coming-soon'] as const;
export const APP_THEMES = ['assetscaler', 'andromeda', 'wordrush', 'answerbychance'] as const;
export const APP_PLATFORM_GROUPS = ['macos', 'mobile', 'tv'] as const;
export const APPLE_SERVICES = ['MusicKit', 'Game Center'] as const;
export const PRIVACY_STATUSES = ['published', 'pending'] as const;

const requiredText = z.string().trim().min(1);
const positiveInteger = z.number().int().positive();
const appImagePath = z
  .string()
  .regex(/^\/images\/apps\/[a-z0-9-]+\/[a-z0-9][a-z0-9._-]*$/, 'Use a path inside /images/apps/<slug>/');

const localizedLabelShape = Object.fromEntries(SUPPORTED_LOCALES.map((locale) => [locale, requiredText])) as Record<
  Locale,
  typeof requiredText
>;

const localizedAppContentSchema = z
  .object({
    title: requiredText,
    shortDescription: requiredText,
    longDescription: requiredText,
    features: z.array(requiredText).min(1),
    steps: z
      .array(
        z
          .object({
            title: requiredText,
            description: requiredText,
          })
          .strict()
      )
      .min(1),
    faq: z
      .array(
        z
          .object({
            question: requiredText,
            answer: requiredText,
          })
          .strict()
      )
      .min(1),
    seoTitle: requiredText,
    seoDescription: requiredText,
  })
  .strict();

const localizedContentShape = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale, localizedAppContentSchema])
) as Record<Locale, typeof localizedAppContentSchema>;

export const appSchema = z
  .object({
    slug: z.enum(APP_SLUGS),
    name: requiredText,
    platform: requiredText,
    platformGroup: z.enum(APP_PLATFORM_GROUPS),
    category: requiredText,
    icon: appImagePath,
    heroImage: appImagePath,
    heroSize: z
      .object({
        width: positiveInteger,
        height: positiveInteger,
      })
      .strict(),
    screenshots: z
      .array(
        z
          .object({
            src: appImagePath,
            width: positiveInteger,
            height: positiveInteger,
            label: z.object(localizedLabelShape).strict(),
          })
          .strict()
      )
      .min(1)
      .max(8),
    ogImage: appImagePath,
    appStoreUrl: z.preprocess(
      (value) => (value === '' || value === undefined ? null : value),
      z
        .url('App Store URL must be an absolute URL')
        .refine(
          (value) => value.startsWith('https://apps.apple.com/'),
          'App Store URL must use https://apps.apple.com/'
        )
        .nullable()
    ),
    status: z.enum(APP_STATUSES),
    theme: z.enum(APP_THEMES),
    appleServices: z.array(z.enum(APPLE_SERVICES)),
    privacyStatus: z.enum(PRIVACY_STATUSES),
    content: z.object(localizedContentShape).strict(),
  })
  .strict()
  .superRefine((app, context) => {
    if (app.status === 'released' && app.appStoreUrl === null) {
      context.addIssue({
        code: 'custom',
        path: ['appStoreUrl'],
        message: 'A released app must have an App Store URL',
      });
    }

    const appImagePrefix = `/images/apps/${app.slug}/`;
    const imagePaths = [
      ['icon', app.icon],
      ['heroImage', app.heroImage],
      ['ogImage', app.ogImage],
      ...app.screenshots.map((screenshot, index) => [`screenshots.${index}.src`, screenshot.src]),
    ] as const;

    for (const [field, imagePath] of imagePaths) {
      if (!imagePath.startsWith(appImagePrefix)) {
        context.addIssue({
          code: 'custom',
          path: field.split('.'),
          message: `Image must be stored inside ${appImagePrefix}`,
        });
      }
    }
  });

export type AppInfo = z.infer<typeof appSchema>;
export type AppStatus = AppInfo['status'];
export type AppTheme = AppInfo['theme'];
export type AppPlatformGroup = AppInfo['platformGroup'];
export type LocalizedAppContent = AppInfo['content'][Locale];

export function parseApp(value: unknown, source: string): AppInfo {
  const result = appSchema.safeParse(value);
  if (!result.success) {
    throw new TypeError(`Invalid app content in ${source}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
