import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceOutput = path.join(projectRoot, 'dist');
const validator = path.join(projectRoot, 'scripts', 'validate-static-output.mjs');

if (!existsSync(sourceOutput)) {
  console.error(`Build output directory does not exist: ${sourceOutput}`);
  process.exit(1);
}

const cases = [
  {
    name: 'partial locale page group allowed',
    mutateOutput: (outputDirectory) => {
      for (const file of ['index.html', 'ko/index.html']) {
        const target = path.join(outputDirectory, file);
        const html = readFileSync(target, 'utf8');
        const mutated = html.replace(
          /<link\b(?=[^>]*\brel=(?:"alternate"|'alternate'))(?=[^>]*\bhreflang=(?:"(?:en|ja)"|'(?:en|ja)'))[^>]*>/gi,
          ''
        );
        if (mutated === html) throw new Error(`${file}: partial locale fixture did not remove hreflang links`);
        writeFileSync(target, mutated);
      }

      rmSync(path.join(outputDirectory, 'en', 'index.html'));
      rmSync(path.join(outputDirectory, 'ja', 'index.html'));
      const sitemap = path.join(outputDirectory, 'sitemap-0.xml');
      const xml = readFileSync(sitemap, 'utf8');
      const mutatedXml = xml
        .replace('<url><loc>https://apps.gorani.me/en</loc></url>', '')
        .replace('<url><loc>https://apps.gorani.me/ja</loc></url>', '');
      if (mutatedXml === xml) throw new Error('partial locale fixture did not update the sitemap');
      writeFileSync(sitemap, mutatedXml);
    },
  },
  {
    name: 'commented metadata ignored',
    file: 'index.html',
    mutate: (html) =>
      html.replace(
        '</head>',
        '<!-- <link rel="canonical" href="https://apps.gorani.me/commented-canonical"> --></head>'
      ),
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
    mutate: (robots) => `${robots.trimEnd()}\nSitemap: https://apps.gorani.me/deprecated-sitemap.xml\n`,
  },
  {
    name: 'relative sitemap URL rejected',
    file: 'sitemap-index.xml',
    expectedError: 'invalid absolute URL /sitemap-0.xml',
    mutate: (xml) => xml.replace('https://apps.gorani.me/sitemap-0.xml', '/sitemap-0.xml'),
  },
  {
    name: 'relative RSS URL rejected',
    file: 'rss.xml',
    expectedError: 'invalid absolute URL /',
    mutate: (xml) => xml.replace('<link>https://apps.gorani.me/</link>', '<link>/</link>'),
  },
  {
    name: 'relative robots sitemap rejected',
    file: 'robots.txt',
    expectedError: 'invalid absolute URL /sitemap-index.xml',
    mutate: (robots) => robots.replace('https://apps.gorani.me/sitemap-index.xml', '/sitemap-index.xml'),
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
        PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL ?? 'https://apps.gorani.me',
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
