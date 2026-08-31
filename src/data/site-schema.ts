import { z } from 'astro/zod';

export const HOME_VIDEO_SOURCE_MODES = ['upload', 'external'] as const;
export const HOME_VIDEO_POSTER_EXTENSIONS = ['avif', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'webp'] as const;

const LOCAL_VIDEO_PATH_PATTERN = /^\/videos\/[a-z0-9][a-z0-9._-]*\.mp4$/i;
function isKnownVideoPageUrl(url: URL): boolean {
  const hostname = url.hostname.toLowerCase();
  const isYoutubeHost =
    hostname === 'youtube.com' ||
    hostname.endsWith('.youtube.com') ||
    hostname === 'youtube-nocookie.com' ||
    hostname.endsWith('.youtube-nocookie.com') ||
    hostname === 'youtu.be';
  const isVimeoPageHost = hostname === 'vimeo.com' || hostname === 'www.vimeo.com';
  const isVimeoEmbedPage =
    hostname === 'player.vimeo.com' && !url.pathname.startsWith('/progressive_redirect/playback/');

  return isYoutubeHost || isVimeoPageHost || isVimeoEmbedPage;
}

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
        const url = new URL(value);
        return url.protocol === 'https:' && !isKnownVideoPageUrl(url);
      } catch {
        return false;
      }
    }, 'External video URL must be a direct HTTPS media URL, not a YouTube or Vimeo page')
);

const optionalPublicPath = emptyStringWhenMissing(
  z
    .string()
    .trim()
    .refine((value) => {
      if (value === '') return true;
      if (!value.startsWith('/') || value.startsWith('//')) return false;

      const pathSegments = value.slice(1).split('/');
      const hasSafeSegments = pathSegments.every(
        (segment) => segment !== '' && segment !== '.' && segment !== '..' && /^[a-z0-9._-]+$/i.test(segment)
      );
      const filename = pathSegments.at(-1) ?? '';
      const extensionSeparator = filename.lastIndexOf('.');
      if (!hasSafeSegments || extensionSeparator <= 0 || extensionSeparator === filename.length - 1) return false;

      const extension = filename.slice(extensionSeparator + 1).toLowerCase();
      return HOME_VIDEO_POSTER_EXTENSIONS.some((allowed) => allowed === extension);
    }, 'Poster must be a URL-safe root-relative image path')
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
