import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { GameEntity } from '../types';
import {
    MAP_BOUNDS,
    ROLE_SPEED,
    clamp,
    randomNpcDirection,
    randomNpcDirectionChangeInterval,
} from '../constants';
import { RoleGeometry } from './RoleGeometry';

interface NpcActorProps {
    entity: GameEntity;
}

export function NpcActor({ entity }: NpcActorProps) {
    const groupRef = useRef<Group>(null!);
    const direction = useRef(randomNpcDirection());
    const changeInMs = useRef(randomNpcDirectionChangeInterval());

    useFrame((_, delta) => {
        const group = groupRef.current;

        changeInMs.current -= delta * 1000;
        if (changeInMs.current <= 0) {
            direction.current = randomNpcDirection();
            changeInMs.current = randomNpcDirectionChangeInterval();
        }

        const step = ROLE_SPEED.npc * delta;
        group.position.x = clamp(
            group.position.x + Math.cos(direction.current) * step,
            MAP_BOUNDS.minX,
            MAP_BOUNDS.maxX
        );
        group.position.z = clamp(
            group.position.z + Math.sin(direction.current) * step,
            MAP_BOUNDS.minZ,
            MAP_BOUNDS.maxZ
        );
    });

    return (
        <group ref={groupRef} position={[entity.position.x, entity.position.y, entity.position.z]}>
            <RoleGeometry role="npc" />
        </group>
    );
}

export default NpcActor;
