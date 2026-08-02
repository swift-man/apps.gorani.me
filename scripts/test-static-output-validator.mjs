import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEFAULT_LOCALE, LOCALE_METADATA } from '../src/config/locales.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceOutput = path.join(projectRoot, 'dist');
const validator = path.join(projectRoot, 'scripts', 'validate-static-output.mjs');
const siteUrl = new URL(process.env.PUBLIC_SITE_URL ?? 'https://apps.gorani.me');
const absoluteUrl = (route) => new URL(route, siteUrl.origin).toString();
const partiallyTranslatedPost = 'macos-app-icon-sizes';
const configuredLocales = Object.keys(LOCALE_METADATA);

if (!existsSync(sourceOutput)) {
  console.error(`Build output directory does not exist: ${sourceOutput}`);
  process.exit(1);
}

const cases = [
  {
    name: 'partial locale page group allowed',
    mutateOutput: (outputDirectory) => {
      const postPath = `blog/${partiallyTranslatedPost}`;
      const availableLocales = configuredLocales.filter((locale) =>
        existsSync(path.join(outputDirectory, outputFileForRoute(localizedRoute(locale, postPath))))
      );
      const retainedLocale = availableLocales.find((locale) => locale !== DEFAULT_LOCALE);
      if (!retainedLocale) throw new Error('partial locale fixture requires a translated non-default post');

      const removedLocales = availableLocales.filter((locale) => locale !== retainedLocale);
      if (removedLocales.length === 0) throw new Error('partial locale fixture requires at least two translations');
      const retainedRoute = localizedRoute(retainedLocale, postPath);
      const retainedFile = path.join(outputDirectory, outputFileForRoute(retainedRoute));
      const html = readFileSync(retainedFile, 'utf8');
      const removedLanguagePattern = removedLocales.map(escapeRegex).join('|');
      const withoutUnavailableLanguages = html.replace(
        new RegExp(
          `<link\\b(?=[^>]*\\brel=(?:"alternate"|'alternate'))(?=[^>]*\\bhreflang=(?:"(?:${removedLanguagePattern})"|'(?:${removedLanguagePattern})'))[^>]*>`,
          'gi'
        ),
        ''
      );
      const originalDefaultLocale = availableLocales.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : retainedLocale;
      const mutatedHtml = withoutUnavailableLanguages.replace(
        `<link href="${absoluteUrl(localizedRoute(originalDefaultLocale, postPath))}" rel="alternate" hreflang="x-default">`,
        `<link href="${absoluteUrl(retainedRoute)}" rel="alternate" hreflang="x-default">`
      );
      if (mutatedHtml === html) throw new Error('partial locale fixture did not update hreflang links');
      if (removedLocales.some((locale) => mutatedHtml.includes(`hreflang="${locale}"`))) {
        throw new Error('partial locale fixture left unavailable hreflang links');
      }
      writeFileSync(retainedFile, mutatedHtml);

      for (const locale of removedLocales) {
        for (const file of outputFilesForLocale(locale, postPath)) {
          rmSync(path.dirname(path.join(outputDirectory, file)), { recursive: true });
        }
      }

      const sitemap = path.join(outputDirectory, 'sitemap-0.xml');
      const xml = readFileSync(sitemap, 'utf8');
      const mutatedXml = removedLocales.reduce(
        (contents, locale) =>
          contents.replace(`<url><loc>${absoluteUrl(localizedRoute(locale, postPath))}</loc></url>`, ''),
        xml
      );
      if (mutatedXml === xml) throw new Error('partial locale fixture did not update the sitemap');
      writeFileSync(sitemap, mutatedXml);

      for (const locale of removedLocales) {
        removeRssItem(outputDirectory, rssFile(locale), absoluteUrl(`${localizedRoute(locale, postPath)}/`));
      }
    },
  },
  {
    name: 'commented metadata ignored',
    file: 'index.html',
    mutate: (html) =>
      html.replace('</head>', `<!-- <link rel="canonical" href="${absoluteUrl('/commented-canonical')}"> --></head>`),
  },
  {
    name: 'missing hreflang links',
    file: 'index.html',
    expectedError: 'hreflang languages: missing',
    mutate: (html) => html.replace(/<link\b(?=[^>]*\brel=(?:"alternate"|'alternate'))(?=[^>]*\bhreflang=)[^>]*>/gi, ''),
  },
  {
    name: 'swapped hreflang targets',
    file: 'index.html',
    expectedError: 'target uses html lang',
    mutate: (html) =>
      html
        .replace('hreflang="en"', 'hreflang="temporary-language"')
        .replace('hreflang="ja"', 'hreflang="en"')
        .replace('hreflang="temporary-language"', 'hreflang="ja"'),
  },
  {
    name: 'additional robots sitemap',
    file: 'robots.txt',
    expectedError: 'expected exactly one sitemap directive',
    mutate: (robots) => `${robots.trimEnd()}\nSitemap: ${absoluteUrl('/deprecated-sitemap.xml')}\n`,
  },
  {
    name: 'relative sitemap URL rejected',
    file: 'sitemap-index.xml',
    expectedError: 'invalid absolute URL /sitemap-0.xml',
    mutate: (xml) => xml.replace(absoluteUrl('/sitemap-0.xml'), '/sitemap-0.xml'),
  },
  {
    name: 'relative RSS URL rejected',
    file: 'rss.xml',
    expectedError: 'invalid absolute URL /',
    mutate: (xml) => xml.replace(`<link>${absoluteUrl('/')}</link>`, '<link>/</link>'),
  },
  {
    name: 'missing RSS channel target',
    expectedError: 'en/rss.xml: channel link does not resolve to HTML',
    mutateOutput: (outputDirectory) => {
      rmSync(path.join(outputDirectory, 'en', 'index.html'));
    },
  },
  {
    name: 'relative robots sitemap rejected',
    file: 'robots.txt',
    expectedError: 'invalid absolute URL /sitemap-index.xml',
    mutate: (robots) => robots.replace(absoluteUrl('/sitemap-index.xml'), '/sitemap-index.xml'),
  },
  {
    name: 'alternate site domain supported',
    siteUrl: 'https://preview.example',
    mutateOutput: (outputDirectory) => {
      const alternateSiteUrl = new URL('https://preview.example');
      for (const file of walk(outputDirectory)) {
        if (!/\.(?:html|txt|xml)$/.test(file) && file !== 'CNAME') continue;
        const target = path.join(outputDirectory, file);
        const contents = readFileSync(target, 'utf8');
        writeFileSync(target, contents.replaceAll(siteUrl.origin, alternateSiteUrl.origin));
      }
      writeFileSync(path.join(outputDirectory, 'CNAME'), `${alternateSiteUrl.hostname}\n`);
    },
  },
];

