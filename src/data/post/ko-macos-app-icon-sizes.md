---
title: 'macOS 앱 아이콘 크기와 이미지 배율 정리'
excerpt: '앱 아이콘과 @1x, @2x, @3x 이미지가 각각 어떤 역할을 하는지 실무 관점에서 정리합니다.'
publishDate: 2026-07-22
locale: ko
permalink: macos-app-icon-sizes
relatedApp: assetscaler
author: Gorani Apps
image: /images/apps/assetscaler/hero.webp
---

macOS 앱을 만들다 보면 같은 그림을 여러 크기로 내보내야 하는 순간이 자주 생깁니다. 핵심은 화면에 보이는 크기와 실제 픽셀 수를 분리해서 생각하는 것입니다.

## 배율은 왜 필요한가

Retina 디스플레이에서는 같은 논리적 크기를 더 많은 픽셀로 표현합니다. 예를 들어 32포인트 영역에 들어가는 이미지는 배율에 따라 다음처럼 준비할 수 있습니다.

```text
icon.png      → @1x
icon@2x.png   → @2x
icon@3x.png   → @3x
```

macOS에서는 주로 @1x와 @2x를 만나지만, 여러 Apple 플랫폼에서 같은 원본을 관리한다면 @3x까지 한 번에 준비하는 흐름이 편리합니다.

## 좋은 원본을 준비하는 법

- 가장 큰 출력보다 충분히 큰 원본을 사용합니다.
- 투명 영역과 모서리 여백을 미리 확인합니다.
- 반복 내보내기 전에 파일 이름 규칙을 정합니다.

앱 아이콘은 단순한 축소 이미지가 아니라 작은 크기에서도 형태가 선명해야 합니다. 자동 생성 후에도 16px과 32px 결과를 직접 확인하는 것이 좋습니다.
