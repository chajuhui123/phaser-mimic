import { useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { useMovementFacing } from '../../entities/useMovementFacing';
import { DARK_ACCENT_COLOR } from './creatureAppearance';

const EASE_RATE = 6;
const HOP_CYCLE_S = 0.6;

interface FrogCreatureProps {
    trackRef: RefObject<Group>;
    color: string;
}

// animal.jsx(공유 에셋)의 buildFrog를 R3F 선언형 컴포넌트로 재구현.
// 원본은 원을 그리며 멀리뛰기하는 자동 배회였지만, 실제 이동은 부모(trackRef)가 담당하므로
// 여기서는 이동 중일 때 제자리에서 뛰는 듯한 수직 홉 + 스쿼시/스트레치만 표현한다.
export function FrogCreature({ trackRef, color }: FrogCreatureProps) {
    const rootRef = useRef<Group>(null!);
    const bodyRef = useRef<Mesh>(null!);
    const legFLPivot = useRef<Group>(null!);
    const legFRPivot = useRef<Group>(null!);
    const legBLPivot = useRef<Group>(null!);
    const legBRPivot = useRef<Group>(null!);

    const isMovingRef = useMovementFacing(trackRef);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;
        const easeFactor = Math.min(1, EASE_RATE * delta);

        if (isMovingRef.current) {
            const localP = (t % HOP_CYCLE_S) / HOP_CYCLE_S;
            let height = 0;
            let squashY = 1;
            let squashXZ = 1;
            let legExtend = 0;

            if (localP < 0.15) {
                const p = localP / 0.15;
                squashY = 1 - 0.35 * p;
                squashXZ = 1 + 0.2 * p;
            } else if (localP < 0.7) {
                const p = (localP - 0.15) / 0.55;
                height = Math.sin(p * Math.PI) * 0.32;
                squashY = 1 + 0.15 * Math.sin(p * Math.PI);
                squashXZ = 1 - 0.08 * Math.sin(p * Math.PI);
                legExtend = Math.sin(p * Math.PI);
            } else {
                const p = (localP - 0.7) / 0.3;
                squashY = 0.65 + 0.35 * p;
                squashXZ = 1.2 - 0.2 * p;
            }

            rootRef.current.position.y = height;
            bodyRef.current.scale.set(squashXZ, squashY, squashXZ);
            legBLPivot.current.rotation.x = -legExtend * 0.9;
            legBRPivot.current.rotation.x = -legExtend * 0.9;
            legFLPivot.current.rotation.x = legExtend * 0.3;
            legFRPivot.current.rotation.x = legExtend * 0.3;
        } else {
            rootRef.current.position.y += (0 - rootRef.current.position.y) * easeFactor;
            bodyRef.current.scale.x += (1 - bodyRef.current.scale.x) * easeFactor;
            bodyRef.current.scale.y += (1 - bodyRef.current.scale.y) * easeFactor;
            bodyRef.current.scale.z += (1 - bodyRef.current.scale.z) * easeFactor;
            [legFLPivot, legFRPivot, legBLPivot, legBRPivot].forEach((pivot) => {
                pivot.current.rotation.x += (0 - pivot.current.rotation.x) * easeFactor;
            });
        }
    });

    return (
        <group ref={rootRef}>
            <mesh ref={bodyRef} position={[0, 0.22, 0]} castShadow>
                <boxGeometry args={[0.5, 0.26, 0.56]} />
                <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>

            <mesh position={[0, 0.09, 0.02]}>
                <boxGeometry args={[0.4, 0.06, 0.4]} />
                <meshStandardMaterial color="#e8e0c0" roughness={0.7} />
            </mesh>

            <mesh position={[0, 0.28, 0.34]}>
                <boxGeometry args={[0.42, 0.2, 0.24]} />
                <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>

            {[-0.14, 0.14].map((x) => (
                <group key={x}>
                    <mesh position={[x, 0.4, 0.34]}>
                        <boxGeometry args={[0.12, 0.12, 0.12]} />
                        <meshStandardMaterial color={color} roughness={0.6} />
                    </mesh>
                    <mesh position={[x, 0.4, 0.4]}>
                        <boxGeometry args={[0.05, 0.05, 0.02]} />
                        <meshStandardMaterial color={DARK_ACCENT_COLOR} roughness={0.4} />
                    </mesh>
                </group>
            ))}

            <group ref={legFLPivot} position={[-0.22, 0.16, 0.2]}>
                <mesh position={[0, -0.08, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.16, 0.1]} />
                    <meshStandardMaterial color={color} roughness={0.6} />
                </mesh>
            </group>
            <group ref={legFRPivot} position={[0.22, 0.16, 0.2]}>
                <mesh position={[0, -0.08, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.16, 0.1]} />
                    <meshStandardMaterial color={color} roughness={0.6} />
                </mesh>
            </group>
            <group ref={legBLPivot} position={[-0.26, 0.24, -0.18]}>
                <mesh position={[0, -0.12, 0]} castShadow>
                    <boxGeometry args={[0.16, 0.24, 0.16]} />
                    <meshStandardMaterial color={color} roughness={0.6} />
                </mesh>
            </group>
            <group ref={legBRPivot} position={[0.26, 0.24, -0.18]}>
                <mesh position={[0, -0.12, 0]} castShadow>
                    <boxGeometry args={[0.16, 0.24, 0.16]} />
                    <meshStandardMaterial color={color} roughness={0.6} />
                </mesh>
            </group>
        </group>
    );
}

export default FrogCreature;
