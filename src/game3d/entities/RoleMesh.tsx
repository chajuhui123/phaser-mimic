import { GameEntity, Role } from '../types';

const ROLE_APPEARANCE: Record<Exclude<Role, 'player'>, { color: string; height: number }> = {
    seeker: { color: '#e5484d', height: 1.8 },
    npc: { color: '#8f9bb3', height: 1.6 },
};

interface RoleMeshProps {
    entity: GameEntity;
}

export function RoleMesh({ entity }: RoleMeshProps) {
    if (entity.role === 'player') {
        return null;
    }

    const { color, height } = ROLE_APPEARANCE[entity.role];
    const { x, y, z } = entity.position;

    return (
        <group position={[x, y + height / 2, z]}>
            <mesh>
                {entity.role === 'seeker' ? (
                    <coneGeometry args={[0.6, height, 12]} />
                ) : (
                    <capsuleGeometry args={[0.5, height - 1, 4, 8]} />
                )}
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    );
}

export default RoleMesh;
