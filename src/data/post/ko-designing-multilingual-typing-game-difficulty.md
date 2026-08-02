---
title: '다국어 타이핑 게임의 난이도를 설계하는 방법'
excerpt: '언어마다 다른 글자 구조와 입력 리듬을 하나의 공정한 난이도 곡선으로 만드는 방법입니다.'
publishDate: 2026-06-24
locale: ko
permalink: designing-multilingual-typing-game-difficulty
relatedApp: word-rush
author: Gorani Apps
image: /images/apps/word-rush/hero.webp
---

다국어 타이핑 게임에서 단어 길이만으로 난이도를 정하면 공정하지 않습니다. 한국어 음절, 영어 철자, 일본어 입력은 같은 글자 수라도 필요한 동작이 다릅니다.

## 시간보다 입력 비용을 측정하기

단어마다 다음 값을 함께 기록하면 난이도를 더 안정적으로 조절할 수 있습니다.

```text
difficulty = inputCount × rarity × transitionCost
```

여기에 실제 플레이에서 얻은 오답률과 평균 입력 시간을 더하면 언어별 차이를 보정할 수 있습니다.

## 좋은 속도 곡선

- 새 규칙을 소개한 직후에는 속도를 낮춥니다.
- 보스 스테이지 전에 짧은 회복 구간을 둡니다.
- 실패 원인이 속도인지 낯선 단어인지 구분합니다.

목표는 모든 언어를 똑같게 만드는 것이 아니라, 각 언어에서 비슷한 집중과 성취감을 주는 것입니다.
