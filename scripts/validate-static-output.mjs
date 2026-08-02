import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const outputDirectory = path.resolve(process.argv[2] ?? 'dist');
const siteUrl = new URL(process.env.PUBLIC_SITE_URL ?? 'https://apps.gorani.me');
const basePath = normalizePathname(process.env.PUBLIC_BASE_PATH ?? '/');
const expectedFeeds = [
  { file: 'rss.xml', language: 'ko-KR', routePrefix: '' },
  { file: 'en/rss.xml', language: 'en-US', routePrefix: '/en' },
  { file: 'ja/rss.xml', language: 'ja-JP', routePrefix: '/ja' },
];
const errors = [];

assert(siteUrl.protocol === 'https:', `PUBLIC_SITE_URL must use HTTPS, received ${siteUrl.href}`);
assert(siteUrl.pathname === '/', `PUBLIC_SITE_URL must not contain a path, received ${siteUrl.href}`);
assert(existsSync(outputDirectory), `Build output directory does not exist: ${outputDirectory}`);

if (errors.length > 0) finish();

const outputFiles = new Set(walk(outputDirectory));
const htmlFiles = [...outputFiles].filter((file) => file.endsWith('.html')).sort();
const pages = new Map();

for (const file of htmlFiles) {
  const html = readOutput(file);
  const linkTags = extractTags(html, 'link').map(parseAttributes);
  const canonicalLinks = linkTags.filter((attributes) => relIncludes(attributes.rel, 'canonical'));
  const alternates = linkTags.filter(
    (attributes) => relIncludes(attributes.rel, 'alternate') && typeof attributes.hreflang === 'string'
  );
  const route = routeForHtml(file);

  assert(canonicalLinks.length === 1, `${file}: expected exactly one canonical link, found ${canonicalLinks.length}`);
  if (canonicalLinks.length !== 1) continue;

  const canonical = normalizeSiteUrl(canonicalLinks[0].href, `${file}: canonical`);
  if (!canonical) continue;

  const expectedRoute = route === '/ko' || route.startsWith('/ko/') ? route.slice(3) || '/' : route;
  const expectedCanonical = urlForRoute(expectedRoute);
  assert(canonical === expectedCanonical, `${file}: canonical ${canonical} does not match route ${expectedCanonical}`);
  assert(resolveHtml(canonical) !== undefined, `${file}: canonical target does not exist in dist: ${canonical}`);

  const robots = extractTags(html, 'meta')
    .map(parseAttributes)
    .find((attributes) => attributes.name?.toLowerCase() === 'robots')?.content;
  const noindex =
    robots
      ?.toLowerCase()
      .split(',')
      .some((value) => value.trim() === 'noindex') ?? false;
  const alternateMap = new Map();

  for (const attributes of alternates) {
    const language = attributes.hreflang.toLowerCase();
    const href = normalizeSiteUrl(attributes.href, `${file}: hreflang ${language}`);
    assert(!alternateMap.has(language), `${file}: duplicate hreflang ${language}`);
    if (!href) continue;
    alternateMap.set(language, href);
    assert(resolveHtml(href) !== undefined, `${file}: hreflang ${language} target does not exist in dist: ${href}`);
  }

  if (alternateMap.size > 0) {
    assert(alternateMap.has('x-default'), `${file}: localized page is missing x-default hreflang`);
    const localizedTargets = [...alternateMap.entries()]
      .filter(([language]) => language !== 'x-default')
      .map(([, href]) => href);
    assert(
      localizedTargets.includes(alternateMap.get('x-default')),
      `${file}: x-default must match one of the localized hreflang targets`
    );
  }

  pages.set(file, { alternateMap, canonical, noindex, route });
}

for (const [file, page] of pages) {
  for (const [language, target] of page.alternateMap) {
    if (language === 'x-default') continue;
    const targetFile = resolveHtml(target);
    const targetPage = targetFile && pages.get(targetFile);
    assert(targetPage !== undefined, `${file}: unable to inspect hreflang target ${target}`);
    if (!targetPage) continue;
    assert(
      targetPage.canonical === target,
      `${file}: hreflang ${language} points to ${target}, whose canonical is ${targetPage.canonical}`
    );
    assert(
      [...targetPage.alternateMap.values()].includes(page.canonical),
      `${file}: hreflang target ${target} does not link back to ${page.canonical}`
    );
  }
}

