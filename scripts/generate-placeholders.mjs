import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const themes = {
  assetscaler: {
    slug: 'assetscaler',
    name: 'AssetScaler',
    mark: 'AS',
    from: '#dbeafe',
    to: '#60a5fa',
    ink: '#10234a',
    accent: '#2563eb',
    mode: 'window',
  },
  andromeda: {
    slug: 'andromeda-17k',
    name: 'Andromeda 17K',
    mark: 'A17',
    from: '#070b2b',
    to: '#4425a7',
    ink: '#ffffff',
    accent: '#67e8f9',
    mode: 'space',
  },
  wordrush: {
    slug: 'word-rush',
    name: 'Word Rush',
    mark: 'WR',
    from: '#151719',
    to: '#343a40',
    ink: '#ffffff',
    accent: '#b7f34a',
    mode: 'game',
  },
  answer: {
    slug: 'answer-by-chance',
    name: 'AnswerByChance',
    mark: 'A?',
    from: '#f5ead7',
    to: '#c99b6b',
    ink: '#3e2b1f',
    accent: '#8b5e3c',
    mode: 'book',
  },
};

const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const stars = Array.from({ length: 46 }, (_, index) => {
  const x = ((index * 149 + 71) % 1500) + 50;
  const y = ((index * 83 + 37) % 800) + 40;
  const r = 1 + (index % 4);
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${0.25 + (index % 5) * 0.13}"/>`;
}).join('');

