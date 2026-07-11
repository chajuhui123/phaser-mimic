import { Role } from '../types';

const ROLE_APPEARANCE: Record<Role, { color: string; height: number; radius: number }> = {
    // 실제 게임에서는 도망자가 NPC와 구분되지 않아야 하지만, 디버그 모드에서 알아보기 쉽도록 별도 색을 쓴다.
    player: { color: '#4ade80', height: 1.0, radius: 0.3 },
    seeker: { color: '#e5484d', height: 1.1, radius: 0.35 },
    npc: { color: '#8f9bb3', height: 1.0, radius: 0.3 },
};

interface RoleGeometryProps {
    role: Role;
}

export function RoleGeometry({ role }: RoleGeometryProps) {
    const { color, height, radius } = ROLE_APPEARANCE[role];

    return (
        <mesh position={[0, height / 2, 0]}>
            {role === 'seeker' ? (
                <coneGeometry args={[radius, height, 12]} />
            ) : (
                <capsuleGeometry args={[radius, height - radius * 2, 4, 8]} />
            )}
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

export default RoleGeometry;
