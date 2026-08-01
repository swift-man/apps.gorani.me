import type { Locale } from '~/config/site';

export interface AppUpdate {
  appSlug: string;
  version: string;
  date: string;
  changes: Record<Locale, string[]>;
}

export const updates: AppUpdate[] = [
  {
    appSlug: 'word-rush',
    version: '1.2.0',
    date: '2026-07-28',
    changes: {
      ko: ['보스 스테이지의 속도 곡선을 다듬었습니다.', '일본어 입력 피드백을 개선했습니다.'],
      en: ['Refined the speed curve in boss stages.', 'Improved feedback for Japanese input.'],
      ja: ['ボスステージの速度カーブを調整しました。', '日本語入力のフィードバックを改善しました。'],
    },
  },
  {
    appSlug: 'assetscaler',
    version: '1.4.1',
    date: '2026-07-16',
    changes: {
      ko: ['대량 내보내기의 안정성을 높였습니다.', 'macOS 앱 아이콘 미리보기를 개선했습니다.'],
      en: ['Improved reliability for batch exports.', 'Refined the macOS app-icon preview.'],
      ja: ['一括書き出しの安定性を改善しました。', 'macOSアプリアイコンのプレビューを改善しました。'],
    },
  },
  {
    appSlug: 'andromeda-17k',
    version: '1.1.0',
    date: '2026-06-30',
    changes: {
      ko: ['새로운 시계 배치를 추가했습니다.', '별빛 효과의 밝기 조절 범위를 넓혔습니다.'],
      en: ['Added a new clock layout.', 'Expanded the brightness range for starlight effects.'],
      ja: ['新しい時計レイアウトを追加しました。', '星明かり効果の明るさ調整範囲を広げました。'],
    },
  },
  {
    appSlug: 'answer-by-chance',
    version: 'Preview 0.3',
    date: '2026-06-12',
    changes: {
      ko: ['페이지 전환 감각을 다듬고 세 언어의 예시 문장을 확장했습니다.'],
      en: ['Refined the page-turning feel and expanded sample lines in all three languages.'],
      ja: ['ページをめくる感触を調整し、3言語のサンプル文を追加しました。'],
    },
  },
].sort((a, b) => b.date.localeCompare(a.date));
