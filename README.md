<!-- <div align="center"> -->

# HIDER · SEEKER

1인칭 시점 3D 소셜 디덕션 게임 — NPC 무리 사이에 숨은 도망자를 술래가 찾아내는 심리 추리 액션

<img src="public/pixel-hider-seeker.gif" alt="Hider Seeker preview" width="200" />

---

## STORY

사람 가득한 광장에 서 있다. 그중 몇몇은 진짜 사람이다.

- 👀 **술래(Seeker)** : 1인칭 시점으로 군중을 훑으며 도망자를 찾아낸다.
- 🏃 **도망자(Hider)** : NPC처럼 행동하며 제한 시간을 버팀. 주기적으로 떨어지는 미션을 수행해야만 한다.
- 🚶 **NPC** : 아무 생각 없이 맵을 배회하며 도망자의 위장막으로 쓰인다.

더 궁금하다면, [`.claude/docs/game-concept.md`](.claude/docs/game-concept.md) 에서 확인하기 🔎

## STACK

| 영역       | 기술                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 프레임워크 | [Next.js 15](https://nextjs.org) (React 19, TypeScript)                                                                                                         |
| 3D 렌더링  | [Three.js](https://threejs.org) via [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber) + [`@react-three/drei`](https://github.com/pmndrs/drei) |
| 배포 대상  | 웹 → 추후 WebView 패키징으로 iOS/Android 확장 예정                                                                                                              |

## WORK FLOW

MVP [로드맵](.claude/docs/mvp-roadmap.md) 은 총 6단계로 구성되어 있으며, MVP 개발 완료 후 점진적으로 디벨롭 될 예정

- [ ] **Step 1** — 3D 렌더링 파이프라인 (빈 씬 + 바닥 + 조명)
- [ ] Step 2 — mock 데이터로 player/seeker/NPC 렌더링, 1인칭 카메라
- [ ] Step 3 — 이동 + 시야 회전 + NPC 자동 이동
- [ ] Step 4 — 술래 공격/피격 판정, 체력
- [ ] Step 5 — 미션 시스템 + 강제 변신
- [ ] Step 6 — 시작/종료/승패 플로우, 결과 화면
- [ ] Step 7 - COMING SOON ✈️

## CONTRIBUTOR

| <img src="https://avatars.githubusercontent.com/chajuhui123" width=180/>
| :--------------------------------------------------------------------: |
| [@juhee](https://github.com/chajuhui123) |

혼자 기획하고, 코드짜고, HIDER - SEEKER 역할을 번갈아 가며 디버깅 중 ✨
