import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import yaml from 'js-yaml';

import { LOCALE_METADATA } from '../src/config/locales.mjs';

const config = yaml.load(readFileSync('.pages.yml', 'utf8'));
const appCollection = config.content?.find((entry) => entry.name === 'apps');
const appMedia = config.media?.find((entry) => entry.name === 'app_images');

assert.equal(appCollection?.type, 'collection');
assert.equal(appCollection?.path, 'src/data/apps');
assert.equal(appCollection?.format, 'json');
assert.deepEqual(appCollection?.operations, { create: false, rename: false, delete: false });
assert.deepEqual(appCollection?.view?.sort, ['name']);
assert.deepEqual(appCollection?.view?.default, { sort: 'name', order: 'asc' });
assert.equal(config.settings?.content?.merge, true);
assert.equal(appMedia?.input, 'public/images/apps');
assert.equal(appMedia?.output, '/images/apps');

const configuredFields = new Set(appCollection.fields.map((field) => field.name));
const appFiles = readdirSync('src/data/apps')
  .filter((filename) => filename.endsWith('.json'))
  .sort();

assert.ok(appFiles.length > 0, 'Pages CMS requires at least one app JSON file');

for (const filename of appFiles) {
  const app = JSON.parse(readFileSync(path.join('src/data/apps', filename), 'utf8'));
  assert.equal(app.slug, filename.replace(/\.json$/, ''), `${filename} slug must match its filename`);
  assert.deepEqual(
    new Set(Object.keys(app)),
    configuredFields,
    `${filename} fields must match the Pages CMS app editor schema`
  );
  assert.deepEqual(
    new Set(Object.keys(app.content)),
    new Set(Object.keys(LOCALE_METADATA)),
    `${filename} must contain every configured locale`
  );
}

console.log(`Pages CMS configuration validated for ${appFiles.length} app files.`);
