import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { createServer } from 'vite';

const siteSource = JSON.parse(readFileSync('src/data/site.json', 'utf8'));
const homePageSource = readFileSync('src/views/HomePage.astro', 'utf8');
const publicFile = (webPath) => path.join('public', webPath.replace(/^\/+/, ''));

function validateSiteAssets(site, fileExists = existsSync) {
  if (site.homeVideo.poster) {
    assert.ok(fileExists(publicFile(site.homeVideo.poster)), `Missing home video poster: ${site.homeVideo.poster}`);
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
  const site = parseSiteContent(siteSource, 'src/data/site.json');

  assert.equal(resolveHomeVideoSource(site.homeVideo), site.homeVideo.uploadedFile);
  validateSiteAssets(site);

  const externalSite = structuredClone(siteSource);
  externalSite.homeVideo.enabled = true;
  externalSite.homeVideo.sourceMode = 'external';
  externalSite.homeVideo.externalUrl = 'https://media.example.com/home.mp4';
  const parsedExternalSite = parseSiteContent(externalSite, 'external source case');
  assert.equal(resolveHomeVideoSource(parsedExternalSite.homeVideo), 'https://media.example.com/home.mp4');

  const clearedOptionalFields = structuredClone(siteSource);
  clearedOptionalFields.homeVideo.uploadedFile = null;
  clearedOptionalFields.homeVideo.externalUrl = null;
  clearedOptionalFields.homeVideo.poster = null;
  const parsedClearedFields = parseSiteContent(clearedOptionalFields, 'cleared optional fields');
  assert.equal(parsedClearedFields.homeVideo.uploadedFile, '');
  assert.equal(parsedClearedFields.homeVideo.externalUrl, '');
  assert.equal(parsedClearedFields.homeVideo.poster, '');
  validateSiteAssets(parsedClearedFields);

  const enabledUpload = structuredClone(siteSource);
  enabledUpload.homeVideo.enabled = true;
  const parsedEnabledUpload = parseSiteContent(enabledUpload, 'enabled upload case');
  assert.doesNotThrow(() =>
    validateSiteAssets(parsedEnabledUpload, (filePath) =>
      filePath.endsWith('home-hero.mp4') ? true : existsSync(filePath)
    )
  );

  const autoplayWithoutControls = structuredClone(siteSource);
  autoplayWithoutControls.homeVideo.enabled = true;
  autoplayWithoutControls.homeVideo.controls = false;
  assert.doesNotThrow(() => parseSiteContent(autoplayWithoutControls, 'autoplay without controls'));
  assert.match(
    homePageSource,
    /video\.autoplay = false;\s+video\.controls = true;\s+video\.pause\(\);/,
    'Reduced-motion handling must stop autoplay and expose playback controls'
  );

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
  assert.throws(
    () => validateSiteAssets(parseSiteContent(missingUpload, 'missing upload')),
    /Missing uploaded home video/
  );

  const missingPoster = structuredClone(siteSource);
  missingPoster.homeVideo.poster = '/images/missing-poster.webp';
  assert.throws(
    () => validateSiteAssets(parseSiteContent(missingPoster, 'missing poster')),
    /Missing home video poster/
  );

  console.log(
    `Site content validation passed: upload and external sources, ${invalidCases.length} schema failures, and 2 asset failures.`
  );
} finally {
  await server.close();
}
