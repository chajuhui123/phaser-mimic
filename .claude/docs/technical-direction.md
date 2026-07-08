# Technical Direction

이 프로젝트는 React, Next.js, TypeScript, Phaser 기반의 1인칭 시점 2D 멀티플레이어 웹 게임이다.

추후 WebView로 감싸 iOS/Android 모바일 앱 게임으로 확장할 예정이다.

## Tech Stack

- Next.js
- React
- TypeScript
- Phaser

## Responsibility Split

### Next.js

Next.js는 게임 외부의 앱 화면을 담당한다.

- 랜딩/홈
- 로그인
- 로비
- 방 목록
- 방 생성/입장
- 티켓 상태
- 결과 화면
- 설정 화면

### Phaser

Phaser는 실제 게임 플레이 화면을 담당한다.

- 2D 맵 렌더링
- 1인칭 시점 카메라 처리
- 캐릭터 이동
- NPC 이동
- 플레이어 입력
- 술래 공격
- 충돌 판정
- 미션 연출
- 강제 변신 상태 표현
- 게임 HUD
- 타이머 표시

### Realtime Server

Realtime Server는 실시간 게임 상태를 담당한다.

- 방 상태
- 플레이어 입장/퇴장
- 역할 배정
- 플레이어 위치 동기화
- NPC 상태 동기화
- 미션 발급
- 공격 판정
- 체력 변경
- 탈락 처리
- 승패 판정

### Database

Database는 영속 데이터를 저장한다.

- 유저 정보
- 티켓 수량
- 전적
- 매치 로그
- 게임 결과

## Recommended Initial Architecture

초기에는 서버를 바로 완성하지 않고, 로컬 목업 상태로 Phaser 프로토타입을 먼저 만든다.

1. Next.js 프로젝트 생성
2. Phaser 게임 화면 연결
3. 로컬 mock room state 생성
4. 플레이어/NPC 렌더링
5. 술래/참여자 역할 시뮬레이션
6. 공격/피격/오공격 처리
7. 미션 시스템 구현
8. 미션 실패 시 강제 변신 구현
9. 타이머와 승패 판정 구현
10. 이후 실시간 서버로 상태 관리 이전

## Development Principle

첫 목표는 완성도 높은 서비스가 아니라 재미 검증이다.

따라서 초기 구현에서는 아래를 우선한다.

- 빠른 프로토타입
- 단순한 룰
- 명확한 승패
- 플레이 가능한 한 판
- 모바일 확장을 고려한 입력 구조
- 서버 구현 전에도 로컬에서 게임 루프 검증 가능

## Mobile Consideration

추후 WebView 앱으로 확장할 예정이므로 초기부터 모바일 환경을 고려한다.

- 세로 또는 가로 화면 방향을 명확히 정한다.
- 터치 입력을 우선 고려한다.
- 버튼 크기는 모바일 터치에 적합해야 한다.
- HUD는 작은 화면에서도 읽기 쉬워야 한다.
- 게임 화면은 다양한 해상도에 대응해야 한다.
