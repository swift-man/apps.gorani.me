import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';
import { createServer } from 'vite';

const siteSource = JSON.parse(readFileSync('src/data/site.json', 'utf8'));
const publicFile = (webPath) => path.join('public', webPath.replace(/^\/+/, ''));

function createVideoDouble({ autoplay = true, controls = false, playResult = Promise.resolve() } = {}) {
  let pauseCalls = 0;
  let playCalls = 0;
  const video = {
    dataset: { autoplay: String(autoplay), controls: String(controls) },
    autoplay: false,
    controls: true,
    pause() {
      pauseCalls += 1;
    },
    play() {
      playCalls += 1;
      return playResult;
    },
  };

  return {
    video,
    get pauseCalls() {
      return pauseCalls;
    },
    get playCalls() {
      return playCalls;
    },
  };
}

async function validateSiteAssets(
  site,
  { fileExists = existsSync, readImageMetadata = (filePath) => sharp(filePath).metadata() } = {}
) {
  if (site.homeVideo.poster) {
    const posterPath = publicFile(site.homeVideo.poster);
    assert.ok(fileExists(posterPath), `Missing home video poster: ${site.homeVideo.poster}`);
    try {
      const metadata = await readImageMetadata(posterPath);
      assert.ok(metadata.format, `Unreadable home video poster: ${site.homeVideo.poster}`);
    } catch {
      assert.fail(`Unreadable home video poster: ${site.homeVideo.poster}`);
    }
  }

  if (site.homeVideo.enabled && site.homeVideo.sourceMode === 'upload') {
    assert.ok(
      fileExists(publicFile(site.homeVideo.uploadedFile)),
      `Missing uploaded home video: ${site.homeVideo.uploadedFile}`
    );
  }
}

const server = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  resolve: { alias: { '~': path.resolve('src') } },
  server: { middlewareMode: true },
});

