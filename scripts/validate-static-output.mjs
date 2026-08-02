import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { DEFAULT_LOCALE, LOCALE_METADATA } from '../src/config/locales.mjs';

const outputDirectory = path.resolve(process.argv[2] ?? 'dist');
const siteUrl = new URL(process.env.PUBLIC_SITE_URL ?? 'https://apps.gorani.me');
const basePath = normalizePathname(process.env.PUBLIC_BASE_PATH ?? '/');
const defaultLanguage = DEFAULT_LOCALE;
const supportedLanguages = new Set(Object.keys(LOCALE_METADATA));
const expectedFeeds = Object.entries(LOCALE_METADATA).map(([locale, metadata]) => {
  const isDefault = locale === defaultLanguage;
  return {
    file: isDefault ? 'rss.xml' : `${locale}/rss.xml`,
    language: metadata.rssLanguage,
    routePrefix: isDefault ? '' : `/${locale}`,
  };
});
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
  const htmlLanguage = parseAttributes(extractTags(html, 'html')[0] ?? '').lang?.toLowerCase();
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

  pages.set(file, { alternateMap, canonical, htmlLanguage, noindex, route });
}

const expectedLanguagesByRoute = new Map();
for (const [file, page] of pages) {
  if (page.noindex) continue;
  assert(
    supportedLanguages.has(page.htmlLanguage),
    `${file}: expected a supported html lang, found ${page.htmlLanguage ?? 'none'}`
  );
  const logicalRoute = logicalRouteForPage(page);
  assert(logicalRoute !== undefined, `${file}: canonical does not match its html lang: ${page.canonical}`);
  if (!logicalRoute) continue;
  page.logicalRoute = logicalRoute;
  const languages = expectedLanguagesByRoute.get(logicalRoute) ?? new Set();
  languages.add(page.htmlLanguage);
  expectedLanguagesByRoute.set(logicalRoute, languages);
}

for (const [file, page] of pages) {
  if (!page.noindex) {
    const actualLanguages = new Set([...page.alternateMap.keys()].filter((language) => language !== 'x-default'));
    const expectedLanguages = expectedLanguagesByRoute.get(page.logicalRoute) ?? new Set();
    assertSameSet(`${file}: hreflang languages`, actualLanguages, expectedLanguages);
    assert(page.alternateMap.has('x-default'), `${file}: localized page is missing x-default hreflang`);
    assert(
      page.alternateMap.get(page.htmlLanguage) === page.canonical,
      `${file}: hreflang ${page.htmlLanguage ?? 'unknown'} must match the page canonical`
    );

    const defaultTarget = page.alternateMap.get('x-default');
    const defaultTargetFile = defaultTarget && resolveHtml(defaultTarget);
    const defaultTargetPage = defaultTargetFile && pages.get(defaultTargetFile);
    assert(defaultTargetPage !== undefined, `${file}: unable to inspect x-default target ${defaultTarget ?? 'none'}`);
    if (defaultTargetPage) {
      assert(
        expectedLanguages.has(defaultTargetPage.htmlLanguage),
        `${file}: x-default target uses unavailable language ${defaultTargetPage.htmlLanguage ?? 'none'}`
      );
      assert(
        page.alternateMap.get(defaultTargetPage.htmlLanguage) === defaultTarget,
        `${file}: x-default must match a localized hreflang target`
      );
      if (expectedLanguages.has(defaultLanguage)) {
        assert(
          defaultTargetPage.htmlLanguage === defaultLanguage,
          `${file}: x-default target must use html lang ${defaultLanguage}, found ${defaultTargetPage.htmlLanguage ?? 'none'}`
        );
      }
    }
  }

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
      targetPage.htmlLanguage === language,
      `${file}: hreflang ${language} target uses html lang ${targetPage.htmlLanguage ?? 'none'}`
    );
    assert(
      targetPage.alternateMap.get(page.htmlLanguage) === page.canonical,
      `${file}: hreflang target ${target} does not link back as ${page.htmlLanguage ?? 'unknown'} to ${page.canonical}`
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
  const pathname = normalizePathname(new URL(url).pathname);
  const defaultLocaleAlias = withBase(`/${defaultLanguage}`);
  assert(page !== undefined, `Sitemap URL does not resolve to an HTML file: ${url}`);
  if (page) assert(page.canonical === url, `Sitemap URL ${url} has a different canonical: ${page.canonical}`);
  assert(
    pathname !== defaultLocaleAlias && !pathname.startsWith(`${defaultLocaleAlias}/`),
    `Sitemap must not include /${defaultLanguage} aliases: ${url}`
  );
}

