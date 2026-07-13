import { useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useMovementFacing } from '../../entities/useMovementFacing';
import { DARK_ACCENT_COLOR } from './creatureAppearance';

const EASE_RATE = 6;
const GAIT_SPEED = 7;

interface CatCreatureProps {
    trackRef: RefObject<Group>;
    color: string;
}

// animal.jsx(공유 에셋)의 buildCat을 R3F 선언형 컴포넌트로 재구현.
// 원본의 원형 자동 배회 이동은 빼고, 실제 이동 여부에 따른 걷기 자세/꼬리 흔들림만 남긴다.
export function CatCreature({ trackRef, color }: CatCreatureProps) {
    const rootRef = useRef<Group>(null!);
    const bodyPivot = useRef<Group>(null!);
    const legFLPivot = useRef<Group>(null!);
    const legFRPivot = useRef<Group>(null!);
    const legBLPivot = useRef<Group>(null!);
    const legBRPivot = useRef<Group>(null!);
    const tailPivot1 = useRef<Group>(null!);
    const tailPivot2 = useRef<Group>(null!);

    const isMovingRef = useMovementFacing(trackRef);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;
        const easeFactor = Math.min(1, EASE_RATE * delta);

        if (isMovingRef.current) {
            const gait = t * GAIT_SPEED;
            legFLPivot.current.rotation.x = Math.sin(gait) * 0.45;
            legBRPivot.current.rotation.x = Math.sin(gait) * 0.45;
            legFRPivot.current.rotation.x = Math.sin(gait + Math.PI) * 0.45;
            legBLPivot.current.rotation.x = Math.sin(gait + Math.PI) * 0.45;
            bodyPivot.current.rotation.x = -0.12;
            bodyPivot.current.position.y = 0.22 + Math.abs(Math.sin(gait * 2)) * 0.01;
            tailPivot1.current.rotation.y = Math.sin(t * 2) * 0.35;
            tailPivot2.current.rotation.y = Math.sin(t * 2 + 0.6) * 0.4;
        } else {
            bodyPivot.current.rotation.x += (0 - bodyPivot.current.rotation.x) * easeFactor;
            bodyPivot.current.position.y += (0.26 - bodyPivot.current.position.y) * easeFactor;
            [legFLPivot, legFRPivot, legBLPivot, legBRPivot].forEach((pivot) => {
                pivot.current.rotation.x += (0 - pivot.current.rotation.x) * easeFactor;
            });
            tailPivot1.current.rotation.y = Math.sin(t) * 0.15;
            tailPivot2.current.rotation.y = Math.sin(t + 0.6) * 0.2;
        }
    });

    return (
        <group ref={rootRef}>
            <group ref={bodyPivot} position={[0, 0.26, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.34, 0.28, 0.68]} />
                    <meshStandardMaterial color={color} roughness={0.65} />
                </mesh>

                <mesh position={[0, 0.06, 0.42]}>
                    <boxGeometry args={[0.3, 0.28, 0.28]} />
                    <meshStandardMaterial color={color} roughness={0.65} />
                </mesh>

                {[-0.1, 0.1].map((x) => (
                    <mesh key={x} position={[x, 0.24, 0.36]} rotation={[0, 0, x < 0 ? 0.2 : -0.2]}>
                        <boxGeometry args={[0.09, 0.12, 0.03]} />
                        <meshStandardMaterial color={color} roughness={0.65} />
                    </mesh>
                ))}

                {[-0.09, 0.09].map((x) => (
                    <mesh key={x} position={[x, 0.08, 0.56]}>
                        <boxGeometry args={[0.045, 0.05, 0.02]} />
                        <meshStandardMaterial color={DARK_ACCENT_COLOR} roughness={0.4} />
                    </mesh>
                ))}

                <mesh position={[0, 0, 0.57]}>
                    <boxGeometry args={[0.04, 0.03, 0.02]} />
                    <meshStandardMaterial color="#ffb6c1" roughness={0.6} />
                </mesh>

                <group ref={tailPivot1} position={[0, 0.3, -0.34]}>
                    <mesh position={[0, 0, -0.11]}>
                        <boxGeometry args={[0.09, 0.09, 0.22]} />
                        <meshStandardMaterial color={color} roughness={0.65} />
                    </mesh>
                    <group ref={tailPivot2} position={[0, 0, -0.22]}>
                        <mesh position={[0, 0, -0.1]}>
                            <boxGeometry args={[0.08, 0.08, 0.2]} />
                            <meshStandardMaterial color={color} roughness={0.65} />
                        </mesh>
                    </group>
                </group>
            </group>

            <group ref={legFLPivot} position={[-0.12, 0.26, 0.24]}>
                <mesh position={[0, -0.13, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.26, 0.1]} />
                    <meshStandardMaterial color={color} roughness={0.65} />
                </mesh>
            </group>
            <group ref={legFRPivot} position={[0.12, 0.26, 0.24]}>
                <mesh position={[0, -0.13, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.26, 0.1]} />
                    <meshStandardMaterial color={color} roughness={0.65} />
                </mesh>
            </group>
            <group ref={legBLPivot} position={[-0.12, 0.26, -0.22]}>
                <mesh position={[0, -0.13, 0]} castShadow>
                    <boxGeometry args={[0.11, 0.26, 0.11]} />
                    <meshStandardMaterial color={color} roughness={0.65} />
                </mesh>
            </group>
            <group ref={legBRPivot} position={[0.12, 0.26, -0.22]}>
                <mesh position={[0, -0.13, 0]} castShadow>
                    <boxGeometry args={[0.11, 0.26, 0.11]} />
                    <meshStandardMaterial color={color} roughness={0.65} />
                </mesh>
            </group>
        </group>
    );
}

export default CatCreature;
