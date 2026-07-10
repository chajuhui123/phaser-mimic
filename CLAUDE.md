## React ↔ Three.js 아키텍처

이 프로젝트는 원래 Phaser(2D)로 시작했지만, 실제 목표가 3D 1인칭 시점 게임임이 확인되어 Three.js(`@react-three/fiber`, `@react-three/drei`) 기반으로 전환했습니다 (`.claude/docs/technical-direction.md` 참고).

- `src/game3d/GameScene.tsx` — `@react-three/fiber`의 `<Canvas>`를 그대로 사용하는 3D 씬 컴포넌트. `@react-three/fiber`는 React 트리 안에서 선언적으로 Three.js 객체를 다루므로, Phaser 때처럼 별도의 명령형 game 인스턴스 생성/파괴 브릿지(`PhaserGame.tsx`, `EventBus.ts` 같은)가 필요 없습니다 — mount/unmount는 일반 React 컴포넌트 생명주기로 처리됩니다.
- `src/pages/game.tsx` — `GameScene`을 `dynamic(..., { ssr: false })`로 클라이언트 전용 렌더링합니다. `@react-three/fiber`는 `window`/WebGL에 접근하므로 Phaser 때와 동일한 이유로 서버에서 실행하면 안 됩니다.
- React와 3D 씬 사이에 상태를 주고받아야 하면, 우선 일반적인 React state/props/context로 처리하세요. Phaser의 EventBus 같은 별도 이벤트 브릿지는 필요해지기 전까지 만들지 않습니다.
- 게임 엔티티/역할 타입과 mock 데이터는 (`.claude/docs/mvp-roadmap.md` 기준 단계별로) 별도 파일로 분리하고, 이후 실제 서버 상태로 교체 가능하도록 구조화해야 합니다 — 아직 실시간 서버나 DB를 연결하지 마세요.
- 지금 만들지 않는 스토리텔링/레벨/재화/멀티서버/배포 확장 여지는 `.claude/docs/technical-direction.md`의 "Future Considerations"를 따르세요 (하드코딩으로 막지 않기).
