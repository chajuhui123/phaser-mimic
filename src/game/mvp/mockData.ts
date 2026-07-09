import { GameEntity, MovingEntity, Role } from './types';

export const MAP_WIDTH = 2048;
export const MAP_HEIGHT = 1536;

// 역할별 기본 이동 속도 (px/sec).
export const ROLE_SPEED: Record<Role, number> = {
    player: 220,
    seeker: 190,
    npc: 90,
};

// NPC/seeker가 자동 이동 중 방향을 바꾸기까지 걸리는 시간 범위 (ms).
const DIRECTION_CHANGE_INTERVAL_MS: [number, number] = [1200, 2600];

function randomDirection(): number {
    return Math.random() * Math.PI * 2;
}

export function randomDirectionChangeInterval(): number {
    const [min, max] = DIRECTION_CHANGE_INTERVAL_MS;
    return min + Math.random() * (max - min);
}

export const mockPlayer: GameEntity = {
    id: 'player-1',
    role: 'player',
    x: MAP_WIDTH / 2,
    y: MAP_HEIGHT / 2,
};

export const mockSeeker: GameEntity = {
    id: 'seeker-1',
    role: 'seeker',
    x: MAP_WIDTH / 2 + 260,
    y: MAP_HEIGHT / 2 - 140,
};

export const mockNpcs: GameEntity[] = [
    { id: 'npc-1', role: 'npc', x: MAP_WIDTH / 2 - 300, y: MAP_HEIGHT / 2 - 180 },
    { id: 'npc-2', role: 'npc', x: MAP_WIDTH / 2 - 120, y: MAP_HEIGHT / 2 + 220 },
    { id: 'npc-3', role: 'npc', x: MAP_WIDTH / 2 + 180, y: MAP_HEIGHT / 2 + 260 },
    { id: 'npc-4', role: 'npc', x: MAP_WIDTH / 2 + 360, y: MAP_HEIGHT / 2 + 60 },
    { id: 'npc-5', role: 'npc', x: MAP_WIDTH / 2 - 380, y: MAP_HEIGHT / 2 + 40 },
];

// Scene이 마운트될 때마다 mock 원본을 그대로 두고 새 mutable 상태를 만든다.
export function createPlayerState(): GameEntity {
    return { ...mockPlayer };
}

export function createAutoMovingEntities(): MovingEntity[] {
    return [mockSeeker, ...mockNpcs].map((entity) => ({
        ...entity,
        direction: randomDirection(),
        directionChangeInMs: randomDirectionChangeInterval(),
    }));
}
