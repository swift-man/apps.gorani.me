import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { createServer } from 'vite';

const appDirectory = 'src/data/apps';
const appFiles = readdirSync(appDirectory)
  .filter((filename) => filename.endsWith('.json'))
  .sort();
const appFixtures = appFiles.map((filename) => ({
  filename,
  value: JSON.parse(readFileSync(path.join(appDirectory, filename), 'utf8')),
}));

const server = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  resolve: { alias: { '~': path.resolve('src') } },
  server: { middlewareMode: true },
});

try {
  const { parseApp } = await server.ssrLoadModule('/src/data/app-schema.ts');

  for (const fixture of appFixtures) {
    assert.equal(parseApp(fixture.value, fixture.filename).slug, fixture.value.slug);
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

  const { apps } = await server.ssrLoadModule('/src/data/apps.ts');
  assert.equal(apps.length, appFiles.length, 'The app catalog must load every configured JSON file');

  console.log(
    `App content validation passed: ${appFiles.length} valid files and ${invalidCases.length} invalid cases.`
  );
} finally {
  await server.close();
}
