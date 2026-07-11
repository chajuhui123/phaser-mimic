import { GameEntity, Role } from '../types';

const ROLE_APPEARANCE: Record<Exclude<Role, 'player'>, { color: string; height: number; radius: number }> = {
    seeker: { color: '#e5484d', height: 1.1, radius: 0.35 },
    npc: { color: '#8f9bb3', height: 1.0, radius: 0.3 },
};

interface RoleMeshProps {
    entity: GameEntity;
}

export function RoleMesh({ entity }: RoleMeshProps) {
    if (entity.role === 'player') {
        return null;
    }

    const { color, height, radius } = ROLE_APPEARANCE[entity.role];
    const { x, y, z } = entity.position;

    return (
        <group position={[x, y + height / 2, z]}>
            <mesh>
                {entity.role === 'seeker' ? (
                    <coneGeometry args={[radius, height, 12]} />
                ) : (
                    <capsuleGeometry args={[radius, height - radius * 2, 4, 8]} />
                )}
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    );
}

export default RoleMesh;
