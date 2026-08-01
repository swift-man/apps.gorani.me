---
title: 'Apple TV에서 월페이퍼 앱을 설계할 때 고려할 점'
excerpt: '멀리서 보는 화면, 번인, 움직임, 음악까지 Apple TV 경험의 설계 기준을 살펴봅니다.'
publishDate: 2026-07-08
locale: ko
permalink: designing-apple-tv-wallpaper-apps
relatedApp: andromeda-17k
author: Gorani Apps
image: /images/apps/andromeda-17k/hero.webp
---

Apple TV의 화면은 손에 들고 보는 모바일 화면과 다릅니다. 사용자는 몇 미터 떨어져 있고, 앱은 오랫동안 주변에 머물 수 있습니다.

## 먼저 거리부터 생각하기

작은 라벨과 촘촘한 컨트롤은 거실에서 쉽게 사라집니다. 중요한 정보는 크고 단순하게 만들고, 포커스 이동 경로도 짧게 유지해야 합니다.

## 움직임은 배경이어야 한다

- 시선을 빼앗는 빠른 전환을 줄입니다.
- 정적인 요소가 너무 오래 같은 위치에 머물지 않도록 살핍니다.
- `prefers-reduced-motion`과 앱 내부의 효과 설정을 존중합니다.

음악을 연결할 때도 화면이 플레이어 UI처럼 복잡해지지 않도록 해야 합니다. 거실의 분위기를 보완하는 정보만 남기는 것이 핵심입니다.
