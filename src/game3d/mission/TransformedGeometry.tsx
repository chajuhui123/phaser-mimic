const TRANSFORM_COLORS = ['#f97316', '#a855f7', '#22d3ee', '#facc15'];

interface TransformedGeometryProps {
    seed: number;
}

// 미션 실패 시 "랜덤한 다른 생명체"를 색/형태 조합으로 단순하게 표현한다.
export function TransformedGeometry({ seed }: TransformedGeometryProps) {
    const color = TRANSFORM_COLORS[Math.floor(seed * TRANSFORM_COLORS.length) % TRANSFORM_COLORS.length];
    const useSphere = seed < 0.5;

    return (
        <mesh position={[0, 0.5, 0]}>
            {useSphere ? <sphereGeometry args={[0.5, 12, 12]} /> : <boxGeometry args={[0.7, 1, 0.7]} />}
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

export default TransformedGeometry;
