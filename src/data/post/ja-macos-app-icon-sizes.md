---
title: 'macOSアプリアイコンと画像倍率の実践ガイド'
excerpt: 'アプリアイコンのサイズと@1x、@2x、@3x素材の役割を分かりやすく整理します。'
publishDate: 2026-07-22
locale: ja
permalink: macos-app-icon-sizes
relatedApp: assetscaler
author: Gorani Apps
image: /images/apps/assetscaler/hero.webp
---

macOSアプリでは、同じ画像を複数のサイズで書き出す場面がよくあります。画面上の論理サイズと、描画に使われる実際のピクセル数を分けて考えることが大切です。

## 倍率が必要な理由

Retinaディスプレイは同じ領域をより多くのピクセルで表現します。32ポイントの画像なら、次のようなファイルを用意できます。

```text
icon.png      → @1x
icon@2x.png   → @2x
icon@3x.png   → @3x
```

macOSでは@1xと@2xが中心ですが、Appleプラットフォーム共通の素材管理では@3xまで一度に作ると便利です。

## 良い原本を準備する

- 最大の出力より十分に大きい原本を使います。
- 透明な余白と端の位置を確認します。
- 一括書き出し前に命名規則を決めます。

自動生成後は、特に小さいサイズを目で確認し、形が明確に見えるか確かめましょう。
