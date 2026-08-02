import type { Locale } from '~/config/site';
import type { AppSlug } from './app-slugs';

export interface PrivacyCopy {
  intro: string;
  collectedInfo: string;
  permissions: string;
  payments: string;
  thirdParties: string;
  children: string;
  changes: string;
  contact: string;
}

export interface AppPrivacyPolicy {
  appSlug: AppSlug;
  disclosureUrl: string;
  content: Record<Locale, PrivacyCopy>;
}

export const privacyPolicies: AppPrivacyPolicy[] = [
  {
    appSlug: 'assetscaler',
    disclosureUrl: 'https://apps.apple.com/kr/app/assetscaler-drag-image-resize/id6788854131',
    content: {
      ko: {
        intro: '현재 App Store 개인정보 공개 내용과 출시 앱 구성을 기준으로 작성한 AssetScaler 개인정보처리방침입니다.',
        collectedInfo:
          'Firebase Analytics와 Firebase Crashlytics를 통해 기기 ID, 제품 상호 작용, 충돌 데이터 및 성능 데이터가 분석과 앱 안정성 개선 목적으로 수집될 수 있습니다. App Store에는 이 정보가 사용자 신원과 연결되지 않는 데이터로 공개되어 있습니다.',
        permissions:
          'AssetScaler는 사용자가 직접 선택하거나 드래그한 이미지와 내보내기 위치에 접근합니다. macOS가 파일 또는 폴더 접근 승인을 요청하면 시스템 화면에서 대상과 목적을 확인할 수 있습니다.',
        payments:
          '구독과 구매 상태는 Apple StoreKit을 통해 확인하고 결제는 Apple이 처리합니다. 개발자는 전체 결제 카드 정보나 개인 App Store 계정 정보를 직접 받지 않습니다.',
        thirdParties:
          '앱은 사용 통계, 충돌 분석 및 운영 설정을 위해 Google Firebase Analytics, Crashlytics 및 Remote Config를 사용하며, 구매 처리를 위해 Apple StoreKit을 사용합니다. 각 서비스의 처리에는 Google과 Apple의 개인정보 보호 기준이 적용됩니다.',
        children:
          'AssetScaler는 개발 및 디자인 작업을 위한 도구이며 아동을 주 대상으로 하지 않습니다. 앱은 이름이나 연락처를 직접 입력받지 않지만 위에 설명한 진단·분석 정보가 자동 처리될 수 있습니다.',
        changes:
          '수집 항목, 권한, 결제 방식 또는 외부 서비스가 변경되면 App Store 공개 내용과 이 방침을 함께 업데이트합니다.',
        contact: 'AssetScaler의 개인정보 처리에 관한 문의는 아래 이메일로 보내 주세요.',
      },
      en: {
        intro:
          'This AssetScaler privacy notice reflects the current App Store privacy disclosure and the released app configuration.',
        collectedInfo:
          'Firebase Analytics and Firebase Crashlytics may collect a device identifier, product interactions, crash data, and performance data for analytics and app stability. The App Store disclosure classifies this information as data not linked to your identity.',
        permissions:
          'AssetScaler accesses images and export locations that you explicitly select or drag into the app. When macOS requests file or folder access, the system prompt identifies the requested location and purpose.',
        payments:
          'Apple processes subscriptions and purchase status through StoreKit. The developer does not directly receive full payment-card details or personal App Store account information.',
        thirdParties:
          'The app uses Google Firebase Analytics, Crashlytics, and Remote Config for usage statistics, diagnostics, and operational settings, and Apple StoreKit for purchases. Google and Apple privacy practices apply to those services.',
        children:
          'AssetScaler is a developer and design utility and is not directed primarily at children. It does not ask for a name or contact details, but the diagnostic and analytics information described above may be processed automatically.',
        changes:
          'If collected data, permissions, payments, or connected services change, the App Store disclosure and this notice will be updated together.',
        contact: 'Send privacy questions about AssetScaler to the email address below.',
      },
      ja: {
        intro: '現在のApp Storeプライバシー表示と公開版アプリの構成に基づくAssetScalerのプライバシーポリシーです。',
        collectedInfo:
          'Firebase AnalyticsとFirebase Crashlyticsにより、デバイスID、製品操作、クラッシュデータ、パフォーマンスデータが分析と安定性改善のために収集される場合があります。App Storeでは、個人に関連付けられないデータとして表示されています。',
        permissions:
          'AssetScalerは、ユーザーが選択またはドラッグした画像と書き出し先にアクセスします。macOSがファイルやフォルダへのアクセスを求める場合、システム画面で対象と目的を確認できます。',
        payments:
          '購読と購入状態はApple StoreKitで確認され、支払いはAppleが処理します。開発者が完全なカード情報や個人のApp Storeアカウント情報を直接受け取ることはありません。',
        thirdParties:
          '利用統計、障害分析、運用設定のためにGoogle Firebase Analytics、Crashlytics、Remote Configを、購入処理のためにApple StoreKitを使用します。各サービスにはGoogleとAppleのプライバシー基準が適用されます。',
        children:
          'AssetScalerは開発・デザイン作業向けのツールで、子どもを主な対象としていません。氏名や連絡先の入力は求めませんが、上記の診断・分析情報が自動的に処理される場合があります。',
        changes:
          '収集項目、権限、支払い方法、外部サービスが変わる場合、App Storeの表示と本ポリシーを併せて更新します。',
        contact: 'AssetScalerのプライバシーに関するお問い合わせは、以下のメールアドレスまでお送りください。',
      },
    },
  },
  {
    appSlug: 'andromeda-17k',
    disclosureUrl:
      'https://apps.apple.com/kr/app/%EC%95%88%EB%93%9C%EB%A1%9C%EB%A9%94%EB%8B%A4-%EC%9D%80%ED%95%98-17k-%EC%8B%9C%EA%B3%84-%EC%9B%94%ED%8E%98%EC%9D%B4%ED%8D%BC/id6786789129',
    content: {
      ko: {
        intro:
          '현재 App Store 개인정보 공개 내용과 게시된 개발자 방침을 기준으로 작성한 Andromeda 17K 개인정보처리방침입니다.',
        collectedInfo:
          'Andromeda 17K는 개인정보, 사용 분석 정보, 광고 식별자 또는 진단 데이터를 수집·저장·공유하지 않습니다. App Store에도 데이터가 수집되지 않는 앱으로 공개되어 있습니다.',
        permissions:
          'Apple Music 연동 기능을 선택하면 MusicKit이 Apple Music 계정 상태와 재생 권한을 확인할 수 있습니다. 이 처리는 Apple 서비스 안에서 이루어지며 앱 개발자가 개인 Apple Music 계정 정보를 직접 받지 않습니다.',
        payments:
          '앱 구매는 App Store에서 Apple이 처리합니다. 개발자는 결제 카드 정보나 개인 App Store 계정 정보를 직접 받지 않습니다.',
        thirdParties:
          '앱은 제3자 광고, 분석 또는 추적 SDK를 사용하지 않습니다. 선택적인 Apple Music 기능과 App Store 구매에는 Apple의 약관과 개인정보 보호 기준이 적용됩니다.',
        children:
          '앱은 아동을 포함한 사용자로부터 개인정보를 고의로 수집하지 않습니다. 이메일로 문의하면 이메일 주소와 문의 내용은 답변을 위해서만 처리됩니다.',
        changes:
          '향후 데이터 수집이나 외부 서비스가 추가되면 기능을 배포하기 전에 App Store 공개 내용과 이 방침을 업데이트합니다.',
        contact: 'Andromeda 17K의 개인정보 처리에 관한 문의는 아래 이메일로 보내 주세요.',
      },
      en: {
        intro:
          'This Andromeda 17K privacy notice reflects the current App Store disclosure and the developer policy published for the app.',
        collectedInfo:
          'Andromeda 17K does not collect, store, share, or sell personal information, usage analytics, advertising identifiers, or diagnostics. Its App Store disclosure states that no data is collected.',
        permissions:
          'If you choose the Apple Music integration, MusicKit may check Apple Music account eligibility and playback authorization. Apple handles this within its service, and the developer does not directly receive personal Apple Music account information.',
        payments:
          'Apple processes the app purchase through the App Store. The developer does not directly receive payment-card details or personal App Store account information.',
        thirdParties:
          'The app does not use third-party advertising, analytics, or tracking SDKs. Apple terms and privacy practices apply to the optional Apple Music feature and App Store purchase.',
        children:
          'The app does not knowingly collect personal information from any user, including children. If you email support, the email address and message are used only to respond to the request.',
        changes:
          'If data collection or connected services are added, the App Store disclosure and this notice will be updated before that functionality is released.',
        contact: 'Send privacy questions about Andromeda 17K to the email address below.',
      },
      ja: {
        intro:
          '現在のApp Storeプライバシー表示と公開されている開発者ポリシーに基づくAndromeda 17Kのプライバシーポリシーです。',
        collectedInfo:
          'Andromeda 17Kは、個人情報、利用分析、広告識別子、診断データを収集・保存・共有・販売しません。App Storeでも「データは収集されません」と表示されています。',
        permissions:
          'Apple Music連携を選択すると、MusicKitがApple Musicアカウントの利用資格と再生権限を確認する場合があります。この処理はAppleのサービス内で行われ、開発者が個人のApple Musicアカウント情報を直接受け取ることはありません。',
        payments:
          'アプリの購入はApp StoreでAppleが処理します。開発者がカード情報や個人のApp Storeアカウント情報を直接受け取ることはありません。',
        thirdParties:
          '第三者の広告、分析、追跡SDKは使用しません。任意のApple Music機能とApp Store購入にはAppleの規約とプライバシー基準が適用されます。',
        children:
          '子どもを含むいかなるユーザーからも個人情報を意図的に収集しません。メールで問い合わせた場合、メールアドレスと内容は回答のためにのみ使用されます。',
        changes: 'データ収集や外部サービスを追加する場合、その機能の公開前にApp Storeの表示と本ポリシーを更新します。',
        contact: 'Andromeda 17Kのプライバシーに関するお問い合わせは、以下のメールアドレスまでお送りください。',
      },
    },
  },
  {
    appSlug: 'word-rush',
    disclosureUrl:
      'https://apps.apple.com/kr/app/%EC%9B%8C%EB%93%9C%EB%9F%AC%EC%8B%9C-%EC%9A%B4%EB%B9%A8-%ED%83%80%EC%9E%90%EA%B2%8C%EC%9E%84/id6778007028',
    content: {
      ko: {
        intro: '현재 App Store 개인정보 공개 내용과 게시된 워드러시 개인정보처리방침을 기준으로 작성한 안내입니다.',
        collectedInfo:
          'Firebase를 통해 게임 진행 정보 같은 사용자 콘텐츠, 사용자·기기 식별자, 충돌·성능·기타 진단 데이터가 앱 기능과 분석 목적으로 수집될 수 있습니다. App Store에는 이 정보가 사용자 신원과 연결되지 않는 데이터로 공개되어 있습니다.',
        permissions:
          '앱은 회원가입을 요구하지 않으며 이름, 이메일, 전화번호, 위치, 연락처, 사진, 카메라 또는 마이크 정보를 앱 화면에서 직접 수집하지 않습니다. 게임 중 입력과 진행 정보는 기능 제공 및 이용 분석을 위해 처리될 수 있습니다.',
        payments:
          '현재 App Store 공개 버전은 무료이며 별도의 구독이나 앱 내 결제가 표시되어 있지 않습니다. 향후 결제 기능이 추가되면 Apple의 App Store 결제 시스템을 사용하고 이 방침을 먼저 업데이트합니다.',
        thirdParties:
          '앱은 이용 통계와 오류 분석을 위해 Google Firebase Analytics와 Firebase Crashlytics를 사용합니다. 관련 정보는 Google 또는 하위 처리업체의 서버에서 처리될 수 있으며 Google의 개인정보 보호 기준과 보관 설정이 적용됩니다.',
        children:
          '앱은 회원가입이나 이름·연락처의 직접 입력을 요구하지 않습니다. 다만 아동이 사용하는 경우에도 위에 설명한 Firebase 이용 로그와 진단 정보가 자동 수집될 수 있습니다.',
        changes:
          '수집 항목, Firebase 구성, 결제 또는 앱 기능이 변경되면 App Store 공개 내용과 이 방침을 함께 업데이트합니다.',
        contact: '워드러시의 개인정보 처리에 관한 문의와 권리 행사는 아래 이메일로 보내 주세요.',
      },
      en: {
        intro:
          'This notice reflects the current App Store privacy disclosure and the privacy policy published for Word Rush.',
        collectedInfo:
          'Firebase may collect user content such as gameplay activity, user and device identifiers, crash data, performance data, and other diagnostics for app functionality and analytics. The App Store disclosure classifies this information as data not linked to your identity.',
        permissions:
          'The app does not require account registration or directly ask for a name, email address, phone number, location, contacts, photos, camera, or microphone data. Gameplay input and progress may be processed to provide features and understand app usage.',
        payments:
          'The current App Store version is free and does not list a subscription or in-app purchase. If payments are added later, Apple App Store billing will be used and this notice will be updated first.',
        thirdParties:
          'The app uses Google Firebase Analytics and Firebase Crashlytics for usage statistics and diagnostics. Related information may be processed on Google or subprocessors’ servers under Google privacy practices and retention settings.',
        children:
          'The app does not require registration or directly request a child’s name or contact details. The Firebase usage and diagnostic information described above may still be collected automatically when a child uses the app.',
        changes:
          'If collected data, Firebase configuration, payments, or app features change, the App Store disclosure and this notice will be updated together.',
        contact: 'Send privacy questions or rights requests about Word Rush to the email address below.',
      },
      ja: {
        intro: '現在のApp Storeプライバシー表示と公開されているWord Rushのプライバシーポリシーに基づく案内です。',
        collectedInfo:
          'Firebaseにより、ゲーム進行などのユーザーコンテンツ、ユーザー・デバイス識別子、クラッシュ、パフォーマンス、その他の診断データがアプリ機能と分析のために収集される場合があります。App Storeでは個人に関連付けられないデータとして表示されています。',
        permissions:
          'アカウント登録は不要で、氏名、メールアドレス、電話番号、位置情報、連絡先、写真、カメラ、マイクの情報を画面から直接求めません。ゲーム入力と進行情報は機能提供と利用分析のために処理される場合があります。',
        payments:
          '現在のApp Store公開版は無料で、購読やアプリ内課金は表示されていません。将来支払い機能を追加する場合はAppleのApp Store決済を使用し、事前に本ポリシーを更新します。',
        thirdParties:
          '利用統計と障害分析のためにGoogle Firebase AnalyticsとFirebase Crashlyticsを使用します。関連情報はGoogleまたは下位処理業者のサーバーで処理され、Googleのプライバシー基準と保存設定が適用される場合があります。',
        children:
          '登録や子どもの氏名・連絡先の直接入力は求めません。ただし、子どもが利用する場合も上記のFirebase利用ログと診断情報が自動収集される場合があります。',
        changes:
          '収集項目、Firebase構成、支払い、アプリ機能が変わる場合、App Storeの表示と本ポリシーを併せて更新します。',
        contact: 'Word Rushのプライバシーに関するお問い合わせや権利行使は、以下のメールアドレスまでお送りください。',
      },
    },
  },
];

export const getPrivacyPolicy = (appSlug: string) => privacyPolicies.find((policy) => policy.appSlug === appSlug);
