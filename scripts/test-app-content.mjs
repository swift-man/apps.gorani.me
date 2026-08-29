import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';
import { createServer } from 'vite';

const appDirectory = 'src/data/apps';
const appFiles = readdirSync(appDirectory)
  .filter((filename) => filename.endsWith('.json'))
  .sort();
const appFixtures = appFiles.map((filename) => ({
  filename,
  value: JSON.parse(readFileSync(path.join(appDirectory, filename), 'utf8')),
}));

const ogImageSize = { width: 1200, height: 630 };
const publicFile = (webPath) => path.join('public', webPath.replace(/^\/+/, ''));

async function validateAppAssets(app) {
  const referencedImages = [app.icon, app.heroImage, app.ogImage, ...app.screenshots.map(({ src }) => src)];
  for (const imagePath of referencedImages) {
    assert.ok(existsSync(publicFile(imagePath)), `Missing app image: ${imagePath}`);
  }

  const dimensionedImages = [
    { src: app.heroImage, ...app.heroSize },
    { src: app.ogImage, ...ogImageSize },
    ...app.screenshots.map(({ src, width, height }) => ({ src, width, height })),
  ];
  for (const image of dimensionedImages) {
    const metadata = await sharp(publicFile(image.src)).metadata();
    assert.equal(metadata.width, image.width, `${image.src} width must match its JSON value`);
    assert.equal(metadata.height, image.height, `${image.src} height must match its JSON value`);
  }
}

const server = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  resolve: { alias: { '~': path.resolve('src') } },
  server: { middlewareMode: true },
});

try {
  const { parseApp } = await server.ssrLoadModule('/src/data/app-schema.ts');

  for (const fixture of appFixtures) {
    const app = parseApp(fixture.value, fixture.filename);
    assert.equal(app.slug, fixture.value.slug);
    await validateAppAssets(app);
  }

  const baseApp = appFixtures[0].value;
  const invalidCases = [
    {
      name: 'released app without App Store URL',
      mutate(app) {
        app.status = 'released';
        app.appStoreUrl = null;
      },
    },
    {
      name: 'missing locale',
      mutate(app) {
        delete app.content.ja;
      },
    },
    {
      name: 'coming-soon app with App Store URL',
      mutate(app) {
        app.status = 'coming-soon';
        app.appStoreUrl = 'https://apps.apple.com/app/id1234567890';
      },
    },
    {
      name: 'image outside the app folder',
      mutate(app) {
        app.icon = '/images/apps/another-app/icon.webp';
      },
    },
    {
      name: 'non-positive image width',
      mutate(app) {
        app.heroSize.width = 0;
      },
    },
    {
      name: 'unknown CMS field',
      mutate(app) {
        app.unmanagedField = true;
      },
    },
  ];

  for (const invalidCase of invalidCases) {
    const app = structuredClone(baseApp);
    invalidCase.mutate(app);
    assert.throws(
      () => parseApp(app, invalidCase.name),
      (error) => error instanceof TypeError && error.message.startsWith(`Invalid app content in ${invalidCase.name}:`)
    );
  }

  const missingAssetApp = parseApp(structuredClone(baseApp), 'missing asset case');
  missingAssetApp.heroImage = `/images/apps/${missingAssetApp.slug}/missing.webp`;
  await assert.rejects(() => validateAppAssets(missingAssetApp), /Missing app image/);

  const incorrectDimensionsApp = parseApp(structuredClone(baseApp), 'incorrect dimensions case');
  incorrectDimensionsApp.heroSize.width += 1;
  await assert.rejects(() => validateAppAssets(incorrectDimensionsApp), /width must match its JSON value/);

  const incorrectOgImageApp = parseApp(structuredClone(baseApp), 'incorrect OG image case');
  incorrectOgImageApp.ogImage = incorrectOgImageApp.heroImage;
  await assert.rejects(() => validateAppAssets(incorrectOgImageApp), /width must match its JSON value/);

  const { apps } = await server.ssrLoadModule('/src/data/apps.ts');
  assert.equal(apps.length, appFiles.length, 'The app catalog must load every configured JSON file');

  console.log(
    `App content validation passed: ${appFiles.length} valid files, ${invalidCases.length} schema failures, and 3 asset failures.`
  );
} finally {
  await server.close();
}
