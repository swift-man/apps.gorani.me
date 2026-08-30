# Gorani Apps

AstroWind를 기반으로 만든 Apple 플랫폼 앱용 다국어 정적 마케팅 사이트입니다. AssetScaler, Andromeda 17K, Word Rush, AnswerByChance를 앱별 JSON에서 관리하고 한국어·영어·일본어 페이지를 정적으로 생성합니다. Pages CMS를 연결하면 코드를 직접 수정하지 않고 웹 폼으로 기존 앱 콘텐츠와 이미지를 관리할 수 있습니다.

## 요구 환경

- Node.js 22.12 이상
- pnpm 권장 (`package-lock.json`은 AstroWind 원본 호환을 위해 남아 있지만 이 프로젝트의 현재 작업 잠금 파일은 `pnpm-lock.yaml`입니다.)

## 개발 서버

```bash
pnpm install
pnpm dev
```

이 저장소의 Astro 에이전트 환경에서는 백그라운드 서버도 사용할 수 있습니다.

```bash
pnpm astro dev --background
pnpm astro dev status
pnpm astro dev stop
```

## 검사와 빌드

```bash
pnpm check:astro
pnpm test:apps
pnpm test:cms
pnpm test:workflows
pnpm build
pnpm check:static
pnpm test:static
```

GitHub Actions의 Check와 Build 작업은 공식 `pnpm/setup`으로 Node.js 24, `package.json`에 고정된 pnpm 11.9.0, pnpm 저장소 캐시와 잠금 파일 기반 의존성 설치를 준비합니다. 그 뒤 Check는 `pnpm check`를, Build는 `pnpm build`를 실행합니다.

CI 환경을 로컬에서 재현할 때는 Node.js 24를 사용하고 다음 명령을 실행합니다. Corepack은 `packageManager`에 고정된 pnpm 11.9.0을 사용하며, 잠금 파일과 의존성 선언이 일치하지 않으면 설치가 실패합니다.

