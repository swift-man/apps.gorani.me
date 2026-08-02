---
title: 'Designing difficulty for a multilingual typing game'
excerpt: 'How to turn different scripts and input rhythms into one fair difficulty curve.'
publishDate: 2026-06-24
locale: en
permalink: designing-multilingual-typing-game-difficulty
relatedApp: word-rush
author: Gorani Apps
image: /images/apps/word-rush/hero.webp
---

Word length alone is a poor difficulty measure in a multilingual typing game. Korean syllables, English spelling, and Japanese input can require different actions even when the visible strings look equally long.

## Measure input cost, not only time

A useful starting model combines several properties for each word:

```text
difficulty = inputCount × rarity × transitionCost
```

Blend that estimate with real error rates and completion times to account for differences between languages.

## Shape a readable speed curve

- Slow down immediately after introducing a new rule.
- Add a short recovery stretch before a boss stage.
- Separate failures caused by speed from failures caused by unfamiliar words.

The goal is not to make every language identical. It is to create a similar sense of focus and accomplishment in each one.
