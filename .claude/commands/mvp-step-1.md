# MVP 1단계 작업 Command

당신은 1인칭 시점의 3D 멀티플레이 심리 추리 액션 게임을 개발하는 역할입니다.

코드를 수정하기 전에 먼저 아래 문서를 읽으세요.

- docs/game-concept.md
- docs/mvp-scope.md
- docs/technical-direction.md
- docs/mvp-roadmap.md

위 문서들을 프로젝트의 기준 문서로 사용하세요.

## 프로젝트 배경

이 프로젝트는 원래 Phaser(2D)로 시작했지만, 실제 목표가 3D 1인칭 시점(Meccha Chameleon류)이라는 것이 확인되어 Three.js(`@react-three/fiber`) 기반으로 기술 스택을 전환했습니다. MVP 1단계는 이 전환의 첫 단계로, **게임 콘텐츠가 아니라 렌더링 파이프라인 자체**를 검증합니다.

게임 자체의 콘셉트/역할/규칙은 위에서 읽은 `docs/game-concept.md`, `docs/mvp-scope.md`를 기준으로 삼으세요 (여기서 다시 요약하지 않습니다).

## 공통 규칙

작업 중 아래 문서의 규칙을 따르세요.

- `CLAUDE.md` — 클라이언트 전용 렌더링, 게임 엔티티/mock 데이터 분리 구조
- `docs/mvp-scope.md`의 `Excluded` 목록
- `docs/technical-direction.md`의 "Future Considerations"

추가로 아래 두 가지는 이번 커맨드에 고유한 규칙이니 항상 지키세요.

- 전체 게임을 한 번에 구현하지 않고, 현재 요청받은 MVP 단계의 범위만 구현합니다.
- 구현 후 변경 파일, 실행 방법, 확인 방법을 정리합니다.

## MVP 1단계 목표

이번 작업에서는 MVP 1단계만 구현합니다. (`docs/mvp-roadmap.md` 기준 "3D 렌더링 파이프라인이 동작한다" 단계입니다.)

MVP 1단계 목표는 다음과 같습니다.

- 기존 Phaser 관련 패키지와 코드를 제거합니다.
- `three`, `@react-three/fiber`, `@react-three/drei`를 설치합니다.
- `/game` 페이지에서 빈 3D 씬(바닥 + 기본 조명 + 고정 카메라)을 렌더링합니다.
- Three.js 렌더링은 클라이언트 전용으로만 실행되어야 하며, SSR/hydration 에러가 없어야 합니다.
- hot reload 또는 컴포넌트 remount 시 3D 캔버스/렌더러가 중복 생성되지 않아야 합니다.
- 게임 엔티티(player/seeker/npc)는 아직 표시하지 않습니다.
- 1인칭 게임 카메라(자기 캐릭터를 숨기는 등의 게임 로직)는 아직 구현하지 않습니다.
- 이동, 공격, 미션 등 게임플레이 로직은 아직 구현하지 않습니다.

## 작업 방식

### Step A: 문서 읽고 요약하기

먼저 아래 문서를 읽으세요.

- docs/game-concept.md
- docs/mvp-scope.md
- docs/technical-direction.md
- docs/mvp-roadmap.md

그다음 아래 항목을 요약하세요.

- 게임의 핵심 콘셉트
- 이 프로젝트가 Phaser(2D)에서 Three.js(3D)로 전환된 이유
- MVP 1단계(렌더링 파이프라인)에 포함되는 것과 제외되는 것
- Next.js와 Three.js의 역할 분리
- 구현 시 주의해야 할 점

이 단계에서는 파일을 수정하지 마세요.

### Step B: 작업 계획 제안하기

문서 요약 후 MVP 1단계 구현 계획을 제안하세요.

아래 항목을 포함하세요.

- 작업 범위
- 제외 범위
- 예상 파일 구조 (삭제할 Phaser 관련 파일 포함)
- 구현 순서
- 리스크 또는 결정이 필요한 부분 (예: React 19와 `@react-three/fiber` 버전 호환성)

이 단계에서도 파일을 수정하지 마세요.

### Step C: 승인 기다리기

파일을 수정하기 전에 반드시 명시적인 승인을 기다리세요.

아래와 같은 승인 표현이 있을 때만 구현을 시작하세요.

- "진행해"
- "구현해"
- "좋아 진행"
- "Proceed"
- "Implement it"
- "Go ahead"

### Step D: MVP 1단계 구현하기

승인을 받은 뒤 MVP 1단계만 구현하세요.

구현 방향은 다음과 같습니다.

- `package.json`에서 `phaser`를 제거하고 `three`, `@react-three/fiber`, `@react-three/drei`를 추가합니다.
- 기존 Phaser 관련 코드(`src/game/*`, `src/PhaserGame.tsx`, `src/App.tsx` 등)를 제거합니다.
- `/game` 라우트는 클라이언트 전용 3D Canvas 컴포넌트를 렌더링합니다 (`dynamic(..., { ssr: false })`).
- 3D 씬은 바닥 plane + 기본 조명 + 고정 카메라만 구성합니다. 엔티티나 게임 로직은 포함하지 않습니다.
- 컴포넌트가 마운트될 때 렌더러/씬이 한 번만 생성되고, 언마운트될 때 정리되도록 합니다.
- 이후 단계에서 엔티티, 이동, 게임 카메라 로직을 추가할 수 있는 구조로 만듭니다.

### Step E: 검증하기

구현 후 프로젝트를 검증하세요.

아래 항목을 확인하세요.

- `/game` 페이지가 정상적으로 렌더링되는지
- WebGL 캔버스와 빈 3D 공간(바닥+조명)이 보이는지
- 콘솔에 SSR/hydration 관련 에러가 없는지
- hot reload 또는 remount 시 캔버스가 중복 생성되지 않는지
- TypeScript 타입 에러가 없는지
- 가능한 경우 lint/build 에러가 없는지 확인하고 수정했는지
- `package.json`에 Phaser 의존성이 남아있지 않은지

### Step F: 결과 보고하기

검증 후 아래 내용을 정리해서 보고하세요.

- 변경한 파일 목록 (삭제한 Phaser 관련 파일 포함)
- 구현한 내용
- 프로젝트 실행 방법
- `/game` 페이지 확인 방법
- 의도적으로 아직 구현하지 않은 기능
- 추천하는 MVP 2단계 작업

## 응답 방식

응답은 간결하지만 명확하게 작성하세요.

계획을 제안하는 단계에서는 코드를 작성하지 마세요.

구현 단계에서는 범위를 좁게 유지하세요.

결과 보고에서는 실제로 확인할 수 있는 내용 중심으로 정리하세요.
