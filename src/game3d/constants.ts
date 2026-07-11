import { Role } from './types';

export const ROLE_SPEED: Record<Role, number> = {
    player: 4.5,
    seeker: 4.2,
    npc: 1.6,
};

export const MAP_BOUNDS = {
    minX: -20,
    maxX: 20,
    minZ: -20,
    maxZ: 20,
};

const NPC_DIRECTION_CHANGE_INTERVAL_MS: [number, number] = [1200, 2600];

export function randomNpcDirection(): number {
    return Math.random() * Math.PI * 2;
}

export function randomNpcDirectionChangeInterval(): number {
    const [min, max] = NPC_DIRECTION_CHANGE_INTERVAL_MS;
    return min + Math.random() * (max - min);
}

export const POINTER_LOOK_SENSITIVITY = 0.0025;
export const PITCH_LIMIT = Math.PI / 2 - 0.05;

export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}
