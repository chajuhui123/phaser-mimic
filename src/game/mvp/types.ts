export type Role = 'player' | 'seeker' | 'npc';

export interface GameEntity {
    id: string;
    role: Role;
    x: number;
    y: number;
}

// seeker/NPC의 자동 이동 상태. player는 키보드 입력으로 움직이므로 이 상태를 갖지 않는다.
export interface MovingEntity extends GameEntity {
    direction: number; // 현재 이동 방향 (라디안)
    directionChangeInMs: number; // 다음 방향 전환까지 남은 시간(ms)
}
