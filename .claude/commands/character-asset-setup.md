# 캐릭터 및 에셋 세팅 Command

당신은 1인칭 시점의 3D 멀티플레이 심리 추리 액션 게임을 개발하는 역할입니다.

코드를 수정하기 전에 먼저 아래 문서를 읽으세요.

- docs/game-concept.md
- docs/mvp-scope.md
- docs/technical-direction.md
- docs/mvp-roadmap.md

위 문서들을 프로젝트의 기준 문서로 사용하세요.

## 프로젝트 배경

이 커맨드는 캐릭터 외형, 카메라 시점, 강제 변신 크리처, 배경 등 "캐릭터 관련 에셋/시점" 전반을 다룬다. 아래는 지금까지 이 커맨드로 구현되어 있는 내용이며, 이 커맨드를 다시 실행한다는 것은 이 시스템을 유지·확장하거나 새 에셋으로 교체하는 작업을 뜻한다.

1. **기본 캐릭터 — `character.jsx`(공유 에셋) 기반**
   - `src/game3d/entities/BlockCharacter.tsx`: 몸통/머리/팔다리로 이루어진 블록 리그를 R3F 선언형 컴포넌트로 구현. 방향별 스프라이트 이미지가 아니라, 이동 방향에 따라 3D 모델 자체가 회전하는 방식이다.
   - 방향 전환 로직은 `src/game3d/entities/useMovementFacing.ts`로 분리되어 있고, `BlockCharacter`와 강제 변신 크리처(아래 5번)가 공통으로 사용한다. `trackRef`의 실제 이동(위치 변화)로부터 heading을 계산해 부드럽게 회전시키고, 멈추면 마지막 방향을 유지한다.
   - 역할별 외형은 색상으로만 구분한다(`src/game3d/entities/characterAppearance.ts`의 `ROLE_PALETTE`) — 형태는 공통.
   - 술래(seeker)만 총 메쉬를 들고 있다.

2. **총쏘기 모션 / 피격 이펙트 — `shooting_impact.jsx`(공유 에셋) 기반**
   - `src/game3d/combat/effects/ShootingEffects.tsx`: 총구 flash, tracer, 명중 시 "팡" 이펙트(`pop`)와 파편(`burst`)을 담당. `src/game3d/entities/BlockCharacter.tsx`의 `triggerShoot`가 팔 recoil 애니메이션 + 총구 world position 계산 후 이 컴포넌트를 호출한다.
   - `Simulation.tsx`의 `performAttack()`이 기존 공격 판정(사거리, 오공격 등)은 그대로 유지한 채, 조준 지점을 대상의 발밑이 아니라 몸통 높이(`TORSO_CENTER_Y`)로 잡아 총이 아래를 향하지 않게 한다.

3. **배경 — `hider_seeker_screen.jsx`(공유 에셋)의 저폴리 초원 기반**
   - `src/game3d/environment/GrasslandBackground.tsx`: 초록 grass floor + 하늘색 배경 + fog + `MAP_BOUNDS` 바깥쪽 언덕/나무/바위. `GameScene.tsx`가 기존 단색 floor 대신 이걸 렌더링한다.
   - 같은 컴포넌트를 `src/app-shell/background/SceneBackground.tsx`에서도 재사용해 스플래시/로비 화면 배경으로 쓴다 (룸코드/플레이어 카드 UI 뒤에서 seeker가 hider를 쏘는 비네트 연출 포함, `webview-app-shell-setup` 커맨드가 다루는 앱 셸 영역과 맞닿아 있음).

4. **카메라 시점 (완전한 1인칭이 아님)**
   - `src/game3d/constants.ts`의 `CAMERA_HEIGHT_ABOVE_GROUND`, `CAMERA_BEHIND_OFFSET`로 카메라를 자신 캐릭터의 머리 위쪽·뒤쪽에 둔다 — 화면 아래쪽에 자신 캐릭터의 뒷모습이 작게 보인다(화면을 꽉 채우지 않을 정도).
   - **마우스로 시점을 회전시키는 기능은 없다.** 카메라 방향은 항상 고정(정면)이며, `Simulation.tsx`의 `useFrame`에서 위치만 조작 중인 캐릭터를 따라간다 (`camera.position.set(x, CAMERA_HEIGHT_ABOVE_GROUND, z + CAMERA_BEHIND_OFFSET)`, `camera.rotation`은 건드리지 않음).
   - 이동 입력(WASD/방향키)은 카메라 방향이 아니라 고정된 월드 축 기준이다. 캐릭터 모델 자체는 `useMovementFacing`으로 이동 방향을 계속 바라본다(카메라와는 별개).
   - 과거에 있었던 마우스 드래그 기반 시점 회전(포인터 락)은 완전히 제거되었다(`usePointerLookControls` 삭제).

