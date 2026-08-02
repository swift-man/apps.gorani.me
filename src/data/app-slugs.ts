export const APP_SLUGS = ['assetscaler', 'andromeda-17k', 'word-rush', 'answer-by-chance'] as const;

export type AppSlug = (typeof APP_SLUGS)[number];
