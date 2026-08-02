# Changelog

Gorani Apps 웹사이트의 주요 변경 사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며, 버전은 [Semantic Versioning](https://semver.org/lang/ko/)을 사용합니다.

## [Unreleased]

### Changed

- 지원 언어, 기본 언어, 날짜·Open Graph·RSS 로케일 메타데이터를 하나의 설정으로 통합하고 기본 언어 변경 시 라우팅·검증·404 문구가 함께 변경되도록 개선
- 앱 업데이트 날짜가 실제 달력에 존재하는 `YYYY-MM-DD` 형식인지 데이터 로딩과 회귀 테스트에서 검증

## [1.0.0] - 2026-08-02

### Added

- Gorani Apps 브랜드와 Apple 플랫폼 앱을 소개하는 정적 마케팅 사이트
- AssetScaler, Andromeda 17K, Word Rush, AnswerByChance의 앱별 상세·지원·개인정보처리방침 페이지
- 한국어, 영어, 일본어 정적 라우팅과 언어 전환
- 앱 업데이트, 다국어 블로그, RSS 피드
- canonical, hreflang, Open Graph, JSON-LD, sitemap, robots.txt 등 검색 엔진 메타데이터
- GitHub Pages 배포 및 CI 워크플로
- 빌드 결과의 canonical, hreflang, sitemap, RSS, robots.txt, CNAME 자동 검증
- hreflang 누락·언어 교환과 잘못된 robots sitemap을 재현하는 검증기 회귀 테스트
- 추후 홈 화면 동영상을 교체할 수 있는 설정과 미디어 영역

### Fixed

- 영어와 일본어 RSS 채널 링크가 각 언어 홈페이지를 가리키도록 수정

[Unreleased]: https://github.com/swift-man/apps.gorani.me/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/swift-man/apps.gorani.me/releases/tag/v1.0.0
