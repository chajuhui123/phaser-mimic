## React ↔ Phaser 아키텍처

- `src/game/main.ts` — Phaser `Game` 설정(scene 목록, 크기, parent 엘리먼트). Scene은 `Boot` → `Preloader` → `MainMenu` → `Game` → `GameOver` 순서로 실행됩니다.
- `src/PhaserGame.tsx` — `useLayoutEffect` 안에서 Phaser 인스턴스를 `#game-container`에 마운트하고, unmount 시 destroy합니다. `forwardRef`를 통해 `{ game, scene }`을 노출합니다. Phaser는 `window`/DOM에 접근하므로 모든 Phaser 코드는 클라이언트에서만 실행되어야 합니다(`game.tsx`처럼 `ssr: false`로 dynamic import).
- `src/game/EventBus.ts` — React와 Phaser 사이의 유일한 통신 채널입니다. Scene이 React에 현재 활성 scene으로 전달되려면 생명주기 중 언제든 `EventBus.emit('current-scene-ready', this)`를 호출해야 하며, 필요 없다면 호출하지 않아도 됩니다.
- 게임 엔티티/역할 타입과 mock 데이터는 (`mvp-step-1.md` 기준) 별도 파일로 분리하고, 이후 실제 서버 상태로 교체 가능하도록 구조화해야 합니다 — 아직 실시간 서버나 DB를 연결하지 마세요.
