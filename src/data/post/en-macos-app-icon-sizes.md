---
title: 'A practical guide to macOS app icons and image scales'
excerpt: 'A concise explanation of app-icon sizes and the roles of @1x, @2x, and @3x assets.'
publishDate: 2026-07-22
locale: en
permalink: macos-app-icon-sizes
relatedApp: assetscaler
author: Gorani Apps
image: /images/apps/assetscaler/hero.webp
---

macOS projects often require the same artwork in several sizes. The useful mental model is to separate the logical size on screen from the number of physical pixels used to draw it.

## Why scales exist

A Retina display uses more pixels to represent the same logical space. A 32-point image can therefore have several matching files:

```text
icon.png      → @1x
icon@2x.png   → @2x
icon@3x.png   → @3x
```

You will encounter @1x and @2x frequently on macOS. Preparing @3x at the same time can simplify a shared asset workflow across Apple platforms.

## Start with a strong source

- Use a source larger than your biggest export.
- Check transparent padding and edge alignment.
- Decide on naming before a batch export.

An app icon is more than a scaled-down picture. After generating the set, inspect the smallest results by eye to make sure the silhouette still reads clearly.
