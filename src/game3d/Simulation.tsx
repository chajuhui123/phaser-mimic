import { useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, type Group } from 'three';
import { BlockCharacter, BlockCharacterHandle } from './entities/BlockCharacter';
import { ROLE_PALETTE, TORSO_CENTER_Y } from './entities/characterAppearance';
import { ShootingEffects } from './combat/effects/ShootingEffects';
import { ShootingEffectsHandle } from './combat/effects/types';
import { useKeyboardState } from './controls/useKeyboardState';
import { useActionInput } from './combat/useActionInput';
import { mockPlayer, mockSeeker } from './mockData';
import {
    ATTACK_RANGE,
    CAMERA_BEHIND_OFFSET,
    CAMERA_HEIGHT_ABOVE_GROUND,
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
import { TransformedCreature } from './mission/TransformedCreature';
import { ActiveMission } from './mission/types';
import { MatchPhase } from './match/types';

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

    const playerRef = useRef<Group>(null!);
    const seekerRef = useRef<Group>(null!);
    const jumpElapsedMs = useRef<number | null>(null);
    const stillMs = useRef(0);
    const seekerCharacterRef = useRef<BlockCharacterHandle | null>(null);
    const effectsRef = useRef<ShootingEffectsHandle | null>(null);
    const tmpMissTarget = useRef(new Vector3());

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
            // 마우스로 시점을 돌리지 않는다. 이동 입력은 고정된 월드 축(화면 기준) 기준이다.
            const keys = keysRef.current;
            let moveX = 0;
            let moveZ = 0;
            if (keys.KeyW || keys.ArrowUp) moveZ -= 1;
            if (keys.KeyS || keys.ArrowDown) moveZ += 1;
            if (keys.KeyD || keys.ArrowRight) moveX += 1;
            if (keys.KeyA || keys.ArrowLeft) moveX -= 1;

            moveLength = Math.hypot(moveX, moveZ);
            if (moveLength > 0) {
                const speed = ROLE_SPEED[controlledRole];
                const scale = (speed * delta) / moveLength;
                activeGroup.position.x = clamp(activeGroup.position.x + moveX * scale, MAP_BOUNDS.minX, MAP_BOUNDS.maxX);
                activeGroup.position.z = clamp(activeGroup.position.z + moveZ * scale, MAP_BOUNDS.minZ, MAP_BOUNDS.maxZ);
            }

            // 카메라 방향은 절대 회전하지 않고 항상 정면(고정)을 본다.
            // 캐릭터의 뒷통수가 화면 아래쪽에 보이도록, 위치만 캐릭터를 살짝 뒤·위에서 따라간다.
            camera.position.set(
                activeGroup.position.x,
                CAMERA_HEIGHT_ABOVE_GROUND,
                activeGroup.position.z + CAMERA_BEHIND_OFFSET
            );
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
        let nearestPosition: Vector3 | null = null;

        if (!hiderEliminated && playerRef.current) {
            const distance = seekerPosition.distanceTo(playerRef.current.position);
            if (distance <= nearestDistance) {
                nearestDistance = distance;
                nearestKind = 'hider';
                nearestPosition = playerRef.current.position;
            }
        }

        npcGroupsRef.current.forEach((group) => {
            const distance = seekerPosition.distanceTo(group.position);
            if (distance <= nearestDistance) {
                nearestDistance = distance;
                nearestKind = 'npc';
                nearestPosition = group.position;
            }
        });

        const missTarget = nearestPosition
            ? null
            : camera.getWorldDirection(tmpMissTarget.current).multiplyScalar(ATTACK_RANGE).add(seekerPosition);
        const targetPosition = (nearestPosition ?? missTarget ?? seekerPosition).clone();
        // 발밑(그룹 원점)이 아니라 몸통 높이를 조준해야 총이 아래를 향하지 않는다.
        if (nearestPosition) targetPosition.y += TORSO_CENTER_Y;
        const hitColor = nearestKind === 'hider' ? ROLE_PALETTE.player.shirt : ROLE_PALETTE.npc.shirt;
        seekerCharacterRef.current?.triggerShoot({ to: targetPosition, hit: nearestKind !== null, color: hitColor });

        if (nearestKind === 'hider') onHiderHit();
        else if (nearestKind === 'npc') onNpcMisattack();
    }

    return (
        <>
            <group ref={playerRef} position={[mockPlayer.position.x, mockPlayer.position.y, mockPlayer.position.z]}>
                {!hiderEliminated &&
                    (isTransformed ? (
                        <TransformedCreature seed={transformSeed} trackRef={playerRef} />
                    ) : (
                        <BlockCharacter role="player" trackRef={playerRef} />
                    ))}
            </group>
            <group ref={seekerRef} position={[mockSeeker.position.x, mockSeeker.position.y, mockSeeker.position.z]}>
                <BlockCharacter ref={seekerCharacterRef} role="seeker" trackRef={seekerRef} effectsRef={effectsRef} />
            </group>
            <ShootingEffects ref={effectsRef} />
            {controlledRole === 'player' && activeMission?.kind === 'moveToZone' && activeMission.zonePosition && (
                <MissionZoneMarker position={activeMission.zonePosition} />
            )}
        </>
    );
}

export default Simulation;
