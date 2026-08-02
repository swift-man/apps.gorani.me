# Add a Blog Post

## Steps

1. Create a new `.md` or `.mdx` file in `src/data/post/`
2. Add required frontmatter:

```yaml
---
publishDate: 2026-01-15T00:00:00Z
title: 'Your Post Title'
locale: en
permalink: your-post-title
relatedApp: assetscaler
excerpt: 'Brief description of the post'
image: '/images/blog/your-image.webp'
category: 'tutorials'
tags:
  - astro
  - tailwind
author: 'Author Name'
---
```

3. Write content in Markdown (or MDX for component embedding)
4. Run `pnpm build` to verify the post renders correctly

## Frontmatter Fields

| Field         | Required | Description                                  |
| ------------- | -------- | -------------------------------------------- |
| `title`       | Yes      | Post title                                   |
| `publishDate` | Yes      | ISO 8601 date                                |
| `updateDate`  | No       | ISO 8601 date                                |
| `draft`       | No       | Set `true` to hide from listing              |
| `excerpt`     | No       | Summary for listing pages                    |
| `image`       | No       | Public `/` path or absolute HTTPS image URL  |
| `category`    | No       | Single category string                       |
| `tags`        | No       | Array of tag strings                         |
| `author`      | No       | Author name                                  |
| `locale`      | Yes      | `ko`, `en`, or `ja`                          |
| `permalink`   | Yes      | Lowercase hyphenated slug, unique per locale |
| `relatedApp`  | Yes      | Related app slug from `src/data/apps.ts`     |

## URL Pattern

Posts use the required `permalink` value rather than the filename:

- Korean: `/blog/{permalink}`
- English: `/en/blog/{permalink}`
- Japanese: `/ja/blog/{permalink}`

## Notes

- Reading time is calculated automatically via remark plugin
- Put local post images in `public/images/` and reference them with a `/images/...` path
- `~/assets/...` aliases are not supported in post frontmatter
- Use `.mdx` extension to embed Astro components in posts
- Keep `permalink` to one path segment (`my-post`, not `guides/my-post`)