for (const testCase of cases) {
  const temporaryRoot = mkdtempSync(path.join(tmpdir(), 'gorani-static-validator-'));
  const outputDirectory = path.join(temporaryRoot, 'dist');

  try {
    cpSync(sourceOutput, outputDirectory, { recursive: true });
    if (testCase.mutateOutput) {
      testCase.mutateOutput(outputDirectory);
    } else {
      const target = path.join(outputDirectory, testCase.file);
      const original = readFileSync(target, 'utf8');
      const mutated = testCase.mutate(original);

      if (mutated === original) throw new Error(`${testCase.name}: fixture mutation did not change ${testCase.file}`);
      writeFileSync(target, mutated);
    }

    const result = spawnSync(process.execPath, [validator, outputDirectory], {
      cwd: projectRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        PUBLIC_SITE_URL: testCase.siteUrl ?? siteUrl.origin,
        PUBLIC_BASE_PATH: process.env.PUBLIC_BASE_PATH ?? '/',
      },
    });
    const output = `${result.stdout}${result.stderr}`;

    if (testCase.expectedError) {
      if (result.status === 0) throw new Error(`${testCase.name}: validator unexpectedly passed`);
      if (!output.includes(testCase.expectedError)) {
        throw new Error(`${testCase.name}: expected error containing "${testCase.expectedError}"\n${output}`);
      }
    } else if (result.status !== 0) {
      throw new Error(`${testCase.name}: validator unexpectedly failed\n${output}`);
    }

    console.log(`Static validator regression passed: ${testCase.name}`);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function walk(directory, root = directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute, root) : [path.relative(root, absolute).split(path.sep).join('/')];
  });
}

function removeRssItem(outputDirectory, file, link) {
  const target = path.join(outputDirectory, file);
  const xml = readFileSync(target, 'utf8');
  const item = [...xml.matchAll(/<item>[\s\S]*?<\/item>/gi)].find((match) => match[0].includes(`<link>${link}</link>`));
  if (!item) throw new Error(`${file}: partial locale fixture did not find RSS item ${link}`);
  writeFileSync(target, xml.replace(item[0], ''));
}

function localizedRoute(locale, pagePath = '') {
  const normalized = pagePath.replace(/^\/+|\/+$/g, '');
  if (locale === DEFAULT_LOCALE) return normalized ? `/${normalized}` : '/';
  return `/${locale}${normalized ? `/${normalized}` : ''}`;
}

function outputFileForRoute(route) {
  const normalized = route.replace(/^\/+|\/+$/g, '');
  return normalized ? `${normalized}/index.html` : 'index.html';
}

function outputFilesForLocale(locale, pagePath) {
  const canonical = outputFileForRoute(localizedRoute(locale, pagePath));
  if (locale !== DEFAULT_LOCALE) return [canonical];
  return [canonical, outputFileForRoute(`/${locale}/${pagePath}`)];
}

function rssFile(locale) {
  return locale === DEFAULT_LOCALE ? 'rss.xml' : `${locale}/rss.xml`;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
