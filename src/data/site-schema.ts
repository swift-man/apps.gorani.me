import { z } from 'astro/zod';

export const HOME_VIDEO_SOURCE_MODES = ['upload', 'external'] as const;

const LOCAL_VIDEO_PATH_PATTERN = /^\/videos\/[a-z0-9][a-z0-9._-]*\.mp4$/i;

const emptyStringWhenMissing = <Schema extends z.ZodType<string>>(schema: Schema) =>
  z.preprocess((value) => (value === null || value === undefined ? '' : value), schema);

const optionalLocalVideoPath = emptyStringWhenMissing(
  z
    .string()
    .trim()
    .refine((value) => {
      if (value === '') return true;
      return LOCAL_VIDEO_PATH_PATTERN.test(value);
    }, 'Uploaded video must be a URL-safe MP4 filename inside /videos/')
);

const optionalHttpsUrl = emptyStringWhenMissing(
  z
    .string()
    .trim()
    .refine((value) => {
      if (value === '') return true;
      try {
        return new URL(value).protocol === 'https:';
      } catch {
        return false;
      }
    }, 'External video URL must be an absolute HTTPS URL')
);

const optionalPublicPath = emptyStringWhenMissing(
  z
    .string()
    .trim()
    .refine((value) => {
      if (value === '') return true;
      if (!value.startsWith('/') || value.startsWith('//')) return false;

      const pathSegments = value.slice(1).split('/');
      return pathSegments.every(
        (segment) => segment !== '' && segment !== '.' && segment !== '..' && /^[a-z0-9._-]+$/i.test(segment)
      );
    }, 'Poster must be a URL-safe root-relative public path')
);

export const siteContentSchema = z
  .object({
    homeVideo: z
      .object({
        enabled: z.boolean(),
        sourceMode: z.enum(HOME_VIDEO_SOURCE_MODES),
        uploadedFile: optionalLocalVideoPath,
        externalUrl: optionalHttpsUrl,
        poster: optionalPublicPath,
        autoplay: z.boolean(),
        muted: z.boolean(),
        loop: z.boolean(),
        controls: z.boolean(),
      })
      .strict(),
  })
  .strict()
  .superRefine(({ homeVideo }, context) => {
    const selectedSource = resolveHomeVideoSource(homeVideo);

    if (homeVideo.enabled && selectedSource === '') {
      context.addIssue({
        code: 'custom',
        path: ['homeVideo', homeVideo.sourceMode === 'upload' ? 'uploadedFile' : 'externalUrl'],
        message: `Enabled home video requires a ${homeVideo.sourceMode} source`,
      });
    }

    if (homeVideo.enabled && homeVideo.autoplay && !homeVideo.muted) {
      context.addIssue({
        code: 'custom',
        path: ['homeVideo', 'muted'],
        message: 'Autoplay home video must be muted for browser compatibility',
      });
    }

    if (homeVideo.enabled && !homeVideo.autoplay && !homeVideo.controls) {
      context.addIssue({
        code: 'custom',
        path: ['homeVideo', 'controls'],
        message: 'Enabled home video requires autoplay or playback controls',
      });
    }
  });

export type SiteContent = z.infer<typeof siteContentSchema>;
export type HomeVideo = SiteContent['homeVideo'];

export function resolveHomeVideoSource(homeVideo: Pick<HomeVideo, 'sourceMode' | 'uploadedFile' | 'externalUrl'>) {
  return homeVideo.sourceMode === 'upload' ? homeVideo.uploadedFile : homeVideo.externalUrl;
}

export function parseSiteContent(value: unknown, source: string): SiteContent {
  const result = siteContentSchema.safeParse(value);
  if (!result.success) {
    throw new TypeError(`Invalid site content in ${source}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
