export const serializeJsonLd = (data: Record<string, unknown> | Record<string, unknown>[]) =>
  JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
