import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceOutput = path.join(projectRoot, 'dist');
const validator = path.join(projectRoot, 'scripts', 'validate-static-output.mjs');
const siteUrl = new URL(process.env.PUBLIC_SITE_URL ?? 'https://apps.gorani.me');
const absoluteUrl = (route) => new URL(route, siteUrl.origin).toString();
const partiallyTranslatedPost = 'macos-app-icon-sizes';

if (!existsSync(sourceOutput)) {
  console.error(`Build output directory does not exist: ${sourceOutput}`);
  process.exit(1);
}

const cases = [
  {
    name: 'partial locale page group allowed',
    mutateOutput: (outputDirectory) => {
      const englishRoute = `/en/blog/${partiallyTranslatedPost}`;
      const englishFile = path.join(outputDirectory, englishRoute, 'index.html');
      const html = readFileSync(englishFile, 'utf8');
      const withoutUnavailableLanguages = html.replace(
        /<link\b(?=[^>]*\brel=(?:"alternate"|'alternate'))(?=[^>]*\bhreflang=(?:"(?:ko|ja)"|'(?:ko|ja)'))[^>]*>/gi,
        ''
      );
      const mutatedHtml = withoutUnavailableLanguages.replace(
        `<link href="${absoluteUrl(`/blog/${partiallyTranslatedPost}`)}" rel="alternate" hreflang="x-default">`,
        `<link href="${absoluteUrl(englishRoute)}" rel="alternate" hreflang="x-default">`
      );
      if (mutatedHtml === html) throw new Error('partial locale fixture did not update hreflang links');
      if (mutatedHtml.includes('hreflang="ko"') || mutatedHtml.includes('hreflang="ja"')) {
        throw new Error('partial locale fixture left unavailable hreflang links');
      }
      writeFileSync(englishFile, mutatedHtml);

      rmSync(path.join(outputDirectory, 'blog', partiallyTranslatedPost), { recursive: true });
      rmSync(path.join(outputDirectory, 'ko', 'blog', partiallyTranslatedPost), { recursive: true });
      rmSync(path.join(outputDirectory, 'ja', 'blog', partiallyTranslatedPost), { recursive: true });

      const sitemap = path.join(outputDirectory, 'sitemap-0.xml');
      const xml = readFileSync(sitemap, 'utf8');
      const mutatedXml = xml
        .replace(`<url><loc>${absoluteUrl(`/blog/${partiallyTranslatedPost}`)}</loc></url>`, '')
        .replace(`<url><loc>${absoluteUrl(`/ja/blog/${partiallyTranslatedPost}`)}</loc></url>`, '');
      if (mutatedXml === xml) throw new Error('partial locale fixture did not update the sitemap');
      writeFileSync(sitemap, mutatedXml);

      removeRssItem(outputDirectory, 'rss.xml', absoluteUrl(`/blog/${partiallyTranslatedPost}/`));
      removeRssItem(outputDirectory, 'ja/rss.xml', absoluteUrl(`/ja/blog/${partiallyTranslatedPost}/`));
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
