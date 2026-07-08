import { GameEntity } from './types';

export const MAP_WIDTH = 2048;
export const MAP_HEIGHT = 1536;

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

// 1인칭 카메라는 player를 따라가지만, player 자신은 화면에 그리지 않는다.
export const visibleEntities: GameEntity[] = [mockSeeker, ...mockNpcs];
