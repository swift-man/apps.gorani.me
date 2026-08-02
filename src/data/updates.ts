import type { Locale } from '~/config/site';
import type { AppSlug } from './app-slugs';

export interface AppUpdate {
  appSlug: AppSlug;
  version: string;
  date: string;
  changes: Record<Locale, string[]>;
}

const rawUpdates: AppUpdate[] = [
  {
    appSlug: 'andromeda-17k',
    version: '1.2.1',
    date: '2026-08-01',
    changes: {
      ko: ['성능 및 안정성을 개선했습니다.'],
      en: ['Improved performance and stability.'],
      ja: ['パフォーマンスと安定性を改善しました。'],
    },
  },
  {
    appSlug: 'word-rush',
    version: '1.3.0',
    date: '2026-07-31',
    changes: {
      ko: ['6라운드부터 선택할 수 있는 카드 아이템을 추가했습니다.', '날짜별 플레이 기록 기능을 추가했습니다.'],
      en: ['Added card items that can be selected from round 6.', 'Added play history organized by date.'],
      ja: ['ラウンド6から選べるカードアイテムを追加しました。', '日付別のプレイ履歴を追加しました。'],
    },
  },
  {
    appSlug: 'assetscaler',
    version: '1.0.0',
    date: '2026-07-31',
    changes: {
      ko: ['AssetScaler의 첫 App Store 버전을 출시했습니다.'],
      en: ['Released the first App Store version of AssetScaler.'],
      ja: ['AssetScalerの初回App Storeバージョンを公開しました。'],
    },
  },
];

export const updates = rawUpdates.sort((a, b) => b.date.localeCompare(a.date));
