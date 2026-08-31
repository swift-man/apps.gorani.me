import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { createServer } from 'vite';

const siteSource = JSON.parse(readFileSync('src/data/site.json', 'utf8'));
const publicFile = (webPath) => path.join('public', webPath.replace(/^\/+/, ''));

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
  assert.ok(existsSync(publicFile(site.homeVideo.poster)), `Missing home video poster: ${site.homeVideo.poster}`);

  if (site.homeVideo.enabled && site.homeVideo.sourceMode === 'upload') {
    assert.ok(
      existsSync(publicFile(site.homeVideo.uploadedFile)),
      `Missing uploaded home video: ${site.homeVideo.uploadedFile}`
    );
  }

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
      name: 'autoplay with sound',
      mutate(value) {
        value.homeVideo.enabled = true;
        value.homeVideo.autoplay = true;
        value.homeVideo.muted = false;
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

  console.log(`Site content validation passed: upload and external sources plus ${invalidCases.length} failure cases.`);
} finally {
  await server.close();
}
