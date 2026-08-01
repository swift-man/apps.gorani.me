import type { Locale } from '~/config/site';

export type AppStatus = 'released' | 'coming-soon';
export type AppTheme = 'assetscaler' | 'andromeda' | 'wordrush' | 'answerbychance';
export type AppPlatformGroup = 'macos' | 'mobile' | 'tv';

export interface LocalizedAppContent {
  title: string;
  shortDescription: string;
  longDescription: string;
  features: string[];
  steps: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
  seoTitle: string;
  seoDescription: string;
}

export interface AppInfo {
  slug: string;
  name: string;
  platform: string;
  platformGroup: AppPlatformGroup;
  category: string;
  icon: string;
  heroImage: string;
  heroSize: { width: number; height: number };
  screenshots: { src: string; width: number; height: number; label: Record<Locale, string> }[];
  ogImage: string;
  appStoreUrl: string | null;
  status: AppStatus;
  theme: AppTheme;
  appleServices: ('MusicKit' | 'Game Center')[];
  privacyStatus: 'published' | 'pending';
  content: Record<Locale, LocalizedAppContent>;
}

const screenshots = (slug: string, width: number, height: number, labels: Record<Locale, string>) =>
  [1, 2, 3].map((number) => ({
    src: `/images/apps/${slug}/screenshot-${number}.webp`,
    width,
    height,
    label: { ko: `${labels.ko} ${number}`, en: `${labels.en} ${number}`, ja: `${labels.ja} ${number}` },
  }));

