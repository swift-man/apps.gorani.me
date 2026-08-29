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

const appFiles = readdirSync('src/data/apps')
  .filter((filename) => filename.endsWith('.json'))
  .sort();

assert.ok(appFiles.length > 0, 'Pages CMS requires at least one app JSON file');

function resolveFields(field) {
  if (field.component) {
    const component = config.components?.[field.component];
    assert.ok(component, `Unknown Pages CMS component: ${field.component}`);
    return component.fields;
  }
  return field.fields;
}

function assertEditorCoversValue(fields, value, fieldPath) {
  assert.ok(Array.isArray(fields), `${fieldPath} must define editor fields`);
  assert.deepEqual(
    new Set(Object.keys(value)),
    new Set(fields.map((field) => field.name)),
    `${fieldPath} fields must match the Pages CMS editor schema`
  );

  for (const field of fields) {
    const fieldValue = value[field.name];
    const nestedFields = resolveFields(field);
    if (!nestedFields) continue;

    if (Array.isArray(fieldValue)) {
      for (const [index, item] of fieldValue.entries()) {
        assertEditorCoversValue(nestedFields, item, `${fieldPath}.${field.name}[${index}]`);
      }
    } else {
      assertEditorCoversValue(nestedFields, fieldValue, `${fieldPath}.${field.name}`);
    }
  }
}

const contentField = appCollection.fields.find((field) => field.name === 'content');
assert.deepEqual(
  new Set(contentField.fields.map((field) => field.name)),
  new Set(Object.keys(LOCALE_METADATA)),
  'Pages CMS content locales must match the site locale configuration'
);

for (const filename of appFiles) {
  const app = JSON.parse(readFileSync(path.join('src/data/apps', filename), 'utf8'));
  assert.equal(app.slug, filename.replace(/\.json$/, ''), `${filename} slug must match its filename`);
  assertEditorCoversValue(appCollection.fields, app, filename);
  assert.deepEqual(
    new Set(Object.keys(app.content)),
    new Set(Object.keys(LOCALE_METADATA)),
    `${filename} must contain every configured locale`
  );
}

console.log(`Pages CMS configuration validated for ${appFiles.length} app files.`);
