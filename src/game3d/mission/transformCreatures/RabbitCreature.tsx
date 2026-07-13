import { useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { useMovementFacing } from '../../entities/useMovementFacing';
import { DARK_ACCENT_COLOR } from './creatureAppearance';

const EASE_RATE = 6;
const HOP_CYCLE_SPEED = 8;
const HOP_HEIGHT = 0.22;

interface RabbitCreatureProps {
    trackRef: RefObject<Group>;
    color: string;
}

// animal.jsx(공유 에셋)의 buildRabbit을 R3F 선언형 컴포넌트로 재구현.
// 원본의 원형 자동 배회 이동은 빼고, 실제 이동 여부에 따른 제자리 홉/귀·다리 움직임만 남긴다.
export function RabbitCreature({ trackRef, color }: RabbitCreatureProps) {
    const rootRef = useRef<Group>(null!);
    const bodyRef = useRef<Mesh>(null!);
    const earLPivot = useRef<Group>(null!);
    const earRPivot = useRef<Group>(null!);
    const legFLPivot = useRef<Group>(null!);
    const legFRPivot = useRef<Group>(null!);
    const legBLPivot = useRef<Group>(null!);
    const legBRPivot = useRef<Group>(null!);

    const isMovingRef = useMovementFacing(trackRef);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;
        const easeFactor = Math.min(1, EASE_RATE * delta);

        if (isMovingRef.current) {
            const hop = Math.abs(Math.sin(t * HOP_CYCLE_SPEED));
            rootRef.current.position.y = hop * HOP_HEIGHT;
            earLPivot.current.rotation.x = -hop * 0.5;
            earRPivot.current.rotation.x = -hop * 0.5;
            legBLPivot.current.rotation.x = -hop * 0.7;
            legBRPivot.current.rotation.x = -hop * 0.7;
            legFLPivot.current.rotation.x = hop * 0.5;
            legFRPivot.current.rotation.x = hop * 0.5;
            bodyRef.current.scale.y = 1 - hop * 0.1;
        } else {
            rootRef.current.position.y += (0 - rootRef.current.position.y) * easeFactor;
            earLPivot.current.rotation.x += (0 - earLPivot.current.rotation.x) * easeFactor;
            earRPivot.current.rotation.x += (0 - earRPivot.current.rotation.x) * easeFactor;
            [legFLPivot, legFRPivot, legBLPivot, legBRPivot].forEach((pivot) => {
                pivot.current.rotation.x += (0 - pivot.current.rotation.x) * easeFactor;
            });
            bodyRef.current.scale.y += (1 - bodyRef.current.scale.y) * easeFactor;
            bodyRef.current.scale.x = 1 + Math.sin(t * 1.6) * 0.01;
        }
    });

    return (
        <group ref={rootRef}>
            <mesh ref={bodyRef} position={[0, 0.32, 0]} castShadow>
                <boxGeometry args={[0.5, 0.42, 0.72]} />
                <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>

            <mesh position={[0, 0.5, 0.42]} castShadow>
                <boxGeometry args={[0.36, 0.34, 0.34]} />
                <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>

            {[-0.11, 0.11].map((x, index) => (
                <group key={x} ref={index === 0 ? earLPivot : earRPivot} position={[x, 0.66, 0.36]}>
                    <mesh position={[0, 0.2, 0]}>
                        <boxGeometry args={[0.1, 0.4, 0.07]} />
                        <meshStandardMaterial color={color} roughness={0.7} />
                    </mesh>
                    <mesh position={[0, 0.2, 0.02]}>
                        <boxGeometry args={[0.06, 0.3, 0.03]} />
                        <meshStandardMaterial color="#ffb6c1" roughness={0.6} />
                    </mesh>
                </group>
            ))}

            {[-0.11, 0.11].map((x) => (
                <mesh key={x} position={[x, 0.52, 0.59]}>
                    <boxGeometry args={[0.05, 0.06, 0.02]} />
                    <meshStandardMaterial color={DARK_ACCENT_COLOR} roughness={0.4} />
                </mesh>
            ))}

            <mesh position={[0, 0.38, -0.4]}>
                <boxGeometry args={[0.16, 0.16, 0.14]} />
                <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>

            <group ref={legFLPivot} position={[-0.16, 0.2, 0.28]}>
                <mesh position={[0, -0.1, 0]} castShadow>
                    <boxGeometry args={[0.11, 0.2, 0.11]} />
                    <meshStandardMaterial color={color} roughness={0.7} />
                </mesh>
            </group>
            <group ref={legFRPivot} position={[0.16, 0.2, 0.28]}>
                <mesh position={[0, -0.1, 0]} castShadow>
                    <boxGeometry args={[0.11, 0.2, 0.11]} />
                    <meshStandardMaterial color={color} roughness={0.7} />
                </mesh>
            </group>
            <group ref={legBLPivot} position={[-0.18, 0.24, -0.2]}>
                <mesh position={[0, -0.12, 0]} castShadow>
                    <boxGeometry args={[0.15, 0.24, 0.15]} />
                    <meshStandardMaterial color={color} roughness={0.7} />
                </mesh>
            </group>
            <group ref={legBRPivot} position={[0.18, 0.24, -0.2]}>
                <mesh position={[0, -0.12, 0]} castShadow>
                    <boxGeometry args={[0.15, 0.24, 0.15]} />
                    <meshStandardMaterial color={color} roughness={0.7} />
                </mesh>
            </group>
        </group>
    );
}

export default RabbitCreature;