```bash
corepack enable
pnpm --version # 11.9.0
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

의존성을 변경할 때는 `pnpm-lock.yaml`도 함께 갱신하세요.

정적 결과물은 `dist/`에 생성됩니다. `pnpm build`는 빌드 직후 정적 출력 검증을 자동 실행하며, `pnpm check:static`으로 기존 `dist/`만 다시 검사할 수 있습니다.

정적 출력 검증은 다음 회귀를 빌드 오류로 처리합니다.

- canonical URL과 실제 생성 경로 불일치
- 존재하지 않거나 상호 연결되지 않은 hreflang 대상
- sitemap의 누락·중복·비정규 URL
- 한국어·영어·일본어 RSS의 언어, 링크, 게시물 누락
- 잘못된 robots.txt sitemap 주소와 CNAME

`pnpm test:static`은 hreflang 전체 누락, 언어 대상 교환, 추가 robots.txt sitemap 지시문을 재현하여 검증기가 해당 회귀를 실제로 차단하는지 확인합니다. 이 테스트는 `pnpm build`에 포함됩니다.

## 프로젝트 구조

```text
src/
├─ config/site.ts              # 사이트 URL, 이메일, 언어, 개인정보 날짜
├─ data/app-slugs.ts           # 앱 식별자 단일 목록과 타입
├─ data/app-schema.ts          # 앱 JSON 타입과 런타임 검증
├─ data/apps.ts                # 앱별 JSON 로더
├─ data/apps/*.json            # 앱 정보와 세 언어 콘텐츠
├─ data/updates.ts             # 앱별 업데이트
├─ data/post/                  # 세 언어 Markdown 블로그 글
├─ components/apps/            # 앱 카드, CTA, 갤러리, FAQ
├─ components/site/            # 헤더, 언어 선택, SEO, JSON-LD
├─ views/                      # 실제 페이지 템플릿
└─ pages/                      # 정적 다국어 라우팅과 RSS

public/images/apps/
├─ assetscaler/
├─ andromeda-17k/
├─ word-rush/
└─ answer-by-chance/
```

한국어가 기본 언어이며 앱의 정식 URL은 짧은 slug를 사용합니다.

```text
https://apps.gorani.me/assetscaler
https://apps.gorani.me/andromeda-17k
https://apps.gorani.me/word-rush
https://apps.gorani.me/answer-by-chance
```

영어와 일본어도 같은 slug를 유지합니다: `/en/assetscaler`, `/ja/assetscaler`. `/ko` 경로도 정적으로 생성되지만 canonical과 사이트 내부 한국어 링크는 locale 없는 기본 URL을 사용합니다.

## 새 앱 추가

1. `src/data/app-slugs.ts`의 `APP_SLUGS`에 새 slug를 등록합니다.
2. 기존 JSON 파일을 참고해 `src/data/apps/<slug>.json`을 추가합니다.
3. `public/images/apps/<slug>/`에 아래 이미지를 추가합니다.
4. 필요하면 `src/data/updates.ts`에 첫 업데이트를 추가합니다.
5. 검증한 개인정보처리방침을 `src/data/privacy.ts`에 추가하고 `privacyStatus`를 `published`로 설정합니다.

앱 상세·지원 경로는 앱 데이터에서 자동 생성됩니다. 업데이트와 블로그의 앱 참조도 `APP_SLUGS`를 기준으로 검사되며, 등록되지 않았거나 앱 데이터가 누락된 slug는 빌드 오류가 됩니다. 개인정보 경로는 `privacyStatus: 'published'`인 앱에만 생성됩니다.

Pages CMS에서는 실수로 URL이 바뀌거나 앱이 삭제되지 않도록 기존 앱의 생성·이름 변경·삭제를 비활성화했습니다. 새 앱 등록은 위 절차로 코드와 이미지를 함께 준비한 뒤 UI 편집 대상으로 자동 표시됩니다.

## Pages CMS로 앱 콘텐츠 수정

저장소 루트의 `.pages.yml`이 앱 편집 화면을 정의합니다. Pages CMS는 별도 콘텐츠 데이터베이스 없이 `src/data/apps/*.json`과 `public/images/apps/`를 GitHub에 저장하며, 저장된 브랜치가 `main`이면 기존 GitHub Actions가 사이트를 자동으로 다시 배포합니다.

1. [Pages CMS](https://app.pagescms.org)에 GitHub 계정으로 로그인합니다.
2. GitHub App 설치 범위를 `swift-man/apps.gorani.me` 저장소로만 제한합니다.
3. 저장소와 편집할 브랜치를 선택합니다.
4. **앱 콘텐츠**에서 앱을 선택해 일반 정보, 출시 상태, 이미지, 한국어·영어·일본어 문구를 수정합니다.
5. 저장 후 GitHub Actions의 Check와 Build 결과를 확인합니다.

바로 배포하려면 `main`에서 저장합니다. 코드리뷰를 거치려면 먼저 GitHub에서 콘텐츠용 브랜치를 만들고 Pages CMS에서 그 브랜치를 선택해 저장한 뒤 PR을 생성합니다.

편집 화면에서 지원하는 항목:

- 앱 이름, 플랫폼, 카테고리, 출시 및 개인정보처리방침 상태
- App Store URL, 테마, 사용하는 Apple 서비스
- 앱 아이콘, Hero, 스크린샷, 공유 이미지 선택과 업로드
- 한국어·영어·일본어 제목, 설명, 기능, 사용 방법, FAQ, SEO 문구
- 이미지의 실제 너비와 높이

앱 이미지 경로는 반드시 `/images/apps/<slug>/` 안에 있어야 합니다. JSON 형식, 필수 번역, 출시 상태와 App Store URL의 조합, 이미지 파일 존재 여부와 실제 크기는 `pnpm test:apps`와 정적 빌드에서 검증되고, `.pages.yml`과 JSON의 중첩 필드 대응은 `pnpm test:cms`에서 검증됩니다.

## 앱 이미지 교체

각 앱 폴더에서 다음 파일을 같은 이름으로 교체합니다.

```text
icon.webp          512×512 권장
hero.webp          상세 첫 화면
screenshot-1.webp
screenshot-2.webp
screenshot-3.webp
og.webp            1200×630
```

현재 파일은 깨진 링크가 생기지 않도록 만든 완성형 placeholder입니다. 이미지 교체 시 데이터의 `heroSize`와 각 screenshot의 `width`, `height`도 실제 크기에 맞춰 수정해야 CLS를 방지할 수 있습니다.

플랫폼별 스크린샷 권장 비율:

- macOS: 16:10
- iPhone 및 iPad: 세로 9:16
- Apple TV: 16:9

`scripts/generate-placeholders.mjs`를 실행하면 현재 placeholder가 다시 생성됩니다. 실제 이미지를 넣은 뒤에는 이 스크립트를 실행하지 마세요.

## 메인 동영상 설정

정적 사이트에서도 HTML5 동영상을 사용할 수 있습니다. MP4 파일을 `public/videos/home-hero.mp4`에 넣고 `src/config/site.ts`에서 다음 값을 변경합니다.

```ts
homeVideo: {
  enabled: true,
  src: '/videos/home-hero.mp4',
  poster: '/images/home-video-poster.webp',
  autoplay: true,
  muted: true,
  loop: true,
  controls: true,
},
```

- 자동 재생은 브라우저 정책상 `muted: true`가 필요합니다.
- iPhone 인라인 재생을 위해 `playsinline`이 이미 적용되어 있습니다.
- `controls: true`로 사용자가 일시정지할 수 있습니다.
- `prefers-reduced-motion` 사용자는 자동 재생을 중지합니다.
- 첫 화면 용량을 줄이기 위해 H.264 MP4, 짧은 길이, 적절한 비트레이트와 별도 poster 이미지를 권장합니다.
- 동영상 파일이 준비되기 전에는 `enabled: false`를 유지해야 깨진 미디어 요청이 생기지 않습니다.

## App Store URL과 출시 상태 변경

`src/data/apps/<slug>.json` 또는 Pages CMS에서 앱의 `appStoreUrl`을 수정합니다.

Coming Soon 앱을 출시 상태로 전환하려면:

```json
{
  "appStoreUrl": "https://apps.apple.com/app/id...",
  "status": "released",
  "privacyStatus": "published"
}
```

`appStoreUrl`이 `null`이면 다운로드 링크 대신 Coming Soon 배지가 보이고 SoftwareApplication JSON-LD에도 설치 URL이 포함되지 않습니다.

## 번역 추가 및 수정

- 공통 UI: `src/data/i18n.ts`
- 앱 설명, 기능, 사용 방법, FAQ, SEO: `src/data/apps/<slug>.json` 또는 Pages CMS
- 업데이트: `src/data/updates.ts`
- 블로그: `src/data/post/<locale>-<permalink>.md`

앱 업데이트 날짜는 실제 달력에 존재하는 `YYYY-MM-DD` 형식으로 작성해야 하며, 잘못된 날짜는 빌드 단계에서 해당 앱과 버전을 포함한 오류로 보고됩니다.

블로그 경로는 공개 게시물의 `locale`과 `permalink`에서 자동 생성됩니다. `draft: true`인 글은 홈, 목록, 상세 페이지와 RSS에서 제외됩니다.

언어를 새로 추가하려면 `src/config/locales.mjs`에 언어별 날짜·Open Graph·RSS 메타데이터를 추가한 뒤 UI 문자열, 앱 콘텐츠, Markdown 글을 함께 확장해야 합니다. `SUPPORTED_LOCALES`, 정적 라우팅, RSS 및 빌드 검증기는 이 설정에서 지원 언어를 자동으로 가져옵니다.

## 개인정보처리방침 수정

- 공통 최종 업데이트 날짜: `src/config/site.ts`의 `privacyLastUpdated`
- 앱별 공개 상태: `src/data/apps/<slug>.json`의 `privacyStatus` 또는 Pages CMS
- 검증 출처와 언어별 문구: `src/data/privacy.ts`
- 문서 섹션 렌더링: `src/views/PrivacyPage.astro`

공통 최종 업데이트 날짜도 실제 달력에 존재하는 `YYYY-MM-DD` 형식이어야 하며, 잘못된 값은 설정 이름을 포함한 오류와 함께 검사 및 빌드를 중단합니다.

개인정보 페이지는 출시 빌드, 게시된 개발자 방침, App Store 개인정보 응답을 대조한 앱만 공개합니다. 미확정 앱은 `privacyStatus: 'pending'`으로 유지하고 정책 경로와 링크를 생성하지 않습니다.

## 지원 이메일 변경

`src/config/site.ts`의 `supportEmail`을 실제 주소로 변경합니다. 앱별 지원 페이지의 mailto 제목에는 앱 이름이 자동으로 들어갑니다.

현재 값은 저장소 소유자의 공개 GitHub 연락처인 `jiniopening@gmail.com`입니다.

## 사이트 URL 변경

기본 URL은 `https://apps.gorani.me`입니다. 다른 도메인을 사용할 때는 다음 위치를 함께 변경하세요.

1. 빌드 환경 변수 `PUBLIC_SITE_URL`
2. `src/config/site.ts`의 기본값
3. `src/config.yaml`의 `site.site`
4. `public/robots.txt`의 Sitemap URL
5. `public/CNAME`의 GitHub Pages 커스텀 도메인

예:

```bash
PUBLIC_SITE_URL=https://apps.gorani.me pnpm build
```

GitHub Pages의 프로젝트 하위 경로에 배포할 때는 `PUBLIC_BASE_PATH`도 설정할 수 있습니다. 다만 현재 내부 링크는 루트 기준 URL을 사용하므로 저장소 하위 경로 배포 전 `localizedPath()`와 public 이미지 경로를 base-aware 방식으로 조정해야 합니다. 커스텀 도메인을 연결하면 별도 base 경로 없이 사용할 수 있습니다.

## GitHub Pages 배포

`main` 브랜치에 병합되면 `.github/workflows/actions.yaml`이 Check를 통과한 뒤 사이트를 한 번만 빌드하고, 그때 검증한 `dist` 산출물을 그대로 GitHub Pages에 배포합니다. Pull Request에서는 Check와 Build까지만 실행하며 Pages 산출물을 업로드하거나 배포하지 않습니다.

긴급 재배포가 필요하면 Actions 탭에서 `.github/workflows/deploy.yml`의 **Manually deploy to GitHub Pages** 워크플로를 직접 실행할 수 있습니다. 수동 배포도 동일한 빌드 검증을 거치며, 자동 배포와 동시에 실행되지 않도록 `pages` 동시성 그룹을 공유합니다.

- Repository: `swift-man/apps.gorani.me`
- Production branch: `main`
- Build command: `pnpm run build`
- Build output directory: `dist`
- Custom domain: `apps.gorani.me`
- Node.js: 24
- pnpm: `package.json`의 `packageManager` 버전

최초 배포 전에 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 선택합니다. DNS에는 `apps.gorani.me`이 `swift-man.github.io`를 가리키는 CNAME 레코드를 설정하고, Pages 설정의 Custom domain에도 `apps.gorani.me`을 입력한 뒤 HTTPS를 활성화합니다.

`public/CNAME`과 빌드 환경 변수에 도메인이 이미 설정되어 있으므로 저장소 하위 경로용 `base`는 사용하지 않습니다.

## 콘텐츠와 SEO

- 다국어 canonical·hreflang·Open Graph·Twitter Card
- SoftwareApplication, FAQPage, BreadcrumbList, BlogPosting JSON-LD
- sitemap과 언어별 RSS (`/rss.xml`, `/en/rss.xml`, `/ja/rss.xml`)
- 정적 robots.txt, favicon, web manifest

공통 소셜 카드는 `public/og-gorani.webp`, 앱별 카드는 각 앱 폴더의 `og.webp`입니다.

## 배포 전 체크리스트

- `apps.gorani.me` DNS와 GitHub Pages 커스텀 도메인 연결 확인
- placeholder 앱 이미지 교체
- 실제 출시 빌드와 개인정보처리방침 대조
- App Store URL과 출시 상태 확인
- Pages CMS에서 수정한 앱 JSON의 Check와 Build 통과 확인
- `pnpm check && pnpm build` 실행