5. **강제 변신 크리처 — `animal.jsx`(공유 에셋) 기반**
   - `src/game3d/mission/transformCreatures/{Rabbit,Cat,Frog}Creature.tsx`: 토끼/고양이/개구리 블록 크리처를 R3F로 재구현. 원본 에셋의 원형 자동 배회 이동은 빼고, 실제 이동 여부에 따른 홉/걷기/꼬리흔들림 애니메이션만 남겼다(월드 위치는 실제 트래킹 대상이 담당).
   - `src/game3d/mission/TransformedCreature.tsx`가 `transformSeed`(0~1 난수) 하나로 생명체 종류(토끼/고양이/개구리)와 색을 함께 무작위로 고른다(`transformCreatures/creatureAppearance.ts`의 `pickTransformCreature`).
   - `Simulation.tsx`에서 `isTransformed`일 때 `BlockCharacter` 대신 `TransformedCreature`를 렌더링한다. 미션 실패 → 5초 강제 변신이라는 기존 판정/타이밍(`useMissionState.ts`)은 바꾸지 않았다.

캐릭터 방향별 이미지, 총쏘기 모션, 피격 이펙트, 배경 텍스처, 변신 크리처 등 새 에셋 파일은 사용자가 공유한다. 이 커맨드를 실행하는 시점에 필요한 에셋이 아직 없다면, 형식이나 종류를 임의로 추측해서 구현하지 말고 먼저 사용자에게 에셋 위치와 형식을 확인하세요.

## 공통 규칙

작업 중 아래 문서의 규칙을 따르세요.

- `CLAUDE.md` — 클라이언트 전용 렌더링, 게임 엔티티/mock 데이터 분리 구조
- `docs/mvp-scope.md`의 `Excluded` 목록
- `docs/technical-direction.md`의 "Future Considerations"(특히 레벨/콘텐츠 확장 대비 항목)

추가로 아래는 이번 커맨드에 고유한 규칙이니 항상 지키세요.

- 이번 작업은 시각적 교체/추가 작업입니다. 공격 사거리, 체력, 오공격 판정, 탈락 조건, 미션 실패→강제 변신 타이밍 등 기존 게임 판정 로직은 바꾸지 않습니다. 판정 결과에 이어지는 표현(모션, 이펙트, 외형)만 추가/교체합니다.
- 카메라는 마우스로 회전시키지 않습니다. 항상 고정된 정면을 바라보며, 위치만 조작 중인 캐릭터를 따라갑니다. 이 규칙을 바꾸는 요청이 명시적으로 없다면 유지하세요.
- 에셋 파일 경로나 방향/모션/생명체 종류를 게임 로직 코드에 흩어진 문자열로 하드코딩하지 말고, 별도 상수/매니페스트로 분리해 이후 종류가 늘어나도 로직을 건드리지 않고 교체할 수 있게 합니다 (`characterAppearance.ts`, `transformCreatures/creatureAppearance.ts` 패턴 참고).
- 실제로 존재하지 않는 에셋을 대신할 임의의 새 이미지/모델을 만들어내지 마세요. 필요한 에셋이 없으면 구현을 진행하지 말고 사용자에게 요청하세요.
- 방향 전환/모션 재생 로직은 매 프레임(`useFrame`) 안에서 불필요한 리렌더링이나 과도한 연산이 없도록 주의하세요. 이동 방향 추적은 `useMovementFacing` 공용 훅을 재사용하세요.

## 이번 커맨드 목표

이번 작업(재실행 시)에서는 요청받은 범위만 구현합니다. 예를 들어 새 크리처 추가, 캐릭터 외형 교체, 카메라 거리/높이 조정 등 구체적으로 요청받은 것만 반영하고, 위 "프로젝트 배경"에 정리된 기존 동작(판정 로직, 카메라가 회전하지 않는다는 규칙 등)은 명시적 요청이 없으면 그대로 유지합니다.

아래는 이번 범위에서 제외합니다(별도 요청이 없는 한).

- 체력/사거리/탈락 조건/미션 타이밍 등 기존 게임 규칙 변경
- 마우스 시점 회전 재도입
- 실시간 서버 동기화, 앱 셸(스플래시/로비) 로직 변경

## 작업 방식

### Step A: 문서 읽기 · 에셋 확인 · 요약하기

먼저 아래 문서를 읽으세요.

