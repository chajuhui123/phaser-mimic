import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3 } from 'three';
import { Role } from '../types';
import { ShootingEffectsHandle } from '../combat/effects/types';
import { useMovementFacing } from './useMovementFacing';
import {
    CHARACTER_PROPORTIONS,
    EYE_COLOR,
    GUN_GEOMETRY,
    GUN_LOCAL_POSITION,
    HEAD_CENTER_Y,
    HIP_Y,
    ROLE_PALETTE,
    SHOULDER_Y,
    TORSO_CENTER_Y,
} from './characterAppearance';

const { LEG_H, LEG_W, LEG_D, TORSO_W, TORSO_H, TORSO_D, ARM_W, ARM_D, ARM_H, HEAD } = CHARACTER_PROPORTIONS;
const ARM_OFFSET_X = TORSO_W / 2 + ARM_W / 2;
const LEG_OFFSET_X = 0.14;
const EYE_OFFSET_X = 0.08;

const LIMB_EASE_RATE = 8;
const WALK_CYCLE_SPEED = 9;
const WALK_SWING_ANGLE = 0.55;
const RECOIL_DECAY_RATE = 6;
const RECOIL_ANGLE = 0.6;

export interface BlockCharacterHandle {
    triggerShoot: (input: { to: Vector3; hit: boolean; color?: string }) => void;
}

interface BlockCharacterProps {
    role: Role;
    trackRef: RefObject<Group>;
    effectsRef?: RefObject<ShootingEffectsHandle | null>;
    // trackRef가 움직이지 않을 때(예: 스플래시 배경의 정지된 캐릭터) 바라볼 방향을 강제한다.
    // 실제로 이동 중일 때는 이동 방향이 우선한다.
    facing?: number;
}

// character.jsx(공유 에셋)의 블록 리그 구조를 R3F 선언형 컴포넌트로 재구현한 기본 캐릭터.
export const BlockCharacter = forwardRef<BlockCharacterHandle, BlockCharacterProps>(function BlockCharacter(
    { role, trackRef, effectsRef, facing },
    ref
) {
    const palette = ROLE_PALETTE[role];

    const armLPivot = useRef<Group>(null!);
    const armRPivot = useRef<Group>(null!);
    const legLPivot = useRef<Group>(null!);
    const legRPivot = useRef<Group>(null!);
    const gunRef = useRef<Mesh>(null!);

    const recoilRef = useRef(0);
    const isMovingRef = useMovementFacing(trackRef, facing);

    const triggerShoot = useCallback(
        ({ to, hit, color }: { to: Vector3; hit: boolean; color?: string }) => {
            recoilRef.current = 1;
            const gun = gunRef.current;
            if (gun && effectsRef?.current) {
                const muzzle = new Vector3();
                gun.getWorldPosition(muzzle);
                effectsRef.current.fireShot({ from: muzzle, to, hit, color });
            }
        },
        [effectsRef]
    );

    useImperativeHandle(ref, () => ({ triggerShoot }), [triggerShoot]);

    useFrame((state, delta) => {
        const isWalking = isMovingRef.current;
        const easeFactor = Math.min(1, LIMB_EASE_RATE * delta);
        const animateArmR = role !== 'seeker';

        if (isWalking) {
            const swing = Math.sin(state.clock.elapsedTime * WALK_CYCLE_SPEED) * WALK_SWING_ANGLE;
            armLPivot.current.rotation.x = swing;
            if (animateArmR) armRPivot.current.rotation.x = -swing;
            legLPivot.current.rotation.x = -swing;
            legRPivot.current.rotation.x = swing;
        } else {
            armLPivot.current.rotation.x += (0 - armLPivot.current.rotation.x) * easeFactor;
            if (animateArmR) armRPivot.current.rotation.x += (0 - armRPivot.current.rotation.x) * easeFactor;
            legLPivot.current.rotation.x += (0 - legLPivot.current.rotation.x) * easeFactor;
            legRPivot.current.rotation.x += (0 - legRPivot.current.rotation.x) * easeFactor;
        }

        if (role === 'seeker' && recoilRef.current > 0) {
            recoilRef.current = Math.max(0, recoilRef.current - RECOIL_DECAY_RATE * delta);
            armRPivot.current.rotation.x = -recoilRef.current * RECOIL_ANGLE;
        }
    });

    return (
        <group>
            <mesh position={[0, TORSO_CENTER_Y, 0]} castShadow>
                <boxGeometry args={[TORSO_W, TORSO_H, TORSO_D]} />
                <meshStandardMaterial color={palette.shirt} />
            </mesh>

            <mesh position={[0, HEAD_CENTER_Y, 0]} castShadow>
                <boxGeometry args={[HEAD, HEAD, HEAD]} />
                <meshStandardMaterial color={palette.skin} />
            </mesh>
            <mesh position={[-EYE_OFFSET_X, HEAD_CENTER_Y + 0.02, HEAD / 2 + 0.006]}>
                <boxGeometry args={[0.05, 0.07, 0.02]} />
                <meshStandardMaterial color={EYE_COLOR} />
            </mesh>
            <mesh position={[EYE_OFFSET_X, HEAD_CENTER_Y + 0.02, HEAD / 2 + 0.006]}>
                <boxGeometry args={[0.05, 0.07, 0.02]} />
                <meshStandardMaterial color={EYE_COLOR} />
            </mesh>

            <group ref={armLPivot} position={[-ARM_OFFSET_X, SHOULDER_Y, 0]}>
                <mesh position={[0, -ARM_H / 2, 0]} castShadow>
                    <boxGeometry args={[ARM_W, ARM_H, ARM_D]} />
                    <meshStandardMaterial color={palette.skin} />
                </mesh>
            </group>
            <group ref={armRPivot} position={[ARM_OFFSET_X, SHOULDER_Y, 0]}>
                <mesh position={[0, -ARM_H / 2, 0]} castShadow>
                    <boxGeometry args={[ARM_W, ARM_H, ARM_D]} />
                    <meshStandardMaterial color={palette.skin} />
                </mesh>
                {role === 'seeker' && (
                    <mesh ref={gunRef} position={GUN_LOCAL_POSITION}>
                        <boxGeometry args={[GUN_GEOMETRY.width, GUN_GEOMETRY.height, GUN_GEOMETRY.length]} />
                        <meshStandardMaterial color="#2c2c2c" />
                    </mesh>
                )}
            </group>

            <group ref={legLPivot} position={[-LEG_OFFSET_X, HIP_Y, 0]}>
                <mesh position={[0, -LEG_H / 2, 0]} castShadow>
                    <boxGeometry args={[LEG_W, LEG_H, LEG_D]} />
                    <meshStandardMaterial color={palette.pants} />
                </mesh>
            </group>
            <group ref={legRPivot} position={[LEG_OFFSET_X, HIP_Y, 0]}>
                <mesh position={[0, -LEG_H / 2, 0]} castShadow>
                    <boxGeometry args={[LEG_W, LEG_H, LEG_D]} />
                    <meshStandardMaterial color={palette.pants} />
                </mesh>
            </group>
        </group>
    );
});

export default BlockCharacter;