try {
  const { parseSiteContent, resolveHomeVideoSource } = await server.ssrLoadModule('/src/data/site-schema.ts');
  const { applyHomeVideoPreference, setupHomeVideos } = await server.ssrLoadModule('/src/scripts/home-video.ts');
  const site = parseSiteContent(siteSource, 'src/data/site.json');

  assert.equal(resolveHomeVideoSource(site.homeVideo), site.homeVideo.uploadedFile);
  await validateSiteAssets(site);

  const externalSite = structuredClone(siteSource);
  externalSite.homeVideo.enabled = true;
  externalSite.homeVideo.sourceMode = 'external';
  externalSite.homeVideo.externalUrl = 'https://media.example.com/home.mp4';
  const parsedExternalSite = parseSiteContent(externalSite, 'external source case');
  assert.equal(resolveHomeVideoSource(parsedExternalSite.homeVideo), 'https://media.example.com/home.mp4');

  const signedExternalSite = structuredClone(externalSite);
  signedExternalSite.homeVideo.externalUrl = 'https://cdn.example.com/video?id=signed-token';
  assert.doesNotThrow(() => parseSiteContent(signedExternalSite, 'signed external source case'));

  const vimeoDirectSite = structuredClone(externalSite);
  vimeoDirectSite.homeVideo.externalUrl = 'https://player.vimeo.com/progressive_redirect/playback/example?token=signed';
  assert.doesNotThrow(() => parseSiteContent(vimeoDirectSite, 'Vimeo direct playback source case'));

  const clearedOptionalFields = structuredClone(siteSource);
  clearedOptionalFields.homeVideo.uploadedFile = null;
  clearedOptionalFields.homeVideo.externalUrl = null;
  clearedOptionalFields.homeVideo.poster = null;
  const parsedClearedFields = parseSiteContent(clearedOptionalFields, 'cleared optional fields');
  assert.equal(parsedClearedFields.homeVideo.uploadedFile, '');
  assert.equal(parsedClearedFields.homeVideo.externalUrl, '');
  assert.equal(parsedClearedFields.homeVideo.poster, '');
  await validateSiteAssets(parsedClearedFields);

  const enabledUpload = structuredClone(siteSource);
  enabledUpload.homeVideo.enabled = true;
  const parsedEnabledUpload = parseSiteContent(enabledUpload, 'enabled upload case');
  await assert.doesNotReject(() =>
    validateSiteAssets(parsedEnabledUpload, {
      fileExists: (filePath) => (filePath.endsWith('home-hero.mp4') ? true : existsSync(filePath)),
    })
  );

  const autoplayWithoutControls = structuredClone(siteSource);
  autoplayWithoutControls.homeVideo.enabled = true;
  autoplayWithoutControls.homeVideo.controls = false;
  assert.doesNotThrow(() => parseSiteContent(autoplayWithoutControls, 'autoplay without controls'));

  const reducedMotionVideo = createVideoDouble({ controls: false });
  await applyHomeVideoPreference(reducedMotionVideo.video, { matches: true });
  assert.equal(reducedMotionVideo.video.autoplay, false);
  assert.equal(reducedMotionVideo.video.controls, true);
  assert.equal(reducedMotionVideo.playCalls, 0);
  assert.equal(reducedMotionVideo.pauseCalls, 1);

  const allowedAutoplayVideo = createVideoDouble({ controls: false });
  await applyHomeVideoPreference(allowedAutoplayVideo.video, { matches: false });
  assert.equal(allowedAutoplayVideo.video.autoplay, true);
  assert.equal(allowedAutoplayVideo.video.controls, false);
  assert.equal(allowedAutoplayVideo.playCalls, 1);

  const blockedAutoplayVideo = createVideoDouble({
    controls: false,
    playResult: Promise.reject(new DOMException('Autoplay blocked', 'NotAllowedError')),
  });
  await applyHomeVideoPreference(blockedAutoplayVideo.video, { matches: false });
  assert.equal(blockedAutoplayVideo.video.controls, true);
  assert.equal(blockedAutoplayVideo.playCalls, 1);

  const manualPlaybackVideo = createVideoDouble({ autoplay: false, controls: true });
  await applyHomeVideoPreference(manualPlaybackVideo.video, { matches: false });
  assert.equal(manualPlaybackVideo.video.autoplay, false);
  assert.equal(manualPlaybackVideo.video.controls, true);
  assert.equal(manualPlaybackVideo.playCalls, 0);

  const runtimePreferenceVideo = createVideoDouble({ controls: false });
  let preferenceChangeHandler;
  let removedPreferenceHandler;
  const motionPreference = {
    matches: false,
    addEventListener(eventName, handler) {
      assert.equal(eventName, 'change');
      preferenceChangeHandler = handler;
    },
    removeEventListener(eventName, handler) {
      assert.equal(eventName, 'change');
      removedPreferenceHandler = handler;
    },
  };
  const disposeHomeVideos = setupHomeVideos(
    { querySelectorAll: () => [runtimePreferenceVideo.video] },
    motionPreference
  );
  await Promise.resolve();
  motionPreference.matches = true;
  preferenceChangeHandler();
  assert.equal(runtimePreferenceVideo.video.autoplay, false);
  assert.equal(runtimePreferenceVideo.video.controls, true);
  assert.equal(runtimePreferenceVideo.pauseCalls, 1);
  disposeHomeVideos();
  assert.equal(removedPreferenceHandler, preferenceChangeHandler);

  let emptyListenerRegistrations = 0;
  const disposeEmptyHomeVideos = setupHomeVideos(
    { querySelectorAll: () => [] },
    {
      matches: false,
      addEventListener() {
        emptyListenerRegistrations += 1;
      },
      removeEventListener() {
        emptyListenerRegistrations += 1;
      },
    }
  );
  disposeEmptyHomeVideos();
  assert.equal(emptyListenerRegistrations, 0);

  const invalidCases = [
    {
      name: 'enabled upload without a file',
      mutate(value) {
        value.homeVideo.enabled = true;
        value.homeVideo.sourceMode = 'upload';
        value.homeVideo.uploadedFile = '';
      },
    },
    {
      name: 'enabled external source without a URL',
      mutate(value) {
        value.homeVideo.enabled = true;
        value.homeVideo.sourceMode = 'external';
        value.homeVideo.externalUrl = '';
      },
    },
    {
      name: 'insecure external URL',
      mutate(value) {
        value.homeVideo.externalUrl = 'http://media.example.com/home.mp4';
      },
    },
    {
      name: 'YouTube page URL',
      mutate(value) {
        value.homeVideo.externalUrl = 'https://www.youtube.com/watch?v=example';
      },
    },
    {
      name: 'Vimeo page URL',
      mutate(value) {
        value.homeVideo.externalUrl = 'https://vimeo.com/123456';
      },
    },
    {
      name: 'Vimeo embed page URL',
      mutate(value) {
        value.homeVideo.externalUrl = 'https://player.vimeo.com/video/123456';
      },
    },
    {
      name: 'upload outside the videos directory',
      mutate(value) {
        value.homeVideo.uploadedFile = '/files/home.mp4';
      },
    },
    {
      name: 'upload path traversal',
      mutate(value) {
        value.homeVideo.uploadedFile = '/videos/../private.mp4';
      },
    },
    {
      name: 'upload filename with URL reserved characters',
      mutate(value) {
        value.homeVideo.uploadedFile = '/videos/hero#2.mp4';
      },
    },
    {
      name: 'protocol-relative poster URL',
      mutate(value) {
        value.homeVideo.poster = '//media.example.com/poster.webp';
      },
    },
    {
      name: 'poster path without an image extension',
      mutate(value) {
        value.homeVideo.poster = '/robots.txt';
      },
    },
    {
      name: 'poster filename without an extension separator',
      mutate(value) {
        value.homeVideo.poster = '/images/png';
      },
    },
    {
      name: 'autoplay with sound',
      mutate(value) {
        value.homeVideo.enabled = true;
        value.homeVideo.autoplay = true;
        value.homeVideo.muted = false;
      },
    },
    {
      name: 'enabled video without autoplay or controls',
      mutate(value) {
        value.homeVideo.enabled = true;
        value.homeVideo.autoplay = false;
        value.homeVideo.controls = false;
      },
    },
  ];

  for (const invalidCase of invalidCases) {
    const value = structuredClone(siteSource);
    invalidCase.mutate(value);
    assert.throws(
      () => parseSiteContent(value, invalidCase.name),
      (error) => error instanceof TypeError && error.message.startsWith(`Invalid site content in ${invalidCase.name}:`)
    );
  }

  const missingUpload = structuredClone(siteSource);
  missingUpload.homeVideo.enabled = true;
  missingUpload.homeVideo.uploadedFile = '/videos/missing.mp4';
  await assert.rejects(
    () => validateSiteAssets(parseSiteContent(missingUpload, 'missing upload')),
    /Missing uploaded home video/
  );

  const missingPoster = structuredClone(siteSource);
  missingPoster.homeVideo.poster = '/images/missing-poster.webp';
  await assert.rejects(
    () => validateSiteAssets(parseSiteContent(missingPoster, 'missing poster')),
    /Missing home video poster/
  );

  const unreadablePoster = parseSiteContent(siteSource, 'unreadable poster');
  await assert.rejects(
    () =>
      validateSiteAssets(unreadablePoster, {
        readImageMetadata: async () => {
          throw new Error('Invalid image data');
        },
      }),
    /Unreadable home video poster/
  );

  console.log(
    `Site content validation passed: upload and external sources, playback preferences, ${invalidCases.length} schema failures, and 3 asset failures.`
  );
} finally {
  await server.close();
}