- docs/game-concept.md
- docs/mvp-scope.md
- docs/technical-direction.md
- docs/mvp-roadmap.md

그다음 이번 요청에 필요한 에셋이 코드베이스에 이미 존재하는지 확인하세요. 없다면 파일 수정을 시작하지 말고, 사용자에게 에셋 파일 경로와 형식을 먼저 확인하세요.

문서와 현재 코드(위 "프로젝트 배경"의 1~5번)를 바탕으로 아래 항목을 요약하세요.

- 게임의 핵심 콘셉트
- 지금 이미 구현되어 있는 것과, 이번 요청이 바꾸거나 추가하는 범위
- 이동 방향 추적(`useMovementFacing`), 카메라 위치 추적(`Simulation.tsx`) 등 재사용할 수 있는 기존 코드가 어디에 있는지
- 구현 시 주의해야 할 점

이 단계에서는 파일을 수정하지 마세요.

### Step B: 작업 계획 제안하기

문서/에셋 확인 후 구현 계획을 제안하세요.

아래 항목을 포함하세요.

- 작업 범위와 제외 범위
- 에셋을 코드에서 참조하는 구조(상수/매니페스트 등)
- 필요하다면 방향 전환/카메라/변신 로직 설계 변경점
- 리스크 또는 결정이 필요한 부분

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

### Step D: 구현하기

승인을 받은 뒤 계획한 범위만 구현하세요.

구현 방향은 다음과 같습니다.

- 기존 `src/game3d/entities/BlockCharacter.tsx`, `useMovementFacing.ts`, `NpcActor.tsx`, `Simulation.tsx`, `mission/TransformedCreature.tsx`, `mission/transformCreatures/*`의 구조를 최대한 재사용하고 확장합니다.
- 에셋 경로/구성은 하드코딩 대신 상수 또는 별도 데이터 파일로 분리합니다.
- 방향 전환이 필요한 새 엔티티는 `useMovementFacing(trackRef)`를 사용합니다.
- 카메라 관련 변경은 `Simulation.tsx`의 카메라 위치 갱신 부분과 `constants.ts`의 `CAMERA_HEIGHT_ABOVE_GROUND`/`CAMERA_BEHIND_OFFSET`만 조정하고, 마우스 회전을 다시 추가하지 않습니다(명시적 요청이 없는 한).
- 총쏘기/피격 이펙트는 `ShootingEffects`/`BlockCharacter.triggerShoot` 흐름을 재사용합니다.
- 배경 변경은 `GrasslandBackground.tsx`(게임 맵)와 `SceneBackground.tsx`(앱 셸 배경)를 구분해서 적용합니다.
- 판정 로직(사거리, 체력, 탈락, 미션 타이밍)은 이번 단계에서 건드리지 않습니다.

### Step E: 검증하기

구현 후 프로젝트를 검증하세요.

아래 항목을 확인하세요.

- 캐릭터가 여러 방향으로 이동/회전할 때 화면에 표시되는 모습이 방향에 맞게 전환되는지
- 술래가 공격할 때 총쏘기 모션과 총구 flash/tracer가 재생되는지
- 공격에 맞은 캐릭터가 팡 이펙트 후 사라지는지, 탈락/오공격 판정 자체는 기존과 동일하게 동작하는지
- 배경이 초원 비주얼로 표시되는지(게임 맵과 앱 셸 화면 모두)
- 카메라가 마우스로 회전하지 않고, 항상 고정된 정면을 바라보며 위치만 캐릭터를 따라가는지(자신 캐릭터의 뒷모습이 화면 아래쪽에 보이는지)
- 미션 실패 시 강제 변신 크리처(토끼/고양이/개구리)가 무작위로 나타나고, 이동할 때 그 생명체답게 움직이는지
- 기존 기능(이동, NPC 자동 이동, 미션, 승패, HUD, 결과 화면 등)에 회귀가 없는지
- TypeScript 타입 에러가 없는지
- 가능한 경우 lint/build 에러가 없는지 확인하고 수정했는지

### Step F: 결과 보고하기

검증 후 아래 내용을 정리해서 보고하세요.

- 변경한 파일 목록
- 적용한 에셋 목록과 참조 경로
- 구현한 내용
- 프로젝트 실행 방법과 확인 방법
- 의도적으로 아직 구현하지 않은 기능
- 추천하는 다음 단계 작업

## 응답 방식

응답은 간결하지만 명확하게 작성하세요.

계획을 제안하는 단계에서는 코드를 작성하지 마세요.

구현 단계에서는 범위를 좁게 유지하세요.

결과 보고에서는 실제로 확인할 수 있는 내용 중심으로 정리하세요.