assertSameSet('sitemap URLs', sitemapSet, expectedCanonicalSet);

let rssItemCount = 0;
for (const feed of expectedFeeds) {
  assert(outputFiles.has(feed.file), `Missing RSS feed: ${feed.file}`);
  if (!outputFiles.has(feed.file)) continue;

  const xml = readOutput(feed.file);
  const channel = extractOuterXmlElement(xml, 'channel');
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
  const channelFile = channelLink && resolveHtml(channelLink);
  const channelPage = channelFile && pages.get(channelFile);
  assert(channelPage !== undefined, `${feed.file}: channel link does not resolve to HTML: ${channelLink ?? 'none'}`);
  if (channelPage) {
    assert(channelPage.canonical === channelLink, `${feed.file}: channel link is not canonical: ${channelLink}`);
  }

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
  const sitemapDirectives = [...readOutput(robotsFile).matchAll(/^[ \t]*Sitemap:\s*(\S+)\s*$/gim)].map((match) =>
    normalizeSiteUrl(match[1], `${robotsFile}: Sitemap`)
  );
  const expectedSitemap = urlForRoute('/sitemap-index.xml');
  assert(
    sitemapDirectives.length === 1,
    `${robotsFile}: expected exactly one sitemap directive, found ${sitemapDirectives.length}`
  );
  assert(
    sitemapDirectives[0] === expectedSitemap,
    `${robotsFile}: expected sitemap directive ${expectedSitemap}, found ${sitemapDirectives[0] ?? 'none'}`
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
  const withoutComments = source.replace(/<!--[\s\S]*?-->/g, '');
  return withoutComments.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
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
  const decodedCdata = value.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/)?.[1] ?? value;
  const namedEntities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return decodedCdata
    .replace(/&#(?:x([0-9a-f]+)|([0-9]+));/gi, (entity, hex, decimal) => {
      const codePoint = Number.parseInt(hex ?? decimal, hex ? 16 : 10);
      return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity;
    })
    .replace(/&(amp|lt|gt|quot|apos);/g, (_entity, name) => namedEntities[name]);
}

function extractOuterXmlElement(source, tagName) {
  const openingTag = new RegExp(`<${tagName}(?:\\s[^>]*)?>`, 'i').exec(source);
  if (!openingTag) return undefined;
  const contentStart = openingTag.index + openingTag[0].length;
  const closingTags = [...source.matchAll(new RegExp(`</${tagName}\\s*>`, 'gi'))];
  const closingTag = closingTags.at(-1);
  return closingTag?.index >= contentStart ? source.slice(contentStart, closingTag.index) : undefined;
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
    url = new URL(value);
  } catch {
    errors.push(`${context}: invalid absolute URL ${value}`);
    return undefined;
  }
  assert(url.origin === siteUrl.origin, `${context}: expected origin ${siteUrl.origin}, found ${url.origin}`);
  assert(url.search === '' && url.hash === '', `${context}: URL must not contain a query or fragment: ${url.href}`);
  return normalizeUrl(url);
}

function logicalRouteForPage(page) {
  const pathname = normalizePathname(new URL(page.canonical).pathname);
  const route = stripBase(pathname);
  if (!route) return undefined;
  if (page.htmlLanguage === defaultLanguage) return route;
  const languagePrefix = `/${page.htmlLanguage}`;
  if (route === languagePrefix) return '/';
  return route.startsWith(`${languagePrefix}/`) ? normalizePathname(route.slice(languagePrefix.length)) : undefined;
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