function artwork(theme, width, height, label, compact = false) {
  const titleSize = compact ? Math.round(width * 0.24) : Math.min(92, Math.round(width * 0.07));
  const pad = Math.round(Math.min(width, height) * 0.075);
  const rounded = Math.round(Math.min(width, height) * 0.045);
  const visual =
    theme.mode === 'space'
      ? `${stars}<ellipse cx="${width * 0.58}" cy="${height * 0.5}" rx="${width * 0.27}" ry="${height * 0.12}" fill="none" stroke="#b9a6ff" stroke-width="${Math.max(12, width * 0.016)}" opacity=".45" transform="rotate(-15 ${width * 0.58} ${height * 0.5})"/><ellipse cx="${width * 0.58}" cy="${height * 0.5}" rx="${width * 0.18}" ry="${height * 0.06}" fill="#e7dcff" opacity=".72" transform="rotate(-15 ${width * 0.58} ${height * 0.5})"/>`
      : theme.mode === 'window'
        ? `<rect x="${pad}" y="${pad * 1.35}" width="${width - pad * 2}" height="${height - pad * 2.2}" rx="${rounded}" fill="#fff" opacity=".82"/><circle cx="${pad * 1.45}" cy="${pad * 1.85}" r="${Math.max(5, width * 0.008)}" fill="#ff6b6b"/><circle cx="${pad * 1.8}" cy="${pad * 1.85}" r="${Math.max(5, width * 0.008)}" fill="#ffd166"/><circle cx="${pad * 2.15}" cy="${pad * 1.85}" r="${Math.max(5, width * 0.008)}" fill="#5cc987"/><rect x="${pad * 1.45}" y="${pad * 2.55}" width="${width * 0.34}" height="${height * 0.47}" rx="${rounded * 0.55}" fill="#dbeafe"/><rect x="${width * 0.52}" y="${pad * 2.55}" width="${width * 0.33}" height="${height * 0.11}" rx="${rounded * 0.35}" fill="#2563eb" opacity=".85"/><rect x="${width * 0.52}" y="${height * 0.46}" width="${width * 0.24}" height="${height * 0.05}" rx="${rounded * 0.25}" fill="#10234a" opacity=".16"/><rect x="${width * 0.52}" y="${height * 0.56}" width="${width * 0.3}" height="${height * 0.05}" rx="${rounded * 0.25}" fill="#10234a" opacity=".11"/>`
        : theme.mode === 'game'
          ? `<rect x="${pad}" y="${pad}" width="${width - pad * 2}" height="${height - pad * 2}" rx="${rounded}" fill="#0d0f10" opacity=".78"/><text x="50%" y="39%" text-anchor="middle" font-size="${Math.min(width * 0.12, 120)}" font-weight="800" fill="#fff">RUSH</text><rect x="22%" y="48%" width="56%" height="${Math.max(10, height * 0.025)}" rx="20" fill="#454c52"/><rect x="22%" y="48%" width="38%" height="${Math.max(10, height * 0.025)}" rx="20" fill="${theme.accent}"/><text x="50%" y="68%" text-anchor="middle" font-size="${Math.min(width * 0.065, 64)}" font-weight="700" fill="${theme.accent}">LEVEL 17</text>`
          : `<rect x="${width * 0.18}" y="${height * 0.13}" width="${width * 0.64}" height="${height * 0.74}" rx="${rounded}" fill="#fffaf0" opacity=".92"/><path d="M ${width * 0.5} ${height * 0.22} V ${height * 0.75}" stroke="#b98d5f" stroke-width="${Math.max(3, width * 0.006)}" opacity=".45"/><path d="M ${width * 0.5} ${height * 0.22} C ${width * 0.4} ${height * 0.18}, ${width * 0.28} ${height * 0.24}, ${width * 0.25} ${height * 0.28} V ${height * 0.75} C ${width * 0.36} ${height * 0.7}, ${width * 0.44} ${height * 0.72}, ${width * 0.5} ${height * 0.77}" fill="none" stroke="#8b5e3c" stroke-width="${Math.max(3, width * 0.006)}" opacity=".55"/><text x="64%" y="46%" text-anchor="middle" font-family="Georgia,serif" font-size="${Math.min(width * 0.045, 50)}" fill="#5e4330">Turn the page.</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${theme.from}"/><stop offset="1" stop-color="${theme.to}"/></linearGradient><filter id="noise"><feTurbulence baseFrequency=".75" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .045"/></feComponentTransfer></filter></defs>
    <rect width="100%" height="100%" rx="${compact ? Math.round(width * 0.22) : 0}" fill="url(#g)"/>
    <rect width="100%" height="100%" filter="url(#noise)" opacity=".5"/>
    ${compact ? `<text x="50%" y="58%" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Arial" font-weight="800" font-size="${titleSize}" fill="${theme.ink}">${escape(theme.mark)}</text>` : visual}
    ${compact ? '' : `<text x="${pad}" y="${height - pad * 0.82}" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="${Math.min(42, width * 0.03)}" font-weight="700" fill="${theme.ink}">${escape(theme.name)}</text><text x="${width - pad}" y="${height - pad * 0.82}" text-anchor="end" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="${Math.min(30, width * 0.022)}" fill="${theme.ink}" opacity=".72">${escape(label)}</text>`}
  </svg>`;
}

async function writeWebp(file, svg, width, height, quality = 88) {
  await sharp(Buffer.from(svg)).resize(width, height).webp({ quality }).toFile(file);
}

for (const theme of Object.values(themes)) {
  const dir = path.join(root, 'public', 'images', 'apps', theme.slug);
  await mkdir(dir, { recursive: true });
  await writeWebp(path.join(dir, 'icon.webp'), artwork(theme, 512, 512, '', true), 512, 512, 92);

  const heroSize = theme.mode === 'space' ? [1600, 900] : theme.mode === 'window' ? [1600, 1000] : [1200, 900];
  await writeWebp(path.join(dir, 'hero.webp'), artwork(theme, ...heroSize, 'Preview artwork'), ...heroSize);

  const screenSize = theme.mode === 'space' ? [1600, 900] : theme.mode === 'window' ? [1440, 900] : [720, 1280];
  for (let index = 1; index <= 3; index += 1) {
    await writeWebp(
      path.join(dir, `screenshot-${index}.webp`),
      artwork(theme, ...screenSize, `Screen ${index}`),
      ...screenSize
    );
  }
  await writeWebp(path.join(dir, 'og.webp'), artwork(theme, 1200, 630, 'Gorani Apps'), 1200, 630, 90);
}

const brand = {
  ...themes.assetscaler,
  name: 'Gorani Apps',
  mark: 'SM',
  from: '#101218',
  to: '#343a46',
  ink: '#ffffff',
  accent: '#9fb7ff',
  mode: 'game',
};
await mkdir(path.join(root, 'public'), { recursive: true });
await writeWebp(
  path.join(root, 'public', 'og.webp'),
  artwork(brand, 1200, 630, 'Independent apps for Apple platforms.'),
  1200,
  630,
  90
);
await sharp(Buffer.from(artwork(brand, 256, 256, '', true)))
  .resize(64, 64)
  .png()
  .toFile(path.join(root, 'public', 'favicon.png'));
await sharp(Buffer.from(artwork(brand, 512, 512, '', true)))
  .resize(180, 180)
  .png()
  .toFile(path.join(root, 'public', 'apple-touch-icon.png'));