export const apps: AppInfo[] = [
  {
    slug: 'assetscaler',
    name: 'AssetScaler',
    platform: 'macOS',
    platformGroup: 'macos',
    category: 'Developer Tools',
    icon: '/images/apps/assetscaler/icon.webp',
    heroImage: '/images/apps/assetscaler/hero.webp',
    heroSize: { width: 1600, height: 1000 },
    screenshots: screenshots('assetscaler', 1440, 900, {
      ko: 'AssetScaler 작업 화면',
      en: 'AssetScaler workflow',
      ja: 'AssetScalerの画面',
    }),
    ogImage: '/images/apps/assetscaler/og.webp',
    appStoreUrl: 'https://apps.apple.com/app/id6788854131',
    status: 'released',
    theme: 'assetscaler',
    appleServices: [],
    privacyStatus: 'published',
    content: {
      ko: {
        title: '한 번 드래그하고, 모든 크기를 만드세요.',
        shortDescription:
          '이미지를 드래그하여 @1x, @2x, @3x 리소스와 macOS 앱 아이콘을 빠르게 생성하는 이미지 도구입니다.',
        longDescription:
          '반복적인 이미지 리사이징과 파일 정리를 하나의 네이티브 macOS 흐름으로 줄입니다. 원본을 놓으면 필요한 배율과 앱 아이콘을 정돈된 결과물로 내보낼 수 있습니다.',
        features: [
          '드래그 앤 드롭 작업 흐름',
          '@1x, @2x, @3x 자동 생성',
          'macOS 앱 아이콘 생성',
          '배율별 폴더 자동 정리',
          'macOS에 자연스러운 네이티브 경험',
        ],
        steps: [
          { title: '원본을 놓으세요', description: '고해상도 이미지를 작업 영역으로 드래그합니다.' },
          { title: '필요한 출력을 고르세요', description: '이미지 배율 또는 macOS 앱 아이콘 세트를 선택합니다.' },
          { title: '정리된 파일을 받으세요', description: '결과물을 폴더 구조와 함께 내보냅니다.' },
        ],
        faq: [
          {
            question: '어떤 이미지를 사용할 수 있나요?',
            answer:
              '일반적인 이미지 형식을 기준으로 설계되었습니다. 정확한 지원 형식은 App Store의 최신 설명을 확인해 주세요.',
          },
          {
            question: '@1x, @2x, @3x를 한 번에 만들 수 있나요?',
            answer: '네. 같은 원본에서 여러 배율의 리소스를 만드는 것이 핵심 흐름입니다.',
          },
          {
            question: '원본 파일도 변경되나요?',
            answer: '내보내기 전에 원본과 저장 위치를 확인하고, 중요한 파일은 별도로 보관하는 것을 권장합니다.',
          },
        ],
        seoTitle: 'AssetScaler for macOS — Gorani Apps',
        seoDescription:
          '드래그 앤 드롭으로 @1x, @2x, @3x 이미지와 macOS 앱 아이콘을 생성하는 네이티브 macOS 도구입니다.',
      },
      en: {
        title: 'Drag once. Get every scale.',
        shortDescription:
          'A native macOS utility for generating @1x, @2x, @3x image assets and macOS app icons with drag and drop.',
        longDescription:
          'Turn repetitive image resizing and file organization into one focused Mac workflow. Drop in a source image and export the scales or app-icon set you need.',
        features: [
          'Drag and drop workflow',
          '@1x, @2x, @3x generation',
          'macOS app icon generation',
          'Organized export folders',
          'Native macOS experience',
        ],
        steps: [
          { title: 'Drop your source', description: 'Drag a high-resolution image into the workspace.' },
          { title: 'Choose the output', description: 'Select image scales or a macOS app-icon set.' },
          { title: 'Export it organized', description: 'Save the generated files in a tidy folder structure.' },
        ],
        faq: [
          {
            question: 'Which image formats are supported?',
            answer:
              'The app is designed around common image formats. Check the latest App Store listing for current compatibility.',
          },
          {
            question: 'Can it create all three scales at once?',
            answer: 'Yes. Generating multiple scales from one source is the core workflow.',
          },
          {
            question: 'Does it change the original file?',
            answer:
              'Review the chosen export location before saving and keep a separate copy of important source files.',
          },
        ],
        seoTitle: 'AssetScaler for macOS — Gorani Apps',
        seoDescription:
          'A native macOS utility for generating @1x, @2x, @3x assets and macOS app icons with drag and drop.',
      },
      ja: {
        title: '一度ドラッグして、すべてのサイズを。',
        shortDescription: '画像をドラッグするだけで、@1x、@2x、@3x素材やmacOSアプリアイコンを生成できるツールです。',
        longDescription:
          '繰り返しのリサイズとファイル整理を、ひとつのネイティブなMacワークフローにまとめます。原本を置き、必要な倍率やアイコンセットを整理して書き出せます。',
        features: [
          'ドラッグ＆ドロップ',
          '@1x・@2x・@3xを生成',
          'macOSアプリアイコン生成',
          '書き出しフォルダを整理',
          'macOSらしい操作感',
        ],
        steps: [
          { title: '原本を置く', description: '高解像度画像をワークスペースへドラッグします。' },
          { title: '出力を選ぶ', description: '画像倍率またはmacOSアイコンセットを選びます。' },
          { title: '整理して保存', description: '生成したファイルを分かりやすいフォルダに書き出します。' },
        ],
        faq: [
          {
            question: 'どの画像形式に対応していますか？',
            answer: '一般的な画像形式を想定しています。最新の対応状況はApp Storeの説明をご確認ください。',
          },
          {
            question: '3つの倍率を同時に作れますか？',
            answer: 'はい。ひとつの原本から複数の倍率を生成することが中心機能です。',
          },
          {
            question: '原本は変更されますか？',
            answer: '保存先を確認し、大切な原本は別途保管することをおすすめします。',
          },
        ],
        seoTitle: 'AssetScaler for macOS — Gorani Apps',
        seoDescription: 'ドラッグ＆ドロップで@1x、@2x、@3x画像とmacOSアプリアイコンを生成するネイティブMacアプリです。',
      },
    },
  },
  {
    slug: 'andromeda-17k',
    name: 'Andromeda 17K',
    platform: 'Apple TV',
    platformGroup: 'tv',
    category: 'Entertainment',
    icon: '/images/apps/andromeda-17k/icon.webp',
    heroImage: '/images/apps/andromeda-17k/hero.webp',
    heroSize: { width: 1600, height: 900 },
    screenshots: screenshots('andromeda-17k', 1600, 900, {
      ko: 'Andromeda 17K 화면',
      en: 'Andromeda 17K view',
      ja: 'Andromeda 17Kの画面',
    }),
    ogImage: '/images/apps/andromeda-17k/og.webp',
    appStoreUrl: 'https://apps.apple.com/app/id6786789129',
    status: 'released',
    theme: 'andromeda',
    appleServices: ['MusicKit'],
    privacyStatus: 'published',
    content: {
      ko: {
        title: '거실에서 만나는 가장 가까운 은하.',
        shortDescription:
          '초고해상도 안드로메다 은하 이미지, 시계, 별빛 효과와 Apple Music을 함께 즐길 수 있는 Apple TV 앱입니다.',
        longDescription:
          '큰 화면을 조용한 우주의 창으로 바꿉니다. 은하를 감상하고, 시간과 음악을 곁들이며, 거실의 분위기에 맞는 화면을 구성할 수 있습니다.',
        features: ['초고해상도 안드로메다 뷰', '시계 표시', '별빛 애니메이션', '월페이퍼 모드', 'Apple Music 연동'],
        steps: [
          { title: '은하를 여세요', description: 'Apple TV에서 Andromeda 17K를 시작합니다.' },
          { title: '분위기를 고르세요', description: '시계, 별빛 효과와 화면 구성을 조절합니다.' },
          { title: '음악과 함께 감상하세요', description: '원하는 경우 Apple Music 경험을 화면과 함께 즐깁니다.' },
        ],
        faq: [
          { question: 'Apple TV 전용 앱인가요?', answer: '현재 안내된 주요 플랫폼은 Apple TV입니다.' },
          {
            question: 'Apple Music이 꼭 필요한가요?',
            answer:
              '음악 연동은 선택적인 경험입니다. 서비스 이용에는 Apple 계정과 해당 지역의 이용 조건이 적용될 수 있습니다.',
          },
          {
            question: '화면이 계속 움직이나요?',
            answer: '별빛 같은 시각 효과와 화면 모드는 앱 설정에 따라 다를 수 있습니다.',
          },
        ],
        seoTitle: 'Andromeda 17K for Apple TV — Gorani Apps',
        seoDescription: '초고해상도 안드로메다 은하와 시계, 별빛 효과, Apple Music을 즐기는 Apple TV 앱입니다.',
      },
      en: {
        title: 'A nearby galaxy for your living room.',
        shortDescription:
          'Explore Andromeda in ultra-high resolution with a clock, starlight effects, wallpaper mode, and Apple Music integration.',
        longDescription:
          'Turn the largest screen in the room into a quiet window on space. Pair the galaxy with time, subtle motion, and music to shape the atmosphere around you.',
        features: [
          'Ultra-high-resolution Andromeda view',
          'Clock display',
          'Starlight animation',
          'Wallpaper mode',
          'Apple Music integration',
        ],
        steps: [
          { title: 'Open the galaxy', description: 'Launch Andromeda 17K on Apple TV.' },
          { title: 'Set the atmosphere', description: 'Adjust the clock, starlight effects, and viewing mode.' },
          { title: 'Pair it with music', description: 'Optionally bring an Apple Music experience into the room.' },
        ],
        faq: [
          {
            question: 'Is it made for Apple TV?',
            answer: 'Apple TV is the primary platform currently described for the app.',
          },
          {
            question: 'Do I need Apple Music?',
            answer:
              'Music integration is optional. Account, subscription, and regional availability requirements may apply.',
          },
          {
            question: 'Is the image always animated?',
            answer: 'Visual effects and viewing modes can vary with the settings available in the current version.',
          },
        ],
        seoTitle: 'Andromeda 17K for Apple TV — Gorani Apps',
        seoDescription:
          'Explore Andromeda in ultra-high resolution with a clock, subtle starlight effects, and Apple Music on Apple TV.',
      },
      ja: {
        title: 'リビングで出会う、いちばん近い銀河。',
        shortDescription:
          '超高解像度のアンドロメダ銀河、時計、星明かりの演出、Apple Musicを楽しめるApple TVアプリです。',
        longDescription:
          '部屋で一番大きな画面を、静かな宇宙の窓に変えます。銀河に時刻や穏やかな動き、音楽を重ね、リビングの空気を整えます。',
        features: ['超高解像度アンドロメダ', '時計表示', '星明かりアニメーション', '壁紙モード', 'Apple Music連携'],
        steps: [
          { title: '銀河を開く', description: 'Apple TVでAndromeda 17Kを起動します。' },
          { title: '雰囲気を選ぶ', description: '時計、星明かり、表示モードを調整します。' },
          { title: '音楽と楽しむ', description: '必要に応じてApple Musicの体験を組み合わせます。' },
        ],
        faq: [
          { question: 'Apple TV専用ですか？', answer: '現在案内している主なプラットフォームはApple TVです。' },
          {
            question: 'Apple Musicは必要ですか？',
            answer: '音楽連携は任意です。アカウント、購読、地域ごとの利用条件が適用される場合があります。',
          },
          {
            question: '画面は常に動きますか？',
            answer: '視覚効果や表示モードは、現在のバージョンで利用できる設定により異なります。',
          },
        ],
        seoTitle: 'Andromeda 17K for Apple TV — Gorani Apps',
        seoDescription: '超高解像度のアンドロメダ銀河、時計、星明かり、Apple Musicを楽しめるApple TVアプリです。',
      },
    },
  },
  {
    slug: 'word-rush',
    name: 'Word Rush',
    platform: 'iPhone & iPad',
    platformGroup: 'mobile',
    category: 'Games',
    icon: '/images/apps/word-rush/icon.webp',
    heroImage: '/images/apps/word-rush/hero.webp',
    heroSize: { width: 1200, height: 900 },
    screenshots: screenshots('word-rush', 720, 1280, {
      ko: 'Word Rush 게임 화면',
      en: 'Word Rush game screen',
      ja: 'Word Rushのゲーム画面',
    }),
    ogImage: '/images/apps/word-rush/og.webp',
    appStoreUrl: 'https://apps.apple.com/app/id6778007028',
    status: 'released',
    theme: 'wordrush',
    appleServices: ['Game Center'],
    privacyStatus: 'published',
    content: {
      ko: {
        title: '생각보다 손가락이 먼저 움직이는 게임.',
        shortDescription:
          '한국어, 영어, 일본어 단어를 빠르게 입력하며 반응 속도와 타이핑 실력을 시험하는 스피드 타이핑 게임입니다.',
        longDescription:
          '짧은 단어에서 시작해 점점 빨라지는 50개 레벨과 보스 스테이지를 통과하세요. 언어를 바꾸면 익숙한 타이핑도 새로운 리듬으로 느껴집니다.',
        features: ['한국어, 영어, 일본어', '50개 레벨', '보스 스테이지', '점점 빨라지는 속도', '점수 도전'],
        steps: [
          { title: '언어를 고르세요', description: '한국어, 영어 또는 일본어 단어로 시작합니다.' },
          { title: '단어를 빠르게 입력하세요', description: '화면의 단어를 정확하게 입력해 흐름을 이어갑니다.' },
          { title: '보스와 기록에 도전하세요', description: '높아지는 속도를 견디며 최고 점수를 갱신합니다.' },
        ],
        faq: [
          {
            question: '몇 개 언어를 지원하나요?',
            answer: '게임 콘텐츠는 한국어, 영어, 일본어 단어를 중심으로 구성됩니다.',
          },
          { question: '레벨은 몇 개인가요?', answer: '현재 소개 기준으로 50개 레벨과 보스 스테이지가 있습니다.' },
          {
            question: '외부 키보드를 사용할 수 있나요?',
            answer: '기기와 현재 앱 버전에 따른 입력 지원 범위는 App Store의 최신 설명을 확인해 주세요.',
          },
        ],
        seoTitle: 'Word Rush for iPhone & iPad — Gorani Apps',
        seoDescription:
          '한국어, 영어, 일본어 단어로 반응 속도와 타이핑 실력을 시험하는 50레벨 스피드 타이핑 게임입니다.',
      },
      en: {
        title: 'Type before you have time to think.',
        shortDescription:
          'A fast-paced typing game featuring Korean, English, and Japanese words across increasingly challenging levels.',
        longDescription:
          'Start with short words, then push through 50 levels and boss stages that keep getting faster. Switch languages to give familiar typing a completely different rhythm.',
        features: ['Korean, English, and Japanese', '50 levels', 'Boss stages', 'Increasing speed', 'Score challenge'],
        steps: [
          { title: 'Choose a language', description: 'Play with Korean, English, or Japanese words.' },
          { title: 'Type with precision', description: 'Enter each word accurately to keep your run moving.' },
          { title: 'Beat the boss and your score', description: 'Handle the rising pace and set a new personal best.' },
        ],
        faq: [
          {
            question: 'Which languages are included?',
            answer: 'The game is built around Korean, English, and Japanese word sets.',
          },
          {
            question: 'How many levels are there?',
            answer: 'The current product description includes 50 levels and boss stages.',
          },
          {
            question: 'Can I use an external keyboard?',
            answer:
              'Input support can depend on the device and current app version. Check the latest App Store details.',
          },
        ],
        seoTitle: 'Word Rush for iPhone & iPad — Gorani Apps',
        seoDescription:
          'A 50-level speed typing game with Korean, English, and Japanese words, boss stages, and score challenges.',
      },
      ja: {
        title: '考えるより先に、指が動く。',
        shortDescription: '韓国語、英語、日本語の単語を素早く入力して楽しむスピードタイピングゲームです。',
        longDescription:
          '短い単語から始まり、だんだん速くなる50レベルとボスステージに挑戦します。言語を変えると、慣れたタイピングにも新しいリズムが生まれます。',
        features: ['韓国語・英語・日本語', '50レベル', 'ボスステージ', '上がり続ける速度', 'スコアチャレンジ'],
        steps: [
          { title: '言語を選ぶ', description: '韓国語、英語、日本語の単語から選びます。' },
          { title: 'すばやく正確に入力', description: '表示された単語を正確に入力して流れをつなぎます。' },
          { title: 'ボスと記録に挑戦', description: '速くなるテンポを乗り越え、ベストスコアを更新します。' },
        ],
        faq: [
          { question: '何言語に対応していますか？', answer: '韓国語、英語、日本語の単語を中心に構成されています。' },
          { question: 'レベルはいくつありますか？', answer: '現在の紹介では50レベルとボスステージがあります。' },
          {
            question: '外付けキーボードは使えますか？',
            answer: '入力対応は端末と現在のアプリバージョンにより異なります。最新のApp Store情報をご確認ください。',
          },
        ],
        seoTitle: 'Word Rush for iPhone & iPad — Gorani Apps',
        seoDescription: '韓国語、英語、日本語の単語、50レベル、ボスステージを楽しむスピードタイピングゲームです。',
      },
    },
  },
  {
    slug: 'answer-by-chance',
    name: 'AnswerByChance',
    platform: 'iPhone & iPad',
    platformGroup: 'mobile',
    category: 'Lifestyle',
    icon: '/images/apps/answer-by-chance/icon.webp',
    heroImage: '/images/apps/answer-by-chance/hero.webp',
    heroSize: { width: 1200, height: 900 },
    screenshots: screenshots('answer-by-chance', 720, 1280, {
      ko: 'AnswerByChance 화면',
      en: 'AnswerByChance screen',
      ja: 'AnswerByChanceの画面',
    }),
    ogImage: '/images/apps/answer-by-chance/og.webp',
    appStoreUrl: null,
    status: 'coming-soon',
    theme: 'answerbychance',
    appleServices: [],
    privacyStatus: 'pending',
    content: {
      ko: {
        title: '질문을 품고, 한 페이지를 넘겨보세요.',
        shortDescription: '마음속 질문을 떠올리고 책장을 넘기듯 한 줄의 답을 만나는 감성적인 앱입니다.',
        longDescription:
          '정답을 단정하는 대신 잠시 생각할 여백을 건넵니다. 조용히 질문을 떠올리고 페이지를 넘겨, 지금의 마음에 닿는 한 문장을 만나보세요.',
        features: [
          '한 줄의 답',
          '페이지 컬 인터랙션',
          '한국어, 영어, 일본어',
          '차분한 읽기 경험',
          '마음에 드는 답 저장',
        ],
        steps: [
          { title: '질문을 떠올리세요', description: '지금 마음에 머무는 질문에 잠시 집중합니다.' },
          { title: '페이지를 넘기세요', description: '책장을 넘기는 듯한 동작으로 한 줄을 엽니다.' },
          { title: '마음에 남으면 저장하세요', description: '다시 읽고 싶은 문장을 모아둘 수 있습니다.' },
        ],
        faq: [
          {
            question: '점술 앱인가요?',
            answer:
              '미래나 사실을 단정하는 도구가 아니라, 질문을 다른 각도에서 바라보게 돕는 차분한 읽기 경험을 지향합니다.',
          },
          {
            question: '언제 출시되나요?',
            answer: '현재 Coming Soon 상태입니다. 출시 일정과 App Store 링크는 확정되는 대로 업데이트됩니다.',
          },
          {
            question: '답을 저장할 수 있나요?',
            answer: '마음에 드는 한 줄을 보관하는 기능을 계획하고 있습니다. 출시 버전에서 달라질 수 있습니다.',
          },
        ],
        seoTitle: 'AnswerByChance — Gorani Apps',
        seoDescription: '질문을 떠올리고 책장을 넘기듯 한 줄의 답과 만나는 차분한 iPhone·iPad 앱입니다.',
      },
      en: {
        title: 'Hold a question. Turn a page.',
        shortDescription:
          'Think of a question and discover a thoughtful one-line answer through a page-turning experience.',
        longDescription:
          'Rather than promising certainty, the app creates a quiet moment to see your question differently. Turn a page and find a line that meets you where you are.',
        features: [
          'One-line answers',
          'Page curl interaction',
          'Korean, English, and Japanese',
          'Calm reading experience',
          'Save favorite answers',
        ],
        steps: [
          { title: 'Hold a question', description: 'Take a moment with whatever is on your mind.' },
          { title: 'Turn the page', description: 'Reveal one line through a book-like gesture.' },
          { title: 'Save what stays with you', description: 'Keep a line you may want to read again.' },
        ],
        faq: [
          {
            question: 'Is this a fortune-telling app?',
            answer:
              'It is designed as a calm reflection experience, not as a source of factual predictions or certainty.',
          },
          {
            question: 'When will it be available?',
            answer: 'The app is currently Coming Soon. Timing and an App Store link will be added when confirmed.',
          },
          {
            question: 'Can I save an answer?',
            answer: 'Saving favorite lines is planned. The exact feature may change before release.',
          },
        ],
        seoTitle: 'AnswerByChance — Gorani Apps',
        seoDescription:
          'A calm iPhone and iPad experience for holding a question, turning a page, and finding a thoughtful one-line answer.',
      },
      ja: {
        title: '問いを胸に、ページをめくる。',
        shortDescription: '心の中で質問を思い浮かべ、本をめくるように一行の答えと出会うアプリです。',
        longDescription:
          '答えを断定するのではなく、問いを別の角度から見るための静かな余白を作ります。ページをめくり、今の気持ちに触れる一行と出会ってください。',
        features: [
          '一行の答え',
          'ページカール操作',
          '韓国語・英語・日本語',
          '静かな読書体験',
          'お気に入りの答えを保存',
        ],
        steps: [
          { title: '問いを思い浮かべる', description: '心にある問いに少しだけ意識を向けます。' },
          { title: 'ページをめくる', description: '本のような操作で一行を開きます。' },
          { title: '心に残れば保存', description: 'また読みたい一行を残しておけます。' },
        ],
        faq: [
          {
            question: '占いアプリですか？',
            answer: '事実や未来を断定するものではなく、問いを違う角度から見るための静かな読書体験です。',
          },
          {
            question: 'いつ公開されますか？',
            answer: '現在はComing Soonです。時期とApp Storeリンクは確定後に更新します。',
          },
          {
            question: '答えを保存できますか？',
            answer: 'お気に入りの一行を保存する機能を予定しています。公開までに変更される場合があります。',
          },
        ],
        seoTitle: 'AnswerByChance — Gorani Apps',
        seoDescription: '問いを思い浮かべ、本をめくるように一行の答えと出会う静かなiPhone・iPadアプリです。',
      },
    },
  },
];

export const getApp = (slug: string) => apps.find((app) => app.slug === slug);