const sitemapIndexFile = 'sitemap-index.xml';
assert(outputFiles.has(sitemapIndexFile), `Missing ${sitemapIndexFile}`);
const sitemapIndex = outputFiles.has(sitemapIndexFile) ? readOutput(sitemapIndexFile) : '';
const sitemapFiles = extractXmlValues(sitemapIndex, 'loc').map((value) => {
  const url = normalizeSiteUrl(value, `${sitemapIndexFile}: loc`);
  if (!url) return undefined;
  const file = resolveOutputUrl(url, ['']);
  assert(file?.endsWith('.xml'), `${sitemapIndexFile}: referenced sitemap is missing: ${url}`);
  return file;
});

const sitemapUrls = [];
for (const file of sitemapFiles.filter(Boolean)) {
  for (const value of extractXmlValues(readOutput(file), 'loc')) {
    const url = normalizeSiteUrl(value, `${file}: loc`);
    if (url) sitemapUrls.push(url);
  }
}

assert(sitemapUrls.length > 0, 'Sitemap contains no page URLs');
assert(new Set(sitemapUrls).size === sitemapUrls.length, 'Sitemap contains duplicate page URLs');

const sitemapSet = new Set(sitemapUrls);
const expectedCanonicalSet = new Set([...pages.values()].filter((page) => !page.noindex).map((page) => page.canonical));

for (const url of sitemapSet) {
  const file = resolveHtml(url);
  const page = file && pages.get(file);
  assert(page !== undefined, `Sitemap URL does not resolve to an HTML file: ${url}`);
  if (page) assert(page.canonical === url, `Sitemap URL ${url} has a different canonical: ${page.canonical}`);
  assert(!new URL(url).pathname.startsWith(`${withBase('/ko')}/`), `Sitemap must not include /ko aliases: ${url}`);
}

assertSameSet('sitemap URLs', sitemapSet, expectedCanonicalSet);

