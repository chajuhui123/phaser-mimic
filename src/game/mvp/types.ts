export type Role = 'player' | 'seeker' | 'npc';

export interface GameEntity {
    id: string;
    role: Role;
    x: number;
    y: number;
}
