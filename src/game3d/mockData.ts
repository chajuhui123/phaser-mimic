import { GameEntity } from './types';

export const PLAYER_EYE_HEIGHT = 1.6;

export const mockPlayer: GameEntity = {
    id: 'player-1',
    role: 'player',
    position: { x: 0, y: 0, z: 6 },
};

export const mockSeeker: GameEntity = {
    id: 'seeker-1',
    role: 'seeker',
    position: { x: 4, y: 0, z: -2 },
};

export const mockNpcs: GameEntity[] = [
    { id: 'npc-1', role: 'npc', position: { x: -6, y: 0, z: -4 } },
    { id: 'npc-2', role: 'npc', position: { x: -2, y: 0, z: 3 } },
    { id: 'npc-3', role: 'npc', position: { x: 6, y: 0, z: 4 } },
    { id: 'npc-4', role: 'npc', position: { x: 2, y: 0, z: -8 } },
];

export const mockEntities: GameEntity[] = [mockPlayer, mockSeeker, ...mockNpcs];