let rssItemCount = 0;
for (const feed of expectedFeeds) {
  assert(outputFiles.has(feed.file), `Missing RSS feed: ${feed.file}`);
  if (!outputFiles.has(feed.file)) continue;

  const xml = readOutput(feed.file);
  const channel = xml.match(/<channel>([\s\S]*?)<\/channel>/i)?.[1];
  assert(channel !== undefined, `${feed.file}: missing channel element`);
  if (!channel) continue;

  const itemBlocks = [...channel.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
  const channelMetadata = channel.replace(/<item>[\s\S]*?<\/item>/gi, '');
  const language = extractXmlValues(channelMetadata, 'language')[0];
  const channelLink = normalizeSiteUrl(extractXmlValues(channelMetadata, 'link')[0], `${feed.file}: channel link`);
  const expectedChannel = urlForRoute(feed.routePrefix || '/');

  assert(language === feed.language, `${feed.file}: expected language ${feed.language}, found ${language ?? 'none'}`);
  assert(
    channelLink === expectedChannel,
    `${feed.file}: channel link ${channelLink} does not match ${expectedChannel}`
  );

  const itemLinks = new Set();
  for (const [index, item] of itemBlocks.entries()) {
    const link = normalizeSiteUrl(extractXmlValues(item, 'link')[0], `${feed.file}: item ${index + 1} link`);
    const guid = normalizeSiteUrl(extractXmlValues(item, 'guid')[0], `${feed.file}: item ${index + 1} guid`);
    if (!link) continue;
    itemLinks.add(link);
    rssItemCount += 1;
    assert(guid === link, `${feed.file}: item ${index + 1} guid does not match its link`);
    const targetFile = resolveHtml(link);
    const targetPage = targetFile && pages.get(targetFile);
    assert(targetPage !== undefined, `${feed.file}: item link does not resolve to HTML: ${link}`);
    if (targetPage) assert(targetPage.canonical === link, `${feed.file}: item link is not canonical: ${link}`);
  }

  assert(itemLinks.size === itemBlocks.length, `${feed.file}: contains duplicate item links`);

  const blogPrefix = `${withBase(`${feed.routePrefix}/blog`)}/`;
  const expectedItems = new Set([...sitemapSet].filter((url) => new URL(url).pathname.startsWith(blogPrefix)));
  assertSameSet(`${feed.file} item links`, itemLinks, expectedItems);
}

const robotsFile = 'robots.txt';
assert(outputFiles.has(robotsFile), `Missing ${robotsFile}`);
if (outputFiles.has(robotsFile)) {
  const sitemapDirectives = [...readOutput(robotsFile).matchAll(/^Sitemap:\s*(\S+)\s*$/gim)].map((match) =>
    normalizeSiteUrl(match[1], `${robotsFile}: Sitemap`)
  );
  assert(
    sitemapDirectives.includes(urlForRoute('/sitemap-index.xml')),
    `${robotsFile}: missing sitemap index directive for ${urlForRoute('/sitemap-index.xml')}`
  );
}

const cnameFile = 'CNAME';
assert(outputFiles.has(cnameFile), `Missing ${cnameFile}`);
if (outputFiles.has(cnameFile)) {
  assert(readOutput(cnameFile).trim() === siteUrl.hostname, `${cnameFile}: expected ${siteUrl.hostname}`);
}

finish();

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function assertSameSet(label, actual, expected) {
  for (const value of expected) assert(actual.has(value), `${label}: missing ${value}`);
  for (const value of actual) assert(expected.has(value), `${label}: unexpected ${value}`);
}

function extractTags(source, tagName) {
  return source.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
}

function parseAttributes(tag) {
  const attributes = {};
  const pattern = /([^\s=<>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  for (const match of tag.matchAll(pattern)) attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? '';
  return attributes;
}

function relIncludes(value, expected) {
  return value?.toLowerCase().split(/\s+/).includes(expected) ?? false;
}

function extractXmlValues(source, tagName) {
  return [...source.matchAll(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'gi'))].map((match) =>
    decodeXml(match[1].trim())
  );
}

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function normalizePathname(value) {
  const normalized = `/${String(value).replace(/^\/+|\/+$/g, '')}`;
  return normalized === '/' ? '/' : normalized;
}

function withBase(route) {
  const normalizedRoute = normalizePathname(route);
  if (basePath === '/') return normalizedRoute;
  return normalizedRoute === '/' ? basePath : `${basePath}${normalizedRoute}`;
}

function urlForRoute(route) {
  const url = new URL(withBase(route), siteUrl.origin);
  return normalizeUrl(url);
}

function normalizeSiteUrl(value, context) {
  if (!value) {
    errors.push(`${context}: missing URL`);
    return undefined;
  }
  let url;
  try {
    url = new URL(value, siteUrl);
  } catch {
    errors.push(`${context}: invalid URL ${value}`);
    return undefined;
  }
  assert(url.origin === siteUrl.origin, `${context}: expected origin ${siteUrl.origin}, found ${url.origin}`);
  assert(url.search === '' && url.hash === '', `${context}: URL must not contain a query or fragment: ${url.href}`);
  return normalizeUrl(url);
}

function normalizeUrl(url) {
  const pathname = normalizePathname(url.pathname);
  return `${url.origin}${pathname === '/' ? '/' : pathname}`;
}

function routeForHtml(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return normalizePathname(file.slice(0, -'/index.html'.length));
  return normalizePathname(file.slice(0, -'.html'.length));
}

function resolveHtml(url) {
  return resolveOutputUrl(url, ['/index.html', '.html']);
}

function resolveOutputUrl(urlValue, suffixes) {
  const pathname = normalizePathname(new URL(urlValue).pathname);
  const relativePath = stripBase(pathname);
  if (relativePath === undefined) return undefined;
  if (relativePath === '/') return outputFiles.has('index.html') ? 'index.html' : undefined;
  const stem = relativePath.slice(1);
  for (const suffix of suffixes) {
    const candidate = `${stem}${suffix}`;
    if (outputFiles.has(candidate)) return candidate;
  }
  return undefined;
}

function stripBase(pathname) {
  if (basePath === '/') return pathname;
  if (pathname === basePath) return '/';
  if (pathname.startsWith(`${basePath}/`)) return pathname.slice(basePath.length);
  return undefined;
}

function readOutput(file) {
  return readFileSync(path.join(outputDirectory, file), 'utf8');
}

function walk(directory, root = directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute, root);
    return [path.relative(root, absolute).split(path.sep).join('/')];
  });
}

function finish() {
  if (errors.length > 0) {
    console.error(`Static output validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(
    `Static output validated: ${htmlFiles.length} HTML pages, ${sitemapUrls.length} sitemap URLs, ${rssItemCount} RSS items.`
  );
}
