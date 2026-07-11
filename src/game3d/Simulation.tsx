import { useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, type Group } from 'three';
import { RoleGeometry } from './entities/RoleGeometry';
import { useKeyboardState } from './controls/useKeyboardState';
import { usePointerLookControls } from './controls/usePointerLookControls';
import { useActionInput } from './combat/useActionInput';
import { mockPlayer, mockSeeker, PLAYER_EYE_HEIGHT } from './mockData';
import {
    ATTACK_RANGE,
    HOLD_STILL_REQUIRED_MS,
    JUMP_DURATION_MS,
    JUMP_HEIGHT,
    MAP_BOUNDS,
    MISSION_ZONE_RADIUS,
    ROLE_SPEED,
    WARNING_RANGE,
    CONTRIBUTION_RATE_PER_SEC,
    clamp,
} from './constants';
import { ControllableRole } from './debug/useControlledRole';
import { MissionZoneMarker } from './mission/MissionZoneMarker';
import { TransformedGeometry } from './mission/TransformedGeometry';
import { ActiveMission } from './mission/types';
import { MatchPhase } from './match/types';

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
    activeMission: ActiveMission | null;
    isTransformed: boolean;
    transformSeed: number;
    onMissionTick: (deltaMs: number, hiderPosition: { x: number; z: number }) => void;
    onMissionComplete: () => void;
    matchPhase: MatchPhase;
    onMatchTick: (deltaMs: number) => void;
}

export function Simulation({
    controlledRole,
    hiderEliminated,
    npcGroupsRef,
    warningOverlayRef,
    onHiderHit,
    onNpcMisattack,
    onContribution,
    activeMission,
    isTransformed,
    transformSeed,
    onMissionTick,
    onMissionComplete,
    matchPhase,
    onMatchTick,
}: SimulationProps) {
    const { camera } = useThree();
    const keysRef = useKeyboardState();
    const actionPendingRef = useActionInput();
    usePointerLookControls();

    const playerRef = useRef<Group>(null!);
    const seekerRef = useRef<Group>(null!);
    const jumpElapsedMs = useRef<number | null>(null);
    const stillMs = useRef(0);

    useFrame((_, delta) => {
        onMatchTick(delta * 1000);

        if (matchPhase !== 'playing') {
            if (warningOverlayRef.current) warningOverlayRef.current.style.opacity = '0';
            return;
        }

        const isHiderControlled = controlledRole === 'player' && !hiderEliminated;
        const activeGroup = controlledRole === 'player' ? playerRef.current : seekerRef.current;
        let moveLength = 0;

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

            moveLength = Math.hypot(moveX, moveZ);
            if (moveLength > 0) {
                const speed = ROLE_SPEED[controlledRole];
                const scale = (speed * delta) / moveLength;
                activeGroup.position.x = clamp(activeGroup.position.x + moveX * scale, MAP_BOUNDS.minX, MAP_BOUNDS.maxX);
                activeGroup.position.z = clamp(activeGroup.position.z + moveZ * scale, MAP_BOUNDS.minZ, MAP_BOUNDS.maxZ);
            }

            camera.position.set(activeGroup.position.x, PLAYER_EYE_HEIGHT, activeGroup.position.z);
        }

        if (actionPendingRef.current) {
            actionPendingRef.current = false;
            if (controlledRole === 'seeker') {
                performAttack();
            } else if (isHiderControlled && jumpElapsedMs.current === null) {
                jumpElapsedMs.current = 0;
                if (activeMission?.kind === 'jump') onMissionComplete();
            }
        }

        if (jumpElapsedMs.current !== null && playerRef.current) {
            jumpElapsedMs.current += delta * 1000;
            const t = jumpElapsedMs.current / JUMP_DURATION_MS;
            if (t >= 1) {
                jumpElapsedMs.current = null;
                playerRef.current.position.y = mockPlayer.position.y;
            } else {
                playerRef.current.position.y = mockPlayer.position.y + Math.sin(Math.PI * t) * JUMP_HEIGHT;
            }
        }

        if (isHiderControlled && playerRef.current) {
            onMissionTick(delta * 1000, { x: playerRef.current.position.x, z: playerRef.current.position.z });

            if (activeMission?.kind === 'moveToZone' && activeMission.zonePosition) {
                const dx = playerRef.current.position.x - activeMission.zonePosition.x;
                const dz = playerRef.current.position.z - activeMission.zonePosition.z;
                if (Math.hypot(dx, dz) <= MISSION_ZONE_RADIUS) onMissionComplete();
            }

            if (activeMission?.kind === 'holdStill') {
                stillMs.current = moveLength > 0 ? 0 : stillMs.current + delta * 1000;
                if (stillMs.current >= HOLD_STILL_REQUIRED_MS) onMissionComplete();
            } else {
                stillMs.current = 0;
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
                {controlledRole !== 'player' &&
                    !hiderEliminated &&
                    (isTransformed ? <TransformedGeometry seed={transformSeed} /> : <RoleGeometry role="player" />)}
            </group>
            <group ref={seekerRef} position={[mockSeeker.position.x, mockSeeker.position.y, mockSeeker.position.z]}>
                {controlledRole !== 'seeker' && <RoleGeometry role="seeker" />}
            </group>
            {controlledRole === 'player' && activeMission?.kind === 'moveToZone' && activeMission.zonePosition && (
                <MissionZoneMarker position={activeMission.zonePosition} />
            )}
        </>
    );
}

export default Simulation;
