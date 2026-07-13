import type { Vector3 } from 'three';

export interface FireShotInput {
    from: Vector3;
    to: Vector3;
    hit: boolean;
    color?: string;
}

export interface ShootingEffectsHandle {
    fireShot: (input: FireShotInput) => void;
}
