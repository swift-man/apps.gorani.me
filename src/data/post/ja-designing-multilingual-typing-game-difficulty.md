---
title: '多言語タイピングゲームの難易度設計'
excerpt: '文字体系と入力リズムの違いを、公平な難易度カーブにまとめる方法です。'
publishDate: 2026-06-24
locale: ja
permalink: designing-multilingual-typing-game-difficulty
relatedApp: word-rush
author: Gorani Apps
image: /images/apps/word-rush/hero.webp
---

多言語タイピングゲームでは、単語の見た目の長さだけで難易度を決めると公平になりません。韓国語、英語、日本語では、同じ文字数でも必要な入力操作が異なります。

## 時間だけでなく入力コストを測る

単語ごとに複数の値を組み合わせると、難易度を調整しやすくなります。

```text
difficulty = inputCount × rarity × transitionCost
```

実際の誤入力率と平均時間も加え、言語間の違いを補正します。

## 読みやすい速度カーブ

- 新しいルールの直後は速度を下げます。
- ボスステージ前に短い回復区間を置きます。
- 失敗の原因が速度か、未知の単語かを分けます。

すべての言語を同じにするのではなく、それぞれで近い集中と達成感を作ることが目標です。
