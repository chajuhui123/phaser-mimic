export type Role = 'player' | 'seeker' | 'npc';

export interface Vector3Tuple {
    x: number;
    y: number;
    z: number;
}

export interface GameEntity {
    id: string;
    role: Role;
    position: Vector3Tuple;
}
