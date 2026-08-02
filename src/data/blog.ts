export const blogSlugs = [
  'macos-app-icon-sizes',
  'designing-apple-tv-wallpaper-apps',
  'designing-multilingual-typing-game-difficulty',
] as const;
export type BlogSlug = (typeof blogSlugs)[number];
