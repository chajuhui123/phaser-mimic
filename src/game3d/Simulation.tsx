import { useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, type Group } from 'three';
import { RoleGeometry } from './entities/RoleGeometry';
import { useKeyboardState } from './controls/useKeyboardState';
import { usePointerLookControls } from './controls/usePointerLookControls';
import { useAttackInput } from './combat/useAttackInput';
import { mockPlayer, mockSeeker, PLAYER_EYE_HEIGHT } from './mockData';
import { ATTACK_RANGE, MAP_BOUNDS, ROLE_SPEED, WARNING_RANGE, CONTRIBUTION_RATE_PER_SEC, clamp } from './constants';
import { ControllableRole } from './debug/useControlledRole';

const tmpForward = new Vector3();
const tmpRight = new Vector3();

interface SimulationProps {
    controlledRole: ControllableRole;
    hiderEliminated: boolean;
    npcGroupsRef: MutableRefObject<Map<string, Group>>;
    warningOverlayRef: MutableRefObject<HTMLDivElement | null>;
    onHiderHit: () => void;
    onNpcMisattack: () => void;
    onContribution: (amount: number) => void;
}

export function Simulation({
    controlledRole,
    hiderEliminated,
    npcGroupsRef,
    warningOverlayRef,
    onHiderHit,
    onNpcMisattack,
    onContribution,
}: SimulationProps) {
    const { camera } = useThree();
    const keysRef = useKeyboardState();
    const attackPendingRef = useAttackInput();
    usePointerLookControls();

    const playerRef = useRef<Group>(null!);
    const seekerRef = useRef<Group>(null!);

    useFrame((_, delta) => {
        const isHiderControlled = controlledRole === 'player' && !hiderEliminated;
        const activeGroup = controlledRole === 'player' ? playerRef.current : seekerRef.current;

        if (activeGroup && (controlledRole === 'seeker' || isHiderControlled)) {
            camera.getWorldDirection(tmpForward);
            tmpForward.y = 0;
            tmpForward.normalize();
            tmpRight.crossVectors(tmpForward, camera.up).normalize();

            const keys = keysRef.current;
            let moveX = 0;
            let moveZ = 0;
            if (keys.KeyW || keys.ArrowUp) {
                moveX += tmpForward.x;
                moveZ += tmpForward.z;
            }
            if (keys.KeyS || keys.ArrowDown) {
                moveX -= tmpForward.x;
                moveZ -= tmpForward.z;
            }
            if (keys.KeyD || keys.ArrowRight) {
                moveX += tmpRight.x;
                moveZ += tmpRight.z;
            }
            if (keys.KeyA || keys.ArrowLeft) {
                moveX -= tmpRight.x;
                moveZ -= tmpRight.z;
            }

            const length = Math.hypot(moveX, moveZ);
            if (length > 0) {
                const speed = ROLE_SPEED[controlledRole];
                const scale = (speed * delta) / length;
                activeGroup.position.x = clamp(activeGroup.position.x + moveX * scale, MAP_BOUNDS.minX, MAP_BOUNDS.maxX);
                activeGroup.position.z = clamp(activeGroup.position.z + moveZ * scale, MAP_BOUNDS.minZ, MAP_BOUNDS.maxZ);
            }

            camera.position.set(activeGroup.position.x, PLAYER_EYE_HEIGHT, activeGroup.position.z);
        }

        if (attackPendingRef.current) {
            attackPendingRef.current = false;
            if (controlledRole === 'seeker') {
                performAttack();
            }
        }

        if (isHiderControlled && playerRef.current && seekerRef.current) {
            const distance = playerRef.current.position.distanceTo(seekerRef.current.position);
            if (distance <= WARNING_RANGE) {
                const intensity = 1 - distance / WARNING_RANGE;
                if (warningOverlayRef.current) warningOverlayRef.current.style.opacity = String(intensity);
                onContribution(CONTRIBUTION_RATE_PER_SEC * intensity * delta);
            } else if (warningOverlayRef.current) {
                warningOverlayRef.current.style.opacity = '0';
            }
        } else if (warningOverlayRef.current) {
            warningOverlayRef.current.style.opacity = '0';
        }
    });

    function performAttack() {
        const seekerPosition = seekerRef.current.position;
        let nearestKind: 'hider' | 'npc' | null = null;
        let nearestDistance = ATTACK_RANGE;

        if (!hiderEliminated && playerRef.current) {
            const distance = seekerPosition.distanceTo(playerRef.current.position);
            if (distance <= nearestDistance) {
                nearestDistance = distance;
                nearestKind = 'hider';
            }
        }

        npcGroupsRef.current.forEach((group) => {
            const distance = seekerPosition.distanceTo(group.position);
            if (distance <= nearestDistance) {
                nearestDistance = distance;
                nearestKind = 'npc';
            }
        });

        if (nearestKind === 'hider') onHiderHit();
        else if (nearestKind === 'npc') onNpcMisattack();
    }

    return (
        <>
            <group ref={playerRef} position={[mockPlayer.position.x, mockPlayer.position.y, mockPlayer.position.z]}>
                {controlledRole !== 'player' && !hiderEliminated && <RoleGeometry role="player" />}
            </group>
            <group ref={seekerRef} position={[mockSeeker.position.x, mockSeeker.position.y, mockSeeker.position.z]}>
                {controlledRole !== 'seeker' && <RoleGeometry role="seeker" />}
            </group>
        </>
    );
}

export default Simulation;
